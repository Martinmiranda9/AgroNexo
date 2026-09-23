using AgroConnect.Domain.Entities;
using AgroConnect.Domain.Enums;

namespace AgroConnect.Domain.Interfaces;

/// <summary>
/// Repository interface for Match aggregate roots.
/// Operates across tenants to manage producer-professional relationships.
/// </summary>
public interface IMatchRepository
{
    Task<Match?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<Match?> GetByPairAsync(Guid producerId, Guid professionalId, CancellationToken cancellationToken = default);
    Task<bool> HasActiveOrPendingMatchAsync(Guid producerId, Guid professionalId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Match>> GetByProducerIdAsync(Guid producerId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Match>> GetByProfessionalIdAsync(Guid professionalId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Match>> GetByFiltersAsync(Guid? producerId, Guid? professionalId, MatchStatus? status, int pageNumber = 1, int pageSize = 20, CancellationToken cancellationToken = default);
    Task<Match> AddAsync(Match match, CancellationToken cancellationToken = default);
    Task UpdateAsync(Match match, CancellationToken cancellationToken = default);
}
