using AgroNexo.Domain.Entities;

namespace AgroNexo.Domain.Interfaces;

/// <summary>
/// Repositorio de participaciones en equipos de campo. Opera entre tenants, igual que el de Match.
/// </summary>
public interface IFarmMemberRepository
{
    Task<FarmMember?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);

    /// <summary>Participación activa del profesional en el campo, si la hay.</summary>
    Task<FarmMember?> GetActiveAsync(Guid farmId, Guid professionalId, CancellationToken cancellationToken = default);

    /// <summary>Equipo activo del campo, con el profesional cargado.</summary>
    Task<IReadOnlyList<FarmMember>> GetActiveByFarmAsync(Guid farmId, CancellationToken cancellationToken = default);

    /// <summary>Equipos activos de varios campos a la vez (para listar campos con sus equipos).</summary>
    Task<IReadOnlyList<FarmMember>> GetActiveByFarmsAsync(IReadOnlyCollection<Guid> farmIds, CancellationToken cancellationToken = default);

    /// <summary>Participaciones activas del profesional, con el campo cargado (de otro tenant).</summary>
    Task<IReadOnlyList<FarmMember>> GetActiveByProfessionalAsync(Guid professionalId, CancellationToken cancellationToken = default);

    Task<FarmMember> AddAsync(FarmMember member, CancellationToken cancellationToken = default);
    Task UpdateAsync(FarmMember member, CancellationToken cancellationToken = default);
}
