using AgroConnect.Domain.Entities;

namespace AgroConnect.Domain.Interfaces;

/// <summary>
/// Repository interface for Farm aggregates.
/// </summary>
public interface IFarmRepository
{
    Task<Farm?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Farm>> GetByProducerIdAsync(Guid producerId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Farm>> GetByTenantIdAsync(Guid tenantId, CancellationToken cancellationToken = default);
    Task<Farm> AddAsync(Farm farm, CancellationToken cancellationToken = default);
    Task UpdateAsync(Farm farm, CancellationToken cancellationToken = default);
}
