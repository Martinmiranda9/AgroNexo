using AgroNexo.Application.Common.DTOs;

namespace AgroNexo.Application.Farms.DTOs;

/// <summary>
/// Response DTO representing a farm/lot owned by a producer.
/// </summary>
public class FarmResponse
{
    public Guid Id { get; set; }

    /// <summary>
    /// Human-readable numeric public identifier (prefix 20, e.g. 200001).
    /// Visible to the producer and their team members.
    /// </summary>
    public long PublicId { get; set; }

    public Guid ProducerId { get; set; }
    public Guid TenantId { get; set; }
    public string Name { get; set; } = string.Empty;
    public decimal TotalHectares { get; set; }
    public bool IsActive { get; set; }
    public string? Description { get; set; }

    /// <summary>Fecha en que el productor archivó el campo; null mientras está en uso.</summary>
    public DateTime? ArchivedAt { get; set; }

    /// <summary>
    /// Polygon or point coordinates representing the farm boundaries or location (optional).
    /// </summary>
    public List<CoordinateDto> LocationCoordinates { get; set; } = new();

    /// <summary>Provincia, partido y localidad, sacados del perímetro con Georef. <c>null</c> si no hay perímetro o no se encontró.</summary>
    public string? Province { get; set; }
    public string? Department { get; set; }
    public string? Locality { get; set; }

    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}
