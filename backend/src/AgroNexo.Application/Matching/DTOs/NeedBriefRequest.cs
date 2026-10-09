using System.ComponentModel.DataAnnotations;
using AgroNexo.Domain.Enums;

namespace AgroNexo.Application.Matching.DTOs;

/// <summary>
/// "Ficha de necesidad" que el productor adjunta a su pedido de Match: el contexto que el profesional recibe.
/// </summary>
public class NeedBriefRequest
{
    /// <summary>Texto descriptivo del pedido, ej: "Productor de Berrotarán, 350 ha de soja, necesita ayuda con retenciones, este mes."</summary>
    [Required(ErrorMessage = "El resumen de la necesidad es obligatorio.")]
    [StringLength(600, MinimumLength = 10, ErrorMessage = "El resumen de la necesidad debe tener entre 10 y 600 caracteres.")]
    public string Summary { get; set; } = string.Empty;

    /// <summary>Zona en texto, ej: "Berrotarán, Córdoba". No se aceptan coordenadas.</summary>
    [StringLength(150, ErrorMessage = "La zona no puede superar los 150 caracteres.")]
    public string? PlaceLabel { get; set; }

    [Range(1, 1_000_000, ErrorMessage = "Las hectáreas deben estar entre 1 y 1.000.000.")]
    public int? Hectares { get; set; }

    public MatchUrgency? Urgency { get; set; }

    /// <summary>Ids de los temas a tratar, ej: ["farm-taxes"].</summary>
    [MaxLength(5, ErrorMessage = "No se pueden indicar más de 5 temas.")]
    public List<string> Topics { get; set; } = new();

    /// <summary>Ids de los cultivos involucrados, ej: ["soybean"].</summary>
    [MaxLength(5, ErrorMessage = "No se pueden indicar más de 5 cultivos.")]
    public List<string> Crops { get; set; } = new();
}
