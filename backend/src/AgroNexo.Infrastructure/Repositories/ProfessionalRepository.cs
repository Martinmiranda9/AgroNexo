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

    public async Task<IReadOnlyDictionary<Guid, Professional>> GetByIdsAcrossTenantsAsync(IReadOnlyCollection<Guid> ids, CancellationToken cancellationToken = default)
    {
        if (ids.Count == 0)
            return new Dictionary<Guid, Professional>();

        return await _context.Professionals
            .IgnoreQueryFilters()
            .AsNoTracking()
            .Where(p => ids.Contains(p.Id) && p.IsActive)
            .ToDictionaryAsync(p => p.Id, cancellationToken);
    }

    public async Task<Professional?> GetByFirebaseUidAsync(string firebaseUid, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(firebaseUid))
            return null;

        // IgnoreQueryFilters is required here: this lookup is what RESOLVES the tenant for a given
        // identity (TenantMiddleware, GetCurrentUserUseCase, duplicate-check on register), so it runs
        // before CurrentTenantId is known. With the tenant-scoped query filter applied, CurrentTenantId
        // defaults to Guid.Empty and this would never match any real row.
        var normalizedFirebaseUid = firebaseUid.Trim();
        return await _context.Professionals
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(p => p.FirebaseUid == normalizedFirebaseUid && p.IsActive, cancellationToken);
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

        // La zona de cobertura se filtra en PostGIS (ST_Contains, con el índice GIST de CoverageArea) y no en memoria:
        // así no se traen a la API todos los profesionales de la especialidad para descartar casi todos.
        if (requiresFieldPresence && location != null)
        {
            query = query.Where(p => p.CoverageArea != null && p.CoverageArea.Contains(location));
        }

        return await query.ToListAsync(cancellationToken);
    }

    public async Task<int> GetActiveMatchCountAsync(Guid professionalId, CancellationToken cancellationToken = default)
    {
        return await _context.Matches
            .CountAsync(m => m.ProfessionalId == professionalId && m.Status == MatchStatus.Active, cancellationToken);
    }

    public async Task<IReadOnlyDictionary<Guid, int>> GetActiveMatchCountsAsync(IReadOnlyCollection<Guid> professionalIds, CancellationToken cancellationToken = default)
    {
        if (professionalIds.Count == 0)
            return new Dictionary<Guid, int>();

        return await _context.Matches
            .Where(m => professionalIds.Contains(m.ProfessionalId) && m.Status == MatchStatus.Active)
            .GroupBy(m => m.ProfessionalId)
            .Select(g => new { ProfessionalId = g.Key, Count = g.Count() })
            .ToDictionaryAsync(x => x.ProfessionalId, x => x.Count, cancellationToken);
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
