using AgroConnect.Domain.Entities;
using NetTopologySuite.Geometries;

namespace AgroConnect.Domain.Interfaces;

/// <summary>
/// Repository interface for Professional aggregates.
/// Includes support for cross-tenant spatial discovery and workload querying.
/// </summary>
public interface IProfessionalRepository
{
    Task<Professional?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<Professional?> GetByAuth0UserIdAsync(string auth0UserId, CancellationToken cancellationToken = default);
    Task<Professional?> GetByTenantIdAsync(Guid tenantId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Professional>> GetAllAsync(int pageNumber = 1, int pageSize = 20, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Professional>> FindCandidateProfessionalsAsync(Point? location, string? specialty, bool requiresFieldPresence, CancellationToken cancellationToken = default);
    Task<int> GetActiveMatchCountAsync(Guid professionalId, CancellationToken cancellationToken = default);
    Task<Professional> AddAsync(Professional professional, CancellationToken cancellationToken = default);
    Task UpdateAsync(Professional professional, CancellationToken cancellationToken = default);
}
