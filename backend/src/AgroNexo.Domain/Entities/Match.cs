using AgroNexo.Domain.Common;
using AgroNexo.Domain.Enums;
using AgroNexo.Domain.Exceptions;

namespace AgroNexo.Domain.Entities;

/// <summary>
/// Cross-tenant relationship linking a Producer and a Professional.
/// Notice that Match spans across the Tenant boundary of both participants.
/// </summary>
public class Match : BaseEntity, IAggregateRoot
{
    public Guid ProducerId { get; private set; }
    public Guid ProfessionalId { get; private set; }
    public MatchStatus Status { get; private set; } = MatchStatus.Pending;
    public DateTime RequestedAt { get; private set; } = DateTime.UtcNow;
    public DateTime? RespondedAt { get; private set; }

    // Navigation properties
    public Producer? Producer { get; private set; }
    public Professional? Professional { get; private set; }

    // Parameterless constructor for EF Core
    protected Match()
    {
    }

    public Match(Guid producerId, Guid professionalId)
    {
        if (producerId == Guid.Empty)
            throw new DomainValidationException(nameof(ProducerId), "El ProducerId es obligatorio.");

        if (professionalId == Guid.Empty)
            throw new DomainValidationException(nameof(ProfessionalId), "El ProfessionalId es obligatorio.");

        Id = Guid.NewGuid();
        ProducerId = producerId;
        ProfessionalId = professionalId;
        Status = MatchStatus.Pending;
        RequestedAt = DateTime.UtcNow;
        CreatedAt = DateTime.UtcNow;
    }

    public void Accept()
    {
        if (Status != MatchStatus.Pending)
            throw new DomainException($"No se puede aceptar un Match con estado '{Status}'. Solo los Matches pendientes pueden ser aceptados.");

        Status = MatchStatus.Active;
        RespondedAt = DateTime.UtcNow;
        MarkUpdated();
    }

    public void Reject()
    {
        if (Status != MatchStatus.Pending)
            throw new DomainException($"No se puede rechazar un Match con estado '{Status}'. Solo los Matches pendientes pueden ser rechazados.");

        Status = MatchStatus.Rejected;
        RespondedAt = DateTime.UtcNow;
        MarkUpdated();
    }

    public void Cancel()
    {
        if (Status == MatchStatus.Completed || Status == MatchStatus.Cancelled)
            throw new DomainException($"No se puede cancelar un Match en estado '{Status}'.");

        Status = MatchStatus.Cancelled;
        RespondedAt = DateTime.UtcNow;
        MarkUpdated();
    }

    public void Complete()
    {
        if (Status != MatchStatus.Active)
            throw new DomainException($"Solo un Match activo puede ser marcado como completado.");

        Status = MatchStatus.Completed;
        MarkUpdated();
    }
}
