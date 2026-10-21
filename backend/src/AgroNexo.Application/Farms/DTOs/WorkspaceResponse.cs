using AgroNexo.Application.Common.DTOs;

namespace AgroNexo.Application.Farms.DTOs;

/// <summary>
/// Un campo visto como espacio de trabajo: lo que ve el productor dueño o un profesional del equipo.
/// </summary>
public class WorkspaceResponse
{
    public Guid FarmId { get; set; }
    public long PublicId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public decimal TotalHectares { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? ArchivedAt { get; set; }

    /// <summary>Perímetro del campo dibujado en el mapa (anillo cerrado). Vacío si no tiene.</summary>
    public List<CoordinateDto> LocationCoordinates { get; set; } = new();

    public string? Province { get; set; }
    public string? Department { get; set; }
    public string? Locality { get; set; }

    public Guid ProducerId { get; set; }
    public string ProducerName { get; set; } = string.Empty;

    /// <summary>`Owner` si mira el productor dueño; `Member` si mira un profesional del equipo.</summary>
    public string ViewerRole { get; set; } = string.Empty;

    /// <summary>Participación de quien mira, si es un profesional del equipo.</summary>
    public Guid? MyMemberId { get; set; }

    /// <summary>Contacto del productor: solo para los profesionales del equipo.</summary>
    public FarmContactResponse? ProducerContact { get; set; }

    /// <summary>Equipo activo, en orden de llegada.</summary>
    public List<FarmMemberResponse> Members { get; set; } = new();
}
