using AgroConnect.Domain.Entities;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace AgroConnect.Application.Common.Interfaces;

public interface IOwnershipValidator
{
    Task<Producer> GetOwnedProducerOrThrowAsync(Guid producerId, string auth0UserId, CancellationToken cancellationToken = default);
    Task<Professional> GetOwnedProfessionalOrThrowAsync(Guid professionalId, string auth0UserId, Guid tenantId, CancellationToken cancellationToken = default);
    Task<MatchDiscoveryRequest> GetOwnedDiscoveryRequestOrThrowAsync(Guid discoveryRequestId, string auth0UserId, CancellationToken cancellationToken = default);
}
