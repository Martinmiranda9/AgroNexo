using AgroNexo.Application.Common.Interfaces;
using AgroNexo.Application.Common.Models;
using AgroNexo.Application.Matching.DTOs;
using AgroNexo.Domain.Entities;
using AgroNexo.Domain.Enums;
using AgroNexo.Domain.Interfaces;

namespace AgroNexo.Application.Matching.UseCases;

/// <summary>
/// Retrieves paginated matches according to filter criteria and cross-tenant ownership.
/// </summary>
public class GetMatchesUseCase : IGetMatchesUseCase
{
    private readonly IMatchRepository _matchRepository;
    private readonly IProducerRepository _producerRepository;
    private readonly IProfessionalRepository _professionalRepository;
    private readonly IOwnershipValidator _ownershipValidator;
    private readonly ITenantContext _tenantContext;

    public GetMatchesUseCase(
        IMatchRepository matchRepository,
        IProducerRepository producerRepository,
        IProfessionalRepository professionalRepository,
        IOwnershipValidator ownershipValidator,
        ITenantContext tenantContext)
    {
        _matchRepository = matchRepository;
        _producerRepository = producerRepository;
        _professionalRepository = professionalRepository;
        _ownershipValidator = ownershipValidator;
        _tenantContext = tenantContext;
    }

    public async Task<PagedResult<MatchResponse>> ExecuteForUserAsync(
        string auth0UserId,
        MatchFilterRequest filter,
        CancellationToken cancellationToken = default)
    {
        filter ??= new MatchFilterRequest();

        // Check if user is Producer or Professional to scope query automatically
        var producer = await _producerRepository.GetByAuth0UserIdAsync(auth0UserId, cancellationToken);
        if (producer != null)
        {
            filter.ProducerId = producer.Id;
        }
        else
        {
            var professional = await _professionalRepository.GetByAuth0UserIdAsync(auth0UserId, cancellationToken);
            if (professional != null)
            {
                filter.ProfessionalId = professional.Id;
            }
        }

        return await ExecuteAsync(filter, auth0UserId, cancellationToken);
    }

    public async Task<PagedResult<MatchResponse>> ExecuteAsync(
        MatchFilterRequest filter,
        string auth0UserId,
        CancellationToken cancellationToken = default)
    {
        filter ??= new MatchFilterRequest();

        if (filter.ProducerId.HasValue)
        {
            await _ownershipValidator.GetOwnedProducerOrThrowAsync(filter.ProducerId.Value, auth0UserId, cancellationToken);
        }
        
        if (filter.ProfessionalId.HasValue)
        {
            await _ownershipValidator.GetOwnedProfessionalOrThrowAsync(filter.ProfessionalId.Value, auth0UserId, _tenantContext.TenantId, cancellationToken);
        }

        if (!filter.ProducerId.HasValue && !filter.ProfessionalId.HasValue)
        {
            // If neither is provided, force it to only get matches for the current user's entity
            return await ExecuteForUserAsync(auth0UserId, filter, cancellationToken);
        }

        var matches = await _matchRepository.GetByFiltersAsync(
            filter.ProducerId,
            filter.ProfessionalId,
            filter.Status,
            filter.PageNumber,
            filter.PageSize,
            cancellationToken);

        var responses = new List<MatchResponse>();

        foreach (var match in matches)
        {
            string producerName = "Productor";
            MatchContactResponse? producerContact = null;
            string professionalName = "Profesional";
            string specialty = string.Empty;

            // El contacto del productor solo se comparte con el profesional invitado y una vez aceptado el pedido.
            bool shareProducerContact = match.Status == MatchStatus.Active && filter.ProfessionalId.HasValue;

            var producerEntity = match.Producer
                ?? await _producerRepository.GetByIdAsync(match.ProducerId, cancellationToken);
            if (producerEntity != null)
            {
                producerName = $"{producerEntity.FirstName} {producerEntity.LastName}".Trim();
                if (shareProducerContact)
                    producerContact = new MatchContactResponse
                    {
                        PhoneNumber = producerEntity.PhoneNumber,
                        Email = producerEntity.Email
                    };
            }

            if (match.Professional != null)
            {
                professionalName = $"{match.Professional.FirstName} {match.Professional.LastName}".Trim();
                specialty = match.Professional.Specialty;
            }
            else
            {
                var prof = await _professionalRepository.GetByIdAcrossTenantsAsync(match.ProfessionalId, cancellationToken);
                if (prof != null)
                {
                    professionalName = $"{prof.FirstName} {prof.LastName}".Trim();
                    specialty = prof.Specialty;
                }
            }

            responses.Add(new MatchResponse
            {
                Id = match.Id,
                ProducerId = match.ProducerId,
                ProducerName = producerName,
                ProfessionalId = match.ProfessionalId,
                ProfessionalName = professionalName,
                Specialty = specialty,
                Status = match.Status,
                RequestedAt = match.RequestedAt,
                RespondedAt = match.RespondedAt,
                NeedBrief = NeedBriefResponse.From(match.NeedBrief),
                ProducerContact = producerContact
            });
        }

        return new PagedResult<MatchResponse>(responses, responses.Count, filter.PageNumber, filter.PageSize);
    }
}
