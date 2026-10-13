using System.ComponentModel.DataAnnotations;

namespace AgroNexo.Application.Farms.DTOs;

/// <summary>
/// Cambio de estado del campo. Por ahora solo se puede archivar: un campo archivado no se reabre.
/// </summary>
public class UpdateFarmStatusRequest
{
    [Required(ErrorMessage = "El estado es obligatorio.")]
    public bool? Archived { get; set; }
}
