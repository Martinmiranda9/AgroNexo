using AgroNexo.Application.Common.DTOs;
using AgroNexo.Domain.Enums;

namespace AgroNexo.Application.Farms.DTOs;

/// <summary>
/// Lote del campo con sus cultivos: de todas las campañas en la lista de lotes, y solo los de la campaña elegida en el
/// tablero.
/// </summary>
public class LotResponse
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public decimal Hectares { get; set; }
    public List<LotCropResponse> Crops { get; set; } = new();

    /// <summary>Forma del lote dibujado (el anillo cerrado: el último punto repite el primero). Vacía si no tiene.</summary>
    public List<CoordinateDto> BoundaryCoordinates { get; set; } = new();

    /// <summary>Quién creó el lote: el productor dueño o un profesional del equipo.</summary>
    public LotEditorResponse CreatedBy { get; set; } = new();

    /// <summary>Quién dibujó o corrigió la forma por última vez; <c>null</c> si el lote no tiene forma.</summary>
    public LotEditorResponse? BoundaryEditedBy { get; set; }

    public DateTime? BoundaryEditedAt { get; set; }

    /// <summary>Última labor de campo del lote en la campaña. Solo en el tablero.</summary>
    public LotLastLaborResponse? LastLabor { get; set; }
}

/// <summary>
/// Quién creó o corrigió un lote: el productor dueño o un profesional del equipo (con su rol). Sin contacto.
/// </summary>
public class LotEditorResponse
{
    public string Name { get; set; } = string.Empty;

    /// <summary>Rol del profesional; <c>null</c> si fue el productor.</summary>
    public ProfessionalRole? Role { get; set; }
}

public class LotLastLaborResponse
{
    public FarmActivityType Type { get; set; }
    public FarmActivityStatus Status { get; set; }
    public DateOnly Date { get; set; }
}
