using AgroNexo.Domain.Enums;

namespace AgroNexo.Application.Farms.DTOs;

/// <summary>
/// Actividad del campo como la ve un miembro del equipo.
/// </summary>
public class FarmActivityResponse
{
    public Guid Id { get; set; }
    public DateOnly Date { get; set; }
    public FarmActivityType Type { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Notes { get; set; }
    public FarmActivityStatus Status { get; set; }
    public DateTime? CompletedAt { get; set; }
    public decimal? HectaresWorked { get; set; }
    public DateTime CreatedAt { get; set; }
    public Guid? CampaignId { get; set; }

    /// <summary>Lote de la actividad; <c>null</c> si es del campo en general.</summary>
    public FarmActivityLotResponse? Lot { get; set; }

    public FarmActivityAuthorResponse Author { get; set; } = new();

    /// <summary>Quien mira puede cambiarle el estado o borrarla: el productor dueño o quien la registró.</summary>
    public bool CanEdit { get; set; }
}

public class FarmActivityLotResponse
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
}

/// <summary>
/// Quién registró la actividad: el productor dueño o un profesional del equipo (con su rol).
/// </summary>
public class FarmActivityAuthorResponse
{
    public string Name { get; set; } = string.Empty;

    /// <summary>Rol del profesional; <c>null</c> si la registró el productor.</summary>
    public ProfessionalRole? Role { get; set; }
}
