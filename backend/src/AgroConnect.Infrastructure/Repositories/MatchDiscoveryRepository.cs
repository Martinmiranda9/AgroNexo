using AgroConnect.Domain.Entities;
using AgroConnect.Domain.Interfaces;
using AgroConnect.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace AgroConnect.Infrastructure.Repositories;

public class MatchDiscoveryRepository : IMatchDiscoveryRepository
{
    private readonly AgroConnectDbContext _context;

    public MatchDiscoveryRepository(AgroConnectDbContext context)
    {
        _context = context;
    }

    public async Task<MatchDiscoveryRequest?> GetByIdWithRecommendationsAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.MatchDiscoveryRequests
            .Include(r => r.Recommendations.OrderBy(rec => rec.RankPosition))
                .ThenInclude(rec => rec.Professional)
            // IgnoreQueryFilters is required because the included Professional may belong to another tenant.
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(r => r.Id == id, cancellationToken);
    }

    public async Task<MatchDiscoveryRequest> AddAsync(MatchDiscoveryRequest request, CancellationToken cancellationToken = default)
    {
        await _context.MatchDiscoveryRequests.AddAsync(request, cancellationToken);
        return request;
    }

    public async Task AddRecommendationsAsync(IEnumerable<MatchRecommendation> recommendations, CancellationToken cancellationToken = default)
    {
        await _context.MatchRecommendations.AddRangeAsync(recommendations, cancellationToken);
    }
}
