using AgroNexo.Domain.Entities;
using AgroNexo.Domain.Interfaces;
using AgroNexo.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace AgroNexo.Infrastructure.Repositories;

public class MatchDiscoveryRepository : IMatchDiscoveryRepository
{
    private readonly AgroNexoDbContext _context;

    public MatchDiscoveryRepository(AgroNexoDbContext context)
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
