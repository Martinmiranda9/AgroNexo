using System.ComponentModel.DataAnnotations;
using AgroNexo.Application.Common.DTOs;

namespace AgroNexo.Application.Farms.DTOs;

/// <summary>
/// Request DTO for updating an existing farm/lot details.
/// </summary>
public class UpdateFarmRequest
{
    [Required(ErrorMessage = "El nombre del lote / establecimiento es obligatorio.")]
    [StringLength(200, MinimumLength = 2, ErrorMessage = "El nombre debe tener entre 2 y 200 caracteres.")]
    public string Name { get; set; } = string.Empty;

    [Range(0, 1_000_000, ErrorMessage = "Las hectáreas deben estar entre 0 y 1.000.000.")]
    public decimal TotalHectares { get; set; }

    /// <summary>
    /// Optional updated polygon or point. If null or empty, the existing geometry is preserved.
    /// </summary>
    public List<CoordinateDto>? LocationCoordinates { get; set; }
}
