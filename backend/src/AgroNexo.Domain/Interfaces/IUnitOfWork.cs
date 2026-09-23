namespace AgroNexo.Domain.Interfaces;

/// <summary>
/// Unit of Work contract for coordinating transactional state persistence.
/// </summary>
public interface IUnitOfWork
{
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
