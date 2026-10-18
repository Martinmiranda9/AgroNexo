using AgroNexo.Domain.Entities;
using AgroNexo.Domain.Enums;
using AgroNexo.Domain.Interfaces;
using AgroNexo.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace AgroNexo.Infrastructure.Repositories;

/// <summary>
/// Actividades del campo, sin filtro de tenant (ver <see cref="CampaignRepository"/>).
/// </summary>
public class FarmActivityRepository : IFarmActivityRepository
{
    private readonly AgroNexoDbContext _context;

    public FarmActivityRepository(AgroNexoDbContext context)
    {
        _context = context;
    }

    public async Task<FarmActivity?> GetByIdAsync(Guid farmId, Guid activityId, CancellationToken cancellationToken = default)
    {
        return await _context.FarmActivities.FirstOrDefaultAsync(a => a.Id == activityId && a.FarmId == farmId, cancellationToken);
    }

    public async Task<(IReadOnlyList<FarmActivity> Items, int TotalCount)> GetPagedAsync(
        Guid farmId,
        Guid? campaignId,
        Guid? lotId,
        FarmActivityStatus? status,
        int pageNumber,
        int pageSize,
        CancellationToken cancellationToken = default)
    {
        var query = _context.FarmActivities.AsNoTracking().Where(a => a.FarmId == farmId);
        if (campaignId.HasValue) query = query.Where(a => a.CampaignId == campaignId);
        if (lotId.HasValue) query = query.Where(a => a.LotId == lotId);
        if (status.HasValue) query = query.Where(a => a.Status == status);

        var total = await query.CountAsync(cancellationToken);
        var items = await query
            .OrderByDescending(a => a.Date)
            .ThenByDescending(a => a.CreatedAt)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return (items, total);
    }

    public async Task<IReadOnlyList<FarmActivity>> GetFieldLaborsAsync(Guid farmId, Guid campaignId, CancellationToken cancellationToken = default)
    {
        var laborTypes = new[]
        {
            FarmActivityType.Sowing, FarmActivityType.Spraying, FarmActivityType.Fertilization,
            FarmActivityType.Harvest, FarmActivityType.Tillage
        };

        return await _context.FarmActivities
            .AsNoTracking()
            .Where(a => a.FarmId == farmId && a.CampaignId == campaignId && a.LotId != null && laborTypes.Contains(a.Type))
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<FarmActivity>> GetTouchedSinceAsync(Guid farmId, DateTime sinceUtc, CancellationToken cancellationToken = default)
    {
        return await _context.FarmActivities
            .AsNoTracking()
            .Where(a => a.FarmId == farmId && (a.CreatedAt >= sinceUtc || (a.CompletedAt != null && a.CompletedAt >= sinceUtc)))
            .OrderByDescending(a => a.CompletedAt ?? a.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<int> CountOpenAsync(Guid farmId, Guid? campaignId, CancellationToken cancellationToken = default)
    {
        return await _context.FarmActivities.CountAsync(
            a => a.FarmId == farmId
                && a.Status != FarmActivityStatus.Completed
                && (campaignId == null || a.CampaignId == campaignId),
            cancellationToken);
    }

    public async Task<bool> AnyInCampaignAsync(Guid campaignId, CancellationToken cancellationToken = default)
    {
        return await _context.FarmActivities.AnyAsync(a => a.CampaignId == campaignId, cancellationToken);
    }

    public async Task AddAsync(FarmActivity activity, CancellationToken cancellationToken = default)
    {
        await _context.FarmActivities.AddAsync(activity, cancellationToken);
    }

    public void Remove(FarmActivity activity)
    {
        _context.FarmActivities.Remove(activity);
    }
}
