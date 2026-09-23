using AgroConnect.Domain.Interfaces;
using AgroConnect.Infrastructure.Data;

namespace AgroConnect.Infrastructure.Repositories;

public class UnitOfWork : IUnitOfWork
{
    private readonly AgroConnectDbContext _context;

    public UnitOfWork(AgroConnectDbContext context)
    {
        _context = context;
    }

    public async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        return await _context.SaveChangesAsync(cancellationToken);
    }
}
