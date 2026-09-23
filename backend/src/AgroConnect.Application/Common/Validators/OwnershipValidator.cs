using AgroConnect.Application.Common.Interfaces;
using AgroConnect.Domain.Entities;
using AgroConnect.Domain.Exceptions;
using AgroConnect.Domain.Interfaces;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace AgroConnect.Application.Common.Validators;

public class OwnershipValidator : IOwnershipValidator
{
    private readonly IProducerRepository _producerRepository;
    private readonly IProfessionalRepository _professionalRepository;
    private readonly IMatchDiscoveryRepository _matchDiscoveryRepository;

    public OwnershipValidator(
        IProducerRepository producerRepository,
        IProfessionalRepository professionalRepository,
        IMatchDiscoveryRepository matchDiscoveryRepository)
    {
        _producerRepository = producerRepository;
        _professionalRepository = professionalRepository;
        _matchDiscoveryRepository = matchDiscoveryRepository;
    }

    public async Task<Producer> GetOwnedProducerOrThrowAsync(Guid producerId, string auth0UserId, CancellationToken cancellationToken = default)
    {
        var producer = await _producerRepository.GetByIdAsync(producerId, cancellationToken);
        if (producer is null || producer.Auth0UserId != auth0UserId)
            throw new CrossTenantAccessException($"Producer {producerId} no pertenece al usuario autenticado");
        return producer;
    }

    public async Task<Professional> GetOwnedProfessionalOrThrowAsync(Guid professionalId, string auth0UserId, Guid tenantId, CancellationToken cancellationToken = default)
    {
        var professional = await _professionalRepository.GetByIdAsync(professionalId, cancellationToken);
        if (professional is null || professional.Auth0UserId != auth0UserId || professional.TenantId != tenantId)
            throw new CrossTenantAccessException($"Professional {professionalId} no pertenece al tenant/usuario actual");
        return professional;
    }

    public async Task<MatchDiscoveryRequest> GetOwnedDiscoveryRequestOrThrowAsync(Guid discoveryRequestId, string auth0UserId, CancellationToken cancellationToken = default)
    {
        var request = await _matchDiscoveryRepository.GetByIdWithRecommendationsAsync(discoveryRequestId, cancellationToken);
        if (request is null)
            throw new EntityNotFoundException("MatchDiscoveryRequest", discoveryRequestId);
            
        var producer = await _producerRepository.GetByIdAsync(request.ProducerId, cancellationToken);
        if (producer is null || producer.Auth0UserId != auth0UserId)
            throw new CrossTenantAccessException($"MatchDiscoveryRequest {discoveryRequestId} no pertenece al usuario autenticado");
            
        return request;
    }
}
