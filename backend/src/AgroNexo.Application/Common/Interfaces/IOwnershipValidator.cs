using AgroNexo.Domain.Entities;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace AgroNexo.Application.Common.Interfaces;

public interface IOwnershipValidator
{
    Task<Producer> GetOwnedProducerOrThrowAsync(Guid producerId, string firebaseUid, CancellationToken cancellationToken = default);
    Task<Professional> GetOwnedProfessionalOrThrowAsync(Guid professionalId, string firebaseUid, Guid tenantId, CancellationToken cancellationToken = default);
    Task<MatchDiscoveryRequest> GetOwnedDiscoveryRequestOrThrowAsync(Guid discoveryRequestId, string firebaseUid, CancellationToken cancellationToken = default);
}
