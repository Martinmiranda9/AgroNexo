using AgroConnect.Domain.Entities;

namespace AgroConnect.Domain.Interfaces;

/// <summary>
/// Repository interface for Producer aggregates.
/// </summary>
public interface IProducerRepository
{
    Task<Producer?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<Producer?> GetByAuth0UserIdAsync(string auth0UserId, CancellationToken cancellationToken = default);
    Task<Producer?> GetByTenantIdAsync(Guid tenantId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Producer>> GetAllAsync(int pageNumber = 1, int pageSize = 20, CancellationToken cancellationToken = default);
    Task<Producer> AddAsync(Producer producer, CancellationToken cancellationToken = default);
    Task UpdateAsync(Producer producer, CancellationToken cancellationToken = default);
}
