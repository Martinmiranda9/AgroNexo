using AgroNexo.Domain.Interfaces;
using AgroNexo.Infrastructure.Data;

namespace AgroNexo.Infrastructure.Repositories;

public class UnitOfWork : IUnitOfWork
{
    private readonly AgroNexoDbContext _context;

    public UnitOfWork(AgroNexoDbContext context)
    {
        _context = context;
    }

    public async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        return await _context.SaveChangesAsync(cancellationToken);
    }
}
