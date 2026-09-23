using AgroNexo.Application.Matching.DTOs;
using AgroNexo.Domain.Entities;
using AgroNexo.Domain.Enums;
using AgroNexo.Domain.Exceptions;
using AgroNexo.Domain.Interfaces;

namespace AgroNexo.Application.Matching.UseCases;

/// <summary>
/// Executes authorized lifecycle state changes on a Match aggregate.
/// Enforces domain rules for transitions and validates participant permissions.
/// </summary>
public class UpdateMatchStatusUseCase : IUpdateMatchStatusUseCase
{
    private readonly IMatchRepository _matchRepository;
    private readonly IProducerRepository _producerRepository;
    private readonly IProfessionalRepository _professionalRepository;
    private readonly IUnitOfWork _unitOfWork;

    public UpdateMatchStatusUseCase(
        IMatchRepository matchRepository,
        IProducerRepository producerRepository,
        IProfessionalRepository professionalRepository,
        IUnitOfWork unitOfWork)
    {
        _matchRepository = matchRepository;
        _producerRepository = producerRepository;
        _professionalRepository = professionalRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<MatchResponse> ExecuteAsync(
        Guid matchId,
        UpdateMatchStatusRequest request,
        string? auth0UserId = null,
        CancellationToken cancellationToken = default)
    {
        if (matchId == Guid.Empty)
            throw new DomainValidationException(nameof(matchId), "El identificador del match es obligatorio.");

        if (request == null)
            throw new ArgumentNullException(nameof(request));

        var match = await _matchRepository.GetByIdAsync(matchId, cancellationToken);
        if (match == null)
            throw new EntityNotFoundException("Match", matchId);

        // Cross-tenant authorization check if auth0UserId is supplied
        if (!string.IsNullOrWhiteSpace(auth0UserId))
        {
            var producer = await _producerRepository.GetByAuth0UserIdAsync(auth0UserId, cancellationToken);
            var professional = await _professionalRepository.GetByAuth0UserIdAsync(auth0UserId, cancellationToken);

            bool isProducerOwner = producer != null && producer.Id == match.ProducerId;
            bool isProfessionalOwner = professional != null && professional.Id == match.ProfessionalId;

            if (!isProducerOwner && !isProfessionalOwner)
            {
                throw new CrossTenantAccessException(
                    $"El usuario '{auth0UserId}' no tiene permisos sobre este Match.");
            }
        }

        // Apply domain state transition
        switch (request.Status)
        {
            case MatchStatus.Active:
                match.Accept();
                break;

            case MatchStatus.Rejected:
                match.Reject();
                break;

            case MatchStatus.Cancelled:
                match.Cancel();
                break;

            case MatchStatus.Completed:
                match.Complete();
                break;

            default:
                throw new DomainValidationException(nameof(request.Status), $"El estado '{request.Status}' no es un destino de transición válido.");
        }

        await _matchRepository.UpdateAsync(match, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var prod = await _producerRepository.GetByIdAsync(match.ProducerId, cancellationToken);
        var prof = await _professionalRepository.GetByIdAsync(match.ProfessionalId, cancellationToken);

        return new MatchResponse
        {
            Id = match.Id,
            ProducerId = match.ProducerId,
            ProducerName = prod != null ? $"{prod.FirstName} {prod.LastName}".Trim() : string.Empty,
            ProfessionalId = match.ProfessionalId,
            ProfessionalName = prof != null ? $"{prof.FirstName} {prof.LastName}".Trim() : string.Empty,
            Specialty = prof?.Specialty ?? string.Empty,
            Status = match.Status,
            RequestedAt = match.RequestedAt,
            RespondedAt = match.RespondedAt
        };
    }
}
