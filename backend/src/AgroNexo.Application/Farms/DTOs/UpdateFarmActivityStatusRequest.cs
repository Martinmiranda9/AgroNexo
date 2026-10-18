using System.ComponentModel.DataAnnotations;
using AgroNexo.Domain.Enums;

namespace AgroNexo.Application.Farms.DTOs;

/// <summary>
/// Cambio de estado de una actividad: Inicio, En proceso o Finalizado.
/// </summary>
public class UpdateFarmActivityStatusRequest
{
    [Required(ErrorMessage = "El estado es obligatorio.")]
    public FarmActivityStatus? Status { get; set; }

    /// <summary>Hectáreas trabajadas hasta ahora (opcional).</summary>
    [Range(0.01, 1_000_000, ErrorMessage = "Las hectáreas trabajadas tienen que ser mayores a cero.")]
    public decimal? HectaresWorked { get; set; }
}
