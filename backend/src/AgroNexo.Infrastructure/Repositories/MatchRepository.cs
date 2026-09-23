using AgroNexo.Domain.Entities;
using AgroNexo.Domain.Enums;
using AgroNexo.Domain.Interfaces;
using AgroNexo.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace AgroNexo.Infrastructure.Repositories;

public class MatchRepository : IMatchRepository
{
    private readonly AgroNexoDbContext _context;

    public MatchRepository(AgroNexoDbContext context)
    {
        _context = context;
    }

    public async Task<Match?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.Matches
            .Include(m => m.Producer)
            .Include(m => m.Professional)
            // IgnoreQueryFilters is required because Match spans multiple tenants and its navigation properties belong to different tenants.
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(m => m.Id == id, cancellationToken);
    }

    public async Task<Match?> GetByPairAsync(Guid producerId, Guid professionalId, CancellationToken cancellationToken = default)
    {
        return await _context.Matches
            .Include(m => m.Producer)
            .Include(m => m.Professional)
            // IgnoreQueryFilters is required because Match spans multiple tenants and its navigation properties belong to different tenants.
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(m => m.ProducerId == producerId && m.ProfessionalId == professionalId, cancellationToken);
    }

    public async Task<bool> HasActiveOrPendingMatchAsync(Guid producerId, Guid professionalId, CancellationToken cancellationToken = default)
    {
        return await _context.Matches
            // IgnoreQueryFilters is required because Match spans multiple tenants and its navigation properties belong to different tenants.
            .IgnoreQueryFilters()
            .AnyAsync(m => m.ProducerId == producerId &&
                           m.ProfessionalId == professionalId &&
                           (m.Status == MatchStatus.Pending || m.Status == MatchStatus.Active),
                      cancellationToken);
    }

    public async Task<IReadOnlyList<Match>> GetByProducerIdAsync(Guid producerId, CancellationToken cancellationToken = default)
    {
        return await _context.Matches
            .Include(m => m.Professional)
            // IgnoreQueryFilters is required because Match spans multiple tenants and its navigation properties belong to different tenants.
            .IgnoreQueryFilters()
            .Where(m => m.ProducerId == producerId)
            .OrderByDescending(m => m.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Match>> GetByProfessionalIdAsync(Guid professionalId, CancellationToken cancellationToken = default)
    {
        return await _context.Matches
            .Include(m => m.Producer)
            // IgnoreQueryFilters is required because Match spans multiple tenants and its navigation properties belong to different tenants.
            .IgnoreQueryFilters()
            .Where(m => m.ProfessionalId == professionalId)
            .OrderByDescending(m => m.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Match>> GetByFiltersAsync(
        Guid? producerId,
        Guid? professionalId,
        MatchStatus? status,
        int pageNumber = 1,
        int pageSize = 20,
        CancellationToken cancellationToken = default)
    {
        var query = _context.Matches
            .Include(m => m.Producer)
            .Include(m => m.Professional)
            // IgnoreQueryFilters is required because Match spans multiple tenants and its navigation properties belong to different tenants.
            .IgnoreQueryFilters()
            .AsQueryable();

        if (producerId.HasValue && producerId.Value != Guid.Empty)
        {
            query = query.Where(m => m.ProducerId == producerId.Value);
        }

        if (professionalId.HasValue && professionalId.Value != Guid.Empty)
        {
            query = query.Where(m => m.ProfessionalId == professionalId.Value);
        }

        if (status.HasValue)
        {
            query = query.Where(m => m.Status == status.Value);
        }

        return await query
            .OrderByDescending(m => m.CreatedAt)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);
    }

    public async Task<Match> AddAsync(Match match, CancellationToken cancellationToken = default)
    {
        await _context.Matches.AddAsync(match, cancellationToken);
        return match;
    }

    public Task UpdateAsync(Match match, CancellationToken cancellationToken = default)
    {
        _context.Matches.Update(match);
        return Task.CompletedTask;
    }
}
