using System.ComponentModel.DataAnnotations;
using AgroConnect.Application.Common.DTOs;

namespace AgroConnect.Application.Farms.DTOs;

/// <summary>
/// Request DTO for creating a new farm/lot under the authenticated producer.
/// </summary>
public class CreateFarmRequest
{
    [Required(ErrorMessage = "El nombre del lote / establecimiento es obligatorio.")]
    [StringLength(200, MinimumLength = 2, ErrorMessage = "El nombre debe tener entre 2 y 200 caracteres.")]
    public string Name { get; set; } = string.Empty;

    [Range(0, 1_000_000, ErrorMessage = "Las hectáreas deben estar entre 0 y 1.000.000.")]
    public decimal TotalHectares { get; set; }

    /// <summary>
    /// Optional polygon or point defining the farm boundaries/location (WGS84).
    /// If providing a polygon, include at least 3 vertices.
    /// </summary>
    public List<CoordinateDto>? LocationCoordinates { get; set; }
}
