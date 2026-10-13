using AgroNexo.Domain.Common;
using AgroNexo.Domain.Enums;
using AgroNexo.Domain.Exceptions;

namespace AgroNexo.Domain.Entities;

/// <summary>
/// Participación de un profesional en el equipo de un campo. Como el Match, cruza tenants: el campo es del tenant del
/// productor y el profesional pertenece al suyo. Se entra solo con un Match aceptado; la participación termina cuando el
/// profesional se va, el productor lo desvincula o el campo se archiva, y el registro queda como historia.
/// </summary>
public class FarmMember : BaseEntity, IAggregateRoot
{
    public Guid FarmId { get; private set; }
    public Guid ProfessionalId { get; private set; }

    /// <summary>Match aceptado que habilitó la invitación.</summary>
    public Guid MatchId { get; private set; }

    public FarmMemberStatus Status { get; private set; } = FarmMemberStatus.Active;
    public DateTime JoinedAt { get; private set; } = DateTime.UtcNow;
    public DateTime? EndedAt { get; private set; }

    public bool IsActive => Status == FarmMemberStatus.Active;

    // Navigation properties
    public Farm? Farm { get; private set; }
    public Professional? Professional { get; private set; }

    // Parameterless constructor for EF Core
    protected FarmMember()
    {
    }

    public FarmMember(Guid farmId, Guid professionalId, Guid matchId)
    {
        if (farmId == Guid.Empty)
            throw new DomainValidationException(nameof(FarmId), "El FarmId es obligatorio.");

        if (professionalId == Guid.Empty)
            throw new DomainValidationException(nameof(ProfessionalId), "El ProfessionalId es obligatorio.");

        if (matchId == Guid.Empty)
            throw new DomainValidationException(nameof(MatchId), "El MatchId es obligatorio.");

        Id = Guid.NewGuid();
        FarmId = farmId;
        ProfessionalId = professionalId;
        MatchId = matchId;
        Status = FarmMemberStatus.Active;
        JoinedAt = DateTime.UtcNow;
        CreatedAt = DateTime.UtcNow;
    }

    /// <summary>El profesional deja el campo.</summary>
    public void Leave() => End(FarmMemberStatus.Left);

    /// <summary>El productor lo desvincula.</summary>
    public void Remove() => End(FarmMemberStatus.Removed);

    /// <summary>Baja por archivo del campo.</summary>
    public void CloseWithFarm() => End(FarmMemberStatus.FarmArchived);

    private void End(FarmMemberStatus status)
    {
        if (!IsActive)
            throw new DomainException("El profesional ya no forma parte del equipo de este campo.");

        Status = status;
        EndedAt = DateTime.UtcNow;
        MarkUpdated();
    }
}
