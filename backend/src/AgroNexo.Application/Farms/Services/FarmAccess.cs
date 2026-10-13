using AgroNexo.Domain.Entities;

namespace AgroNexo.Application.Farms.Services;

/// <summary>
/// Quién mira un campo y con qué permiso: el productor dueño o un profesional con participación activa en el equipo.
/// </summary>
public sealed class FarmAccess
{
    public FarmAccess(Farm farm, Producer? owner, Professional? professional, FarmMember? membership)
    {
        Farm = farm;
        Owner = owner;
        Professional = professional;
        Membership = membership;
    }

    public Farm Farm { get; }

    /// <summary>El productor que mira, cuando es el dueño del campo.</summary>
    public Producer? Owner { get; }

    /// <summary>El profesional que mira, cuando es parte del equipo.</summary>
    public Professional? Professional { get; }

    public FarmMember? Membership { get; }

    public bool IsOwner => Owner != null;
}
