using AgroNexo.Domain.Entities;
using AgroNexo.Domain.Interfaces;
using AgroNexo.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace AgroNexo.Infrastructure.Repositories;

public class ProducerRepository : IProducerRepository
{
    private readonly AgroNexoDbContext _context;

    public ProducerRepository(AgroNexoDbContext context)
    {
        _context = context;
    }

    public async Task<Producer?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.Producers
            .Include(p => p.Farms)
            .FirstOrDefaultAsync(p => p.Id == id && p.IsActive, cancellationToken);
    }

    public async Task<Producer?> GetByAuth0UserIdAsync(string auth0UserId, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(auth0UserId))
            return null;

        var normalizedAuth0Id = auth0UserId.Trim();
        return await _context.Producers
            .FirstOrDefaultAsync(p => p.Auth0UserId == normalizedAuth0Id && p.IsActive, cancellationToken);
    }

    public async Task<Producer?> GetByTenantIdAsync(Guid tenantId, CancellationToken cancellationToken = default)
    {
        return await _context.Producers
            .FirstOrDefaultAsync(p => p.TenantId == tenantId, cancellationToken);
    }

    public async Task<IReadOnlyList<Producer>> GetAllAsync(int pageNumber = 1, int pageSize = 20, CancellationToken cancellationToken = default)
    {
        return await _context.Producers
            .OrderBy(p => p.LastName)
            .ThenBy(p => p.FirstName)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);
    }

    public async Task<Producer> AddAsync(Producer producer, CancellationToken cancellationToken = default)
    {
        await _context.Producers.AddAsync(producer, cancellationToken);
        return producer;
    }

    public Task UpdateAsync(Producer producer, CancellationToken cancellationToken = default)
    {
        _context.Producers.Update(producer);
        return Task.CompletedTask;
    }
}
