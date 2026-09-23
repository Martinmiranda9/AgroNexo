using AgroConnect.Domain.Entities;
using AgroConnect.Domain.Interfaces;
using AgroConnect.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace AgroConnect.Infrastructure.Repositories;

public class FarmRepository : IFarmRepository
{
    private readonly AgroConnectDbContext _context;

    public FarmRepository(AgroConnectDbContext context)
    {
        _context = context;
    }

    public async Task<Farm?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.Farms
            .FirstOrDefaultAsync(f => f.Id == id, cancellationToken);
    }

    public async Task<IReadOnlyList<Farm>> GetByProducerIdAsync(Guid producerId, CancellationToken cancellationToken = default)
    {
        return await _context.Farms
            .Where(f => f.ProducerId == producerId)
            .OrderBy(f => f.Name)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Farm>> GetByTenantIdAsync(Guid tenantId, CancellationToken cancellationToken = default)
    {
        return await _context.Farms
            .Where(f => f.TenantId == tenantId)
            .OrderBy(f => f.Name)
            .ToListAsync(cancellationToken);
    }

    public async Task<Farm> AddAsync(Farm farm, CancellationToken cancellationToken = default)
    {
        await _context.Farms.AddAsync(farm, cancellationToken);
        return farm;
    }

    public Task UpdateAsync(Farm farm, CancellationToken cancellationToken = default)
    {
        _context.Farms.Update(farm);
        return Task.CompletedTask;
    }
}
