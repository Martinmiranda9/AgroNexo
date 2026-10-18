using AgroNexo.Domain.Entities;
using AgroNexo.Domain.Interfaces;
using AgroNexo.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace AgroNexo.Infrastructure.Repositories;

/// <summary>
/// Las campañas no tienen filtro de tenant: el campo es del tenant del productor y también lo leen profesionales de
/// otros tenants. El permiso sobre el campo lo valida la capa de aplicación.
/// </summary>
public class CampaignRepository : ICampaignRepository
{
    private readonly AgroNexoDbContext _context;

    public CampaignRepository(AgroNexoDbContext context)
    {
        _context = context;
    }

    public async Task<Campaign?> GetByIdAsync(Guid farmId, Guid campaignId, CancellationToken cancellationToken = default)
    {
        return await _context.Campaigns.FirstOrDefaultAsync(c => c.Id == campaignId && c.FarmId == farmId, cancellationToken);
    }

    public async Task<IReadOnlyList<Campaign>> GetByFarmAsync(Guid farmId, CancellationToken cancellationToken = default)
    {
        return await _context.Campaigns
            .Where(c => c.FarmId == farmId)
            .OrderByDescending(c => c.StartsOn)
            .ToListAsync(cancellationToken);
    }

    public async Task<bool> NameExistsAsync(Guid farmId, string name, Guid? excludeId = null, CancellationToken cancellationToken = default)
    {
        var trimmed = name.Trim();
        return await _context.Campaigns.AnyAsync(
            c => c.FarmId == farmId && c.Name == trimmed && (excludeId == null || c.Id != excludeId),
            cancellationToken);
    }

    public async Task AddAsync(Campaign campaign, CancellationToken cancellationToken = default)
    {
        await _context.Campaigns.AddAsync(campaign, cancellationToken);
    }

    public void Remove(Campaign campaign)
    {
        _context.Campaigns.Remove(campaign);
    }
}
