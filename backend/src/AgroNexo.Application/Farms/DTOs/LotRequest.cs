using System.ComponentModel.DataAnnotations;

namespace AgroNexo.Application.Farms.DTOs;

/// <summary>
/// Alta o edición de un lote del campo.
/// </summary>
public class LotRequest
{
    [Required(ErrorMessage = "El nombre del lote es obligatorio.")]
    [MaxLength(100, ErrorMessage = "El nombre del lote no puede superar los 100 caracteres.")]
    public string Name { get; set; } = string.Empty;

    [Range(0.01, 1_000_000, ErrorMessage = "Las hectáreas del lote tienen que ser mayores a cero.")]
    public decimal Hectares { get; set; }
}
