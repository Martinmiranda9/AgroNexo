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

    /// <summary>
    /// Polygon or point coordinates representing the farm boundaries or location (optional).
    /// </summary>
    public List<CoordinateDto> LocationCoordinates { get; set; } = new();

    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}
