using AgroNexo.Application.Common.Helpers;
using AgroNexo.Application.Matching.DTOs;
using AgroNexo.Application.Matching.ScoringEngine;
using AgroNexo.Domain.Entities;
using AgroNexo.Domain.Exceptions;
using AgroNexo.Domain.Interfaces;

namespace AgroNexo.Application.Matching.UseCases;

/// <summary>
/// Executes the two-stage match discovery process:
/// 1. Geographic and specialty candidate filtering (PostGIS).
/// 2. Deterministic composite scoring and ranking (ScoringEngine).
/// </summary>
public class GenerateMatchRecommendationsUseCase : IGenerateMatchRecommendationsUseCase
{
    private readonly IProducerRepository _producerRepository;
    private readonly IProfessionalRepository _professionalRepository;
    private readonly IMatchDiscoveryRepository _matchDiscoveryRepository;
    private readonly IScoringEngine _scoringEngine;
    private readonly IUnitOfWork _unitOfWork;

    public GenerateMatchRecommendationsUseCase(
        IProducerRepository producerRepository,
        IProfessionalRepository professionalRepository,
        IMatchDiscoveryRepository matchDiscoveryRepository,
        IScoringEngine scoringEngine,
        IUnitOfWork unitOfWork)
    {
        _producerRepository = producerRepository;
        _professionalRepository = professionalRepository;
        _matchDiscoveryRepository = matchDiscoveryRepository;
        _scoringEngine = scoringEngine;
        _unitOfWork = unitOfWork;
    }

    public async Task<MatchDiscoveryResponse> ExecuteByAuth0UserIdAsync(
        CreateMatchDiscoveryRequest request,
        string auth0UserId,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(auth0UserId))
            throw new DomainValidationException(nameof(auth0UserId), "El identificador de usuario es obligatorio.");

        var producer = await _producerRepository.GetByAuth0UserIdAsync(auth0UserId, cancellationToken);
        if (producer == null)
            throw new EntityNotFoundException("Productor", auth0UserId);

        return await ExecuteAsync(request, producer.Id, cancellationToken);
    }

    public async Task<MatchDiscoveryResponse> ExecuteAsync(
        CreateMatchDiscoveryRequest request,
        Guid producerId,
        CancellationToken cancellationToken = default)
    {
        if (request == null)
            throw new ArgumentNullException(nameof(request));

        if (producerId == Guid.Empty)
            throw new DomainValidationException(nameof(producerId), "El ProducerId es obligatorio.");

        var producer = await _producerRepository.GetByIdAsync(producerId, cancellationToken);
        if (producer == null)
            throw new EntityNotFoundException("Productor", producerId);

        // 1. Create PostGIS Point from request coordinates
        var locationPoint = GeometryHelper.CreatePoint(request.Latitude, request.Longitude);

        // 2. Fetch candidate professionals from repository (handles spatial ST_Contains & specialty filters)
        var candidates = await _professionalRepository.FindCandidateProfessionalsAsync(
            locationPoint,
            request.RequestedSpecialty,
            request.RequiresFieldPresence,
            cancellationToken);

        // 3. Prepare scoring candidate models with live workload and geodesic distances
        var candidateDict = candidates.ToDictionary(c => c.Id);
        var scoringCandidates = new List<ScoringCandidate>();

        foreach (var candidate in candidates)
        {
            int activeMatches = await _professionalRepository.GetActiveMatchCountAsync(candidate.Id, cancellationToken);
            double distanceKm = GeoDistanceCalculator.CalculateDistanceKm(locationPoint, candidate.CoverageArea);

            scoringCandidates.Add(new ScoringCandidate
            {
                ProfessionalId = candidate.Id,
                FirstName = candidate.FirstName,
                LastName = candidate.LastName,
                Role = candidate.Role,
                Specialty = candidate.Specialty,
                YearsExperience = candidate.YearsExperience,
                MaxCapacity = candidate.MaxCapacity,
                IsVerified = candidate.IsVerified,
                ActiveMatches = activeMatches,
                DistanceKm = distanceKm
            });
        }

        // 4. Score and Rank candidates
        var criteria = new ScoringCriteria
        {
            RequestedSpecialty = request.RequestedSpecialty,
            RequiresFieldPresence = request.RequiresFieldPresence,
            MaxRadiusKm = 100.0
        };

        var rankedResults = _scoringEngine.RankCandidates(scoringCandidates, criteria);

        // 5. Build Aggregate and persist recommendations
        var discoveryRequest = new MatchDiscoveryRequest(
            producer.Id,
            locationPoint,
            request.RequestedSpecialty ?? string.Empty,
            request.RequiresFieldPresence);

        var recommendationResponses = new List<MatchRecommendationResponse>();

        for (int i = 0; i < rankedResults.Count; i++)
        {
            var result = rankedResults[i];
            int rankPosition = i + 1;
            var recommendation = discoveryRequest.AddRecommendation(result.ProfessionalId, result.TotalScore, rankPosition);

            if (candidateDict.TryGetValue(result.ProfessionalId, out var professional))
            {
                recommendationResponses.Add(new MatchRecommendationResponse
                {
                    Id = recommendation.Id,
                    ProfessionalId = result.ProfessionalId,
                    FirstName = professional.FirstName,
                    LastName = professional.LastName,
                    Role = professional.Role,
                    Specialty = professional.Specialty,
                    YearsExperience = professional.YearsExperience,
                    IsVerified = professional.IsVerified,
                    MaxCapacity = result.MaxCapacity,
                    ActiveMatches = result.ActiveMatches,
                    DistanceKm = Math.Round(result.DistanceKm, 2),
                    Score = result.TotalScore,
                    RankPosition = rankPosition
                });
            }
        }

        await _matchDiscoveryRepository.AddAsync(discoveryRequest, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return new MatchDiscoveryResponse
        {
            Id = discoveryRequest.Id,
            ProducerId = producer.Id,
            Latitude = request.Latitude,
            Longitude = request.Longitude,
            RequestedSpecialty = discoveryRequest.RequestedSpecialty,
            RequiresFieldPresence = discoveryRequest.RequiresFieldPresence,
            CreatedAt = discoveryRequest.CreatedAt,
            Recommendations = recommendationResponses
        };
    }
}
