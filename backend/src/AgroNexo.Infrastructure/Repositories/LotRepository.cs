using AgroNexo.Domain.Entities;
using AgroNexo.Domain.Interfaces;
using AgroNexo.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace AgroNexo.Infrastructure.Repositories;

/// <summary>
/// Lotes del campo, sin filtro de tenant (ver <see cref="CampaignRepository"/>); el borrado lógico se aplica con el
/// filtro global de <see cref="Lot"/>.
/// </summary>
public class LotRepository : ILotRepository
{
    private readonly AgroNexoDbContext _context;

    public LotRepository(AgroNexoDbContext context)
    {
        _context = context;
    }

    private IQueryable<Lot> LotsWithCrops => _context.Lots.Include(l => l.Crops);

    public async Task<Lot?> GetByIdAsync(Guid farmId, Guid lotId, CancellationToken cancellationToken = default)
    {
        return await LotsWithCrops.FirstOrDefaultAsync(l => l.Id == lotId && l.FarmId == farmId, cancellationToken);
    }

    public async Task<IReadOnlyList<Lot>> GetByFarmAsync(Guid farmId, CancellationToken cancellationToken = default)
    {
        return await LotsWithCrops
            .Where(l => l.FarmId == farmId)
            .OrderBy(l => l.Name)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyDictionary<Guid, string>> GetNamesAsync(IReadOnlyCollection<Guid> lotIds, CancellationToken cancellationToken = default)
    {
        if (lotIds.Count == 0)
            return new Dictionary<Guid, string>();

        return await _context.Lots
            .IgnoreQueryFilters()
            .Where(l => lotIds.Contains(l.Id))
            .ToDictionaryAsync(l => l.Id, l => l.Name, cancellationToken);
    }

    public async Task<bool> NameExistsAsync(Guid farmId, string name, Guid? excludeId = null, CancellationToken cancellationToken = default)
    {
        var normalized = name.Trim().ToLower();
        return await _context.Lots.AnyAsync(
            l => l.FarmId == farmId && l.Name.ToLower() == normalized && (excludeId == null || l.Id != excludeId),
            cancellationToken);
    }

    public async Task<bool> AnyCropInCampaignAsync(Guid campaignId, CancellationToken cancellationToken = default)
    {
        return await _context.Lots.AnyAsync(l => l.Crops.Any(c => c.CampaignId == campaignId), cancellationToken);
    }

    public async Task AddAsync(Lot lot, CancellationToken cancellationToken = default)
    {
        await _context.Lots.AddAsync(lot, cancellationToken);
    }

    public async Task AddCropAsync(LotCrop lotCrop, CancellationToken cancellationToken = default)
    {
        await _context.LotCrops.AddAsync(lotCrop, cancellationToken);
    }

    public void RemoveCrop(LotCrop lotCrop)
    {
        _context.LotCrops.Remove(lotCrop);
    }
}
