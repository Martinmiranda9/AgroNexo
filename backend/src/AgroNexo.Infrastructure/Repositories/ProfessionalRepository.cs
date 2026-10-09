using AgroNexo.Domain.Entities;
using AgroNexo.Domain.Enums;
using AgroNexo.Domain.Interfaces;
using AgroNexo.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using NetTopologySuite.Geometries;

namespace AgroNexo.Infrastructure.Repositories;

public class ProfessionalRepository : IProfessionalRepository
{
    private readonly AgroNexoDbContext _context;

    public ProfessionalRepository(AgroNexoDbContext context)
    {
        _context = context;
    }

    public async Task<Professional?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.Professionals
            .FirstOrDefaultAsync(p => p.Id == id && p.IsActive, cancellationToken);
    }

    public async Task<Professional?> GetByIdAcrossTenantsAsync(Guid id, CancellationToken cancellationToken = default)
    {
        // IgnoreQueryFilters is required because a Match links a Producer with a Professional of another tenant.
        return await _context.Professionals
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(p => p.Id == id && p.IsActive, cancellationToken);
    }

    public async Task<Professional?> GetByAuth0UserIdAsync(string auth0UserId, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(auth0UserId))
            return null;

        // IgnoreQueryFilters is required here: this lookup is what RESOLVES the tenant for a given
        // identity (TenantMiddleware, GetCurrentUserUseCase, duplicate-check on register), so it runs
        // before CurrentTenantId is known. With the tenant-scoped query filter applied, CurrentTenantId
        // defaults to Guid.Empty and this would never match any real row.
        var normalizedAuth0Id = auth0UserId.Trim();
        return await _context.Professionals
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(p => p.Auth0UserId == normalizedAuth0Id && p.IsActive, cancellationToken);
    }

    public async Task<Professional?> GetByTenantIdAsync(Guid tenantId, CancellationToken cancellationToken = default)
    {
        return await _context.Professionals
            .FirstOrDefaultAsync(p => p.TenantId == tenantId, cancellationToken);
    }

    public async Task<IReadOnlyList<Professional>> GetAllAsync(int pageNumber = 1, int pageSize = 20, CancellationToken cancellationToken = default)
    {
        return await _context.Professionals
            .OrderBy(p => p.LastName)
            .ThenBy(p => p.FirstName)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Professional>> FindCandidateProfessionalsAsync(
        Point? location,
        string? specialty,
        bool requiresFieldPresence,
        CancellationToken cancellationToken = default)
    {
        // IgnoreQueryFilters is required here because Producers (Tenant A) need to search for 
        // Professionals across all other tenants to form Matches.
        var query = _context.Professionals
            .IgnoreQueryFilters()
            .Where(p => p.IsActive);

        if (!string.IsNullOrWhiteSpace(specialty))
        {
            var normalizedSpecialty = specialty.Trim().ToLower();
            query = query.Where(p => p.Specialty.ToLower() == normalizedSpecialty);
        }

        var list = await query.ToListAsync(cancellationToken);

        if (requiresFieldPresence && location != null)
        {
            list = list.Where(p => p.CoverageArea != null && p.CoverageArea.Contains(location)).ToList();
        }

        return list;
    }

    public async Task<int> GetActiveMatchCountAsync(Guid professionalId, CancellationToken cancellationToken = default)
    {
        return await _context.Matches
            .CountAsync(m => m.ProfessionalId == professionalId && m.Status == MatchStatus.Active, cancellationToken);
    }

    public async Task<Professional> AddAsync(Professional professional, CancellationToken cancellationToken = default)
    {
        await _context.Professionals.AddAsync(professional, cancellationToken);
        return professional;
    }

    public Task UpdateAsync(Professional professional, CancellationToken cancellationToken = default)
    {
        _context.Professionals.Update(professional);
        return Task.CompletedTask;
    }
}
