using AgroNexo.Domain.Entities;

namespace AgroNexo.Domain.Interfaces;

/// <summary>
/// Repository interface for MatchDiscoveryRequest aggregates and recommendations.
/// </summary>
public interface IMatchDiscoveryRepository
{
    Task<MatchDiscoveryRequest?> GetByIdWithRecommendationsAsync(Guid id, CancellationToken cancellationToken = default);
    Task<MatchDiscoveryRequest> AddAsync(MatchDiscoveryRequest request, CancellationToken cancellationToken = default);
    Task AddRecommendationsAsync(IEnumerable<MatchRecommendation> recommendations, CancellationToken cancellationToken = default);
}
