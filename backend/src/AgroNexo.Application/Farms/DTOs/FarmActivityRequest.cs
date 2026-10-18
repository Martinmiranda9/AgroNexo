using System.ComponentModel.DataAnnotations;
using AgroNexo.Domain.Enums;

namespace AgroNexo.Application.Farms.DTOs;

/// <summary>
/// Registro de una actividad del campo. Sin campaña, se asigna la que contiene la fecha (si hay una).
/// </summary>
public class FarmActivityRequest
{
    [Required(ErrorMessage = "El tipo de actividad es obligatorio.")]
    public FarmActivityType? Type { get; set; }

    [Required(ErrorMessage = "Contá en pocas palabras qué se hizo.")]
    [MaxLength(120, ErrorMessage = "El título no puede superar los 120 caracteres.")]
    public string Title { get; set; } = string.Empty;

    [MaxLength(500, ErrorMessage = "Las notas no pueden superar los 500 caracteres.")]
    public string? Notes { get; set; }

    [Required(ErrorMessage = "La fecha es obligatoria.")]
    public DateOnly? Date { get; set; }

    public FarmActivityStatus Status { get; set; } = FarmActivityStatus.Started;

    /// <summary>Opcional: sin dato, una labor finalizada cuenta el lote entero.</summary>
    [Range(0.01, 1_000_000, ErrorMessage = "Las hectáreas trabajadas tienen que ser mayores a cero.")]
    public decimal? HectaresWorked { get; set; }

    public Guid? LotId { get; set; }
    public Guid? CampaignId { get; set; }
}
