using AgroNexo.Domain.Entities;

namespace AgroNexo.Domain.Interfaces;

/// <summary>
/// Repository interface for Farm aggregates.
/// </summary>
public interface IFarmRepository
{
    Task<Farm?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);

    /// <summary>
    /// Campo de cualquier tenant (solo los no borrados). Lo usan los flujos de equipo, donde el profesional mira un
    /// campo del tenant del productor; el permiso lo decide quien llama, no el filtro global.
    /// </summary>
    Task<Farm?> GetByIdAcrossTenantsAsync(Guid id, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Farm>> GetByProducerIdAsync(Guid producerId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Farm>> GetByTenantIdAsync(Guid tenantId, CancellationToken cancellationToken = default);
    Task<Farm> AddAsync(Farm farm, CancellationToken cancellationToken = default);
    Task UpdateAsync(Farm farm, CancellationToken cancellationToken = default);
}
