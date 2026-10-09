using AgroNexo.Application.Common.Interfaces;
using AgroNexo.Application.Matching.DTOs;
using AgroNexo.Domain.Entities;
using AgroNexo.Domain.Interfaces;

namespace AgroNexo.Application.Matching.UseCases;

/// <summary>
/// Retrieves previously computed match recommendations ordered by ranking.
/// </summary>
public class GetMatchRecommendationsUseCase : IGetMatchRecommendationsUseCase
{
    private readonly IMatchDiscoveryRepository _matchDiscoveryRepository;
    private readonly IProfessionalRepository _professionalRepository;
    private readonly IOwnershipValidator _ownershipValidator;

    public GetMatchRecommendationsUseCase(
        IMatchDiscoveryRepository matchDiscoveryRepository,
        IProfessionalRepository professionalRepository,
        IOwnershipValidator ownershipValidator)
    {
        _matchDiscoveryRepository = matchDiscoveryRepository;
        _professionalRepository = professionalRepository;
        _ownershipValidator = ownershipValidator;
    }

    public async Task<MatchDiscoveryResponse?> ExecuteAsync(Guid discoveryRequestId, string auth0UserId, CancellationToken cancellationToken = default)
    {
        if (discoveryRequestId == Guid.Empty)
            return null;

        var discoveryRequest = await _ownershipValidator.GetOwnedDiscoveryRequestOrThrowAsync(discoveryRequestId, auth0UserId, cancellationToken);
        if (discoveryRequest == null)
            return null;

        var recommendationResponses = new List<MatchRecommendationResponse>();
        var orderedRecommendations = discoveryRequest.Recommendations.OrderBy(r => r.RankPosition).ToList();

        foreach (var rec in orderedRecommendations)
        {
            var professional = await _professionalRepository.GetByIdAcrossTenantsAsync(rec.ProfessionalId, cancellationToken);
            if (professional != null)
            {
                recommendationResponses.Add(new MatchRecommendationResponse
                {
                    Id = rec.Id,
                    ProfessionalId = rec.ProfessionalId,
                    FirstName = professional.FirstName,
                    LastName = professional.LastName,
                    Role = professional.Role,
                    Specialty = professional.Specialty,
                    YearsExperience = professional.YearsExperience,
                    IsVerified = professional.IsVerified,
                    MaxCapacity = professional.MaxCapacity,
                    Score = rec.Score,
                    RankPosition = rec.RankPosition
                });
            }
        }

        return new MatchDiscoveryResponse
        {
            Id = discoveryRequest.Id,
            ProducerId = discoveryRequest.ProducerId,
            Latitude = discoveryRequest.LocationPoint.Y,
            Longitude = discoveryRequest.LocationPoint.X,
            RequestedSpecialty = discoveryRequest.RequestedSpecialty,
            RequiresFieldPresence = discoveryRequest.RequiresFieldPresence,
            CreatedAt = discoveryRequest.CreatedAt,
            Recommendations = recommendationResponses
        };
    }
}
