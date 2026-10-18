using AgroNexo.Application.Common.Interfaces;
using AgroNexo.Domain.Entities;
using AgroNexo.Domain.Exceptions;
using AgroNexo.Domain.Interfaces;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace AgroNexo.Application.Common.Validators;

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

    public async Task<Producer> GetOwnedProducerOrThrowAsync(Guid producerId, string firebaseUid, CancellationToken cancellationToken = default)
    {
        var producer = await _producerRepository.GetByIdAsync(producerId, cancellationToken);
        if (producer is null || producer.FirebaseUid != firebaseUid)
            throw new CrossTenantAccessException($"Producer {producerId} no pertenece al usuario autenticado");
        return producer;
    }

    public async Task<Professional> GetOwnedProfessionalOrThrowAsync(Guid professionalId, string firebaseUid, Guid tenantId, CancellationToken cancellationToken = default)
    {
        var professional = await _professionalRepository.GetByIdAsync(professionalId, cancellationToken);
        if (professional is null || professional.FirebaseUid != firebaseUid || professional.TenantId != tenantId)
            throw new CrossTenantAccessException($"Professional {professionalId} no pertenece al tenant/usuario actual");
        return professional;
    }

    public async Task<MatchDiscoveryRequest> GetOwnedDiscoveryRequestOrThrowAsync(Guid discoveryRequestId, string firebaseUid, CancellationToken cancellationToken = default)
    {
        var request = await _matchDiscoveryRepository.GetByIdWithRecommendationsAsync(discoveryRequestId, cancellationToken);
        if (request is null)
            throw new EntityNotFoundException("MatchDiscoveryRequest", discoveryRequestId);
            
        var producer = await _producerRepository.GetByIdAsync(request.ProducerId, cancellationToken);
        if (producer is null || producer.FirebaseUid != firebaseUid)
            throw new CrossTenantAccessException($"MatchDiscoveryRequest {discoveryRequestId} no pertenece al usuario autenticado");
            
        return request;
    }
}
