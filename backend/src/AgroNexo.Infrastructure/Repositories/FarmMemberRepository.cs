using AgroNexo.Domain.Entities;
using AgroNexo.Domain.Enums;
using AgroNexo.Domain.Interfaces;
using AgroNexo.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace AgroNexo.Infrastructure.Repositories;

/// <summary>
/// Las participaciones cruzan tenants: el campo y el profesional pertenecen a tenants distintos, así que se ignoran los
/// filtros globales y se aplica a mano solo el de borrado lógico. El permiso lo valida la capa de aplicación.
/// </summary>
public class FarmMemberRepository : IFarmMemberRepository
{
    private readonly AgroNexoDbContext _context;

    public FarmMemberRepository(AgroNexoDbContext context)
    {
        _context = context;
    }

    private IQueryable<FarmMember> Members => _context.FarmMembers.IgnoreQueryFilters();

    public async Task<FarmMember?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await Members.FirstOrDefaultAsync(m => m.Id == id, cancellationToken);
    }

    public async Task<FarmMember?> GetActiveAsync(Guid farmId, Guid professionalId, CancellationToken cancellationToken = default)
    {
        return await Members.FirstOrDefaultAsync(
            m => m.FarmId == farmId && m.ProfessionalId == professionalId && m.Status == FarmMemberStatus.Active,
            cancellationToken);
    }

    public async Task<IReadOnlyList<FarmMember>> GetActiveByFarmAsync(Guid farmId, CancellationToken cancellationToken = default)
    {
        return await GetActiveByFarmsAsync(new[] { farmId }, cancellationToken);
    }

    public async Task<IReadOnlyList<FarmMember>> GetActiveByFarmsAsync(IReadOnlyCollection<Guid> farmIds, CancellationToken cancellationToken = default)
    {
        if (farmIds.Count == 0)
            return Array.Empty<FarmMember>();

        return await Members
            .Include(m => m.Professional)
            .Where(m => farmIds.Contains(m.FarmId)
                && m.Status == FarmMemberStatus.Active
                && m.Professional != null && m.Professional.IsActive)
            .OrderBy(m => m.JoinedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<FarmMember>> GetActiveByProfessionalAsync(Guid professionalId, CancellationToken cancellationToken = default)
    {
        return await Members
            .Include(m => m.Farm)
            .Where(m => m.ProfessionalId == professionalId
                && m.Status == FarmMemberStatus.Active
                && m.Farm != null && m.Farm.IsActive)
            .OrderBy(m => m.Farm!.Name)
            .ToListAsync(cancellationToken);
    }

    public async Task<FarmMember> AddAsync(FarmMember member, CancellationToken cancellationToken = default)
    {
        await _context.FarmMembers.AddAsync(member, cancellationToken);
        return member;
    }

    public Task UpdateAsync(FarmMember member, CancellationToken cancellationToken = default)
    {
        _context.FarmMembers.Update(member);
        return Task.CompletedTask;
    }
}
