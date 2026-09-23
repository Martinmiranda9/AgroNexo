using AgroNexo.Domain.Entities;
using AgroNexo.Domain.Interfaces;
using AgroNexo.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace AgroNexo.Infrastructure.Repositories;

public class TenantRepository : ITenantRepository
{
    private readonly AgroNexoDbContext _context;

    public TenantRepository(AgroNexoDbContext context)
    {
        _context = context;
    }

    public async Task<Tenant?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.Tenants
            .FirstOrDefaultAsync(t => t.Id == id, cancellationToken);
    }

    public async Task<Tenant?> GetByNameAsync(string name, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(name))
            return null;

        var normalizedName = name.Trim().ToLower();
        return await _context.Tenants
            .FirstOrDefaultAsync(t => t.Name.ToLower() == normalizedName, cancellationToken);
    }

    public async Task<Tenant> AddAsync(Tenant tenant, CancellationToken cancellationToken = default)
    {
        await _context.Tenants.AddAsync(tenant, cancellationToken);
        return tenant;
    }

    public Task UpdateAsync(Tenant tenant, CancellationToken cancellationToken = default)
    {
        _context.Tenants.Update(tenant);
        return Task.CompletedTask;
    }
}
