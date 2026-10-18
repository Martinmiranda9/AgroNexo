using System.ComponentModel.DataAnnotations;

namespace AgroNexo.Application.Farms.DTOs;

/// <summary>
/// Alta o edición de una campaña del campo.
/// </summary>
public class CampaignRequest
{
    [Required(ErrorMessage = "El nombre de la campaña es obligatorio.")]
    [RegularExpression(@"^\d{4}/\d{2}$", ErrorMessage = "La campaña se escribe con el formato 2026/27.")]
    public string Name { get; set; } = string.Empty;

    [Required(ErrorMessage = "La fecha de inicio es obligatoria.")]
    public DateOnly? StartsOn { get; set; }

    [Required(ErrorMessage = "La fecha de fin es obligatoria.")]
    public DateOnly? EndsOn { get; set; }
}
