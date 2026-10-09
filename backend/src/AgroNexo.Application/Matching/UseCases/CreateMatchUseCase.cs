using AgroNexo.Application.Common.Interfaces;
using AgroNexo.Application.Matching.DTOs;
using AgroNexo.Domain.Entities;
using AgroNexo.Domain.Exceptions;
using AgroNexo.Domain.Interfaces;
using AgroNexo.Domain.ValueObjects;

namespace AgroNexo.Application.Matching.UseCases;

/// <summary>
/// Handles Match creation between a Producer and a Professional.
/// Enforces business uniqueness rule: a producer cannot invite the same professional twice while a match is pending/active.
/// Allows a producer to have multiple matches with different professionals of the same or different specialties.
/// </summary>
public class CreateMatchUseCase : ICreateMatchUseCase
{
    private readonly IMatchRepository _matchRepository;
    private readonly IProducerRepository _producerRepository;
    private readonly IProfessionalRepository _professionalRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IOwnershipValidator _ownershipValidator;

    public CreateMatchUseCase(
        IMatchRepository matchRepository,
        IProducerRepository producerRepository,
        IProfessionalRepository professionalRepository,
        IUnitOfWork unitOfWork,
        IOwnershipValidator ownershipValidator)
    {
        _matchRepository = matchRepository;
        _producerRepository = producerRepository;
        _professionalRepository = professionalRepository;
        _unitOfWork = unitOfWork;
        _ownershipValidator = ownershipValidator;
    }

    public async Task<MatchResponse> ExecuteByAuth0UserIdAsync(
        CreateMatchRequest request,
        string auth0UserId,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(auth0UserId))
            throw new DomainValidationException(nameof(auth0UserId), "El identificador de usuario es obligatorio.");

        var producer = await _producerRepository.GetByAuth0UserIdAsync(auth0UserId, cancellationToken);
        if (producer == null)
            throw new EntityNotFoundException("Productor", auth0UserId);

        return await ExecuteAsync(request, producer.Id, auth0UserId, cancellationToken);
    }

    public async Task<MatchResponse> ExecuteAsync(
        CreateMatchRequest request,
        Guid producerId,
        string auth0UserId,
        CancellationToken cancellationToken = default)
    {
        if (request == null)
            throw new ArgumentNullException(nameof(request));

        if (producerId == Guid.Empty)
            throw new DomainValidationException(nameof(producerId), "El ProducerId es obligatorio.");

        if (request.ProfessionalId == Guid.Empty)
            throw new DomainValidationException(nameof(request.ProfessionalId), "El ProfessionalId es obligatorio.");

        // 1. Verify Producer exists and belongs to the authenticated user
        var producer = await _ownershipValidator.GetOwnedProducerOrThrowAsync(producerId, auth0UserId, cancellationToken);

        // 2. Verify Professional exists
        var professional = await _professionalRepository.GetByIdAcrossTenantsAsync(request.ProfessionalId, cancellationToken);
        if (professional == null)
            throw new EntityNotFoundException("Profesional", request.ProfessionalId);

        // 3. Verify no active or pending match exists for this exact (ProducerId, ProfessionalId) pair
        bool hasConflict = await _matchRepository.HasActiveOrPendingMatchAsync(producerId, request.ProfessionalId, cancellationToken);
        if (hasConflict)
        {
            throw new DuplicateMatchException(producerId, request.ProfessionalId);
        }

        // 4. Create and persist new Match, with the need brief the producer wrote (validated by the value object)
        var needBrief = request.NeedBrief == null
            ? null
            : new NeedBrief(
                request.NeedBrief.Summary,
                request.NeedBrief.PlaceLabel,
                request.NeedBrief.Hectares,
                request.NeedBrief.Urgency,
                request.NeedBrief.Topics,
                request.NeedBrief.Crops);

        var match = new Match(producerId, request.ProfessionalId, needBrief);
        await _matchRepository.AddAsync(match, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return new MatchResponse
        {
            Id = match.Id,
            ProducerId = producer.Id,
            ProducerName = $"{producer.FirstName} {producer.LastName}".Trim(),
            ProfessionalId = professional.Id,
            ProfessionalName = $"{professional.FirstName} {professional.LastName}".Trim(),
            Specialty = professional.Specialty,
            Status = match.Status,
            RequestedAt = match.RequestedAt,
            RespondedAt = match.RespondedAt,
            NeedBrief = NeedBriefResponse.From(match.NeedBrief)
        };
    }
}
