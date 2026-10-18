using AgroNexo.Domain.Common;
using AgroNexo.Domain.Enums;
using AgroNexo.Domain.Exceptions;

namespace AgroNexo.Domain.Entities;

/// <summary>
/// Labor o tarea del campo (siembra, pulverización, visita…), con fecha y estado. La registra el productor dueño o un
/// profesional del equipo; puede ir atada a un lote y a una campaña.
/// </summary>
public class FarmActivity : BaseEntity, IAggregateRoot
{
    public const int TitleMaxLength = 120;
    public const int NotesMaxLength = 500;
    public const decimal HectaresMax = 1_000_000m;

    public Guid FarmId { get; private set; }
    public Guid? CampaignId { get; private set; }
    public Guid? LotId { get; private set; }
    public FarmActivityType Type { get; private set; }
    public string Title { get; private set; } = string.Empty;
    public string? Notes { get; private set; }
    public DateOnly Date { get; private set; }
    public FarmActivityStatus Status { get; private set; }
    public DateTime? CompletedAt { get; private set; }

    /// <summary>
    /// Hectáreas trabajadas, para labores que llevan varios días (una cosecha en proceso con 40 de 100 ha). Sin dato, una
    /// labor finalizada cuenta el lote entero.
    /// </summary>
    public decimal? HectaresWorked { get; private set; }

    /// <summary>Profesional que la registró; <c>null</c> si la registró el productor dueño.</summary>
    public Guid? AuthorProfessionalId { get; private set; }

    // Parameterless constructor for EF Core
    protected FarmActivity()
    {
    }

    public FarmActivity(
        Guid farmId,
        Guid? campaignId,
        Guid? lotId,
        FarmActivityType type,
        string title,
        string? notes,
        DateOnly date,
        FarmActivityStatus status,
        Guid? authorProfessionalId,
        decimal? hectaresWorked = null)
    {
        if (farmId == Guid.Empty)
            throw new DomainValidationException(nameof(FarmId), "El FarmId es obligatorio.");

        if (!Enum.IsDefined(type))
            throw new DomainValidationException(nameof(Type), "El tipo de actividad no es válido.");

        if (string.IsNullOrWhiteSpace(title))
            throw new DomainValidationException(nameof(Title), "Contá en pocas palabras qué se hizo.");

        var trimmedTitle = title.Trim();
        if (trimmedTitle.Length > TitleMaxLength)
            throw new DomainValidationException(nameof(Title), $"El título no puede superar los {TitleMaxLength} caracteres.");

        Id = Guid.NewGuid();
        FarmId = farmId;
        CampaignId = campaignId;
        LotId = lotId;
        Type = type;
        Title = trimmedTitle;
        Notes = NormalizeNotes(notes);
        Date = date;
        AuthorProfessionalId = authorProfessionalId;
        HectaresWorked = NormalizeHectares(hectaresWorked);
        CreatedAt = DateTime.UtcNow;
        ApplyStatus(status);
    }

    public bool IsOpen => Status != FarmActivityStatus.Completed;

    public bool IsAuthoredBy(Guid? professionalId) => AuthorProfessionalId == professionalId;

    /// <summary>Labores que trabajan la superficie del lote (las recorridas y visitas no).</summary>
    public bool IsFieldLabor => Type is FarmActivityType.Sowing or FarmActivityType.Spraying
        or FarmActivityType.Fertilization or FarmActivityType.Harvest or FarmActivityType.Tillage;

    /// <summary>Cambia el estado y, si viene, actualiza las hectáreas trabajadas.</summary>
    public void ChangeStatus(FarmActivityStatus status, decimal? hectaresWorked = null)
    {
        ApplyStatus(status);
        if (hectaresWorked.HasValue)
            HectaresWorked = NormalizeHectares(hectaresWorked);
        MarkUpdated();
    }

    private void ApplyStatus(FarmActivityStatus status)
    {
        if (!Enum.IsDefined(status))
            throw new DomainValidationException(nameof(Status), "El estado no es válido.");

        Status = status;
        CompletedAt = status == FarmActivityStatus.Completed ? CompletedAt ?? DateTime.UtcNow : null;
    }

    private static decimal? NormalizeHectares(decimal? hectares)
    {
        if (hectares == null)
            return null;

        if (hectares <= 0 || hectares > HectaresMax)
            throw new DomainValidationException(nameof(HectaresWorked), "Las hectáreas trabajadas tienen que ser mayores a cero.");

        return hectares;
    }

    private static string? NormalizeNotes(string? notes)
    {
        if (string.IsNullOrWhiteSpace(notes))
            return null;

        var trimmed = notes.Trim();
        if (trimmed.Length > NotesMaxLength)
            throw new DomainValidationException(nameof(Notes), $"Las notas no pueden superar los {NotesMaxLength} caracteres.");

        return trimmed;
    }
}
