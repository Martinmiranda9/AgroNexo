using System.ComponentModel.DataAnnotations;
using AgroNexo.Application.Common.DTOs;

namespace AgroNexo.Application.Farms.DTOs;

/// <summary>
/// Alta o edición de un lote del campo. Describe el lote completo: nombre, hectáreas declaradas y, si se dibujó, su
/// ubicación en el mapa. Editar un lote dibujado sin mandar la forma lo deja sin dibujo.
/// </summary>
public class LotRequest : IValidatableObject
{
    [Required(ErrorMessage = "El nombre del lote es obligatorio.")]
    [MaxLength(100, ErrorMessage = "El nombre del lote no puede superar los 100 caracteres.")]
    public string Name { get; set; } = string.Empty;

    /// <summary>Hectáreas que declara quien carga el lote. El dibujo no las cambia.</summary>
    [Required(ErrorMessage = "Cargá las hectáreas del lote.")]
    [Range(0.01, 1_000_000, ErrorMessage = "Las hectáreas del lote tienen que ser mayores a cero.")]
    public decimal? Hectares { get; set; }

    /// <summary>Esquinas del lote en el mapa (WGS84), en orden, solo para ubicarlo. Opcional; si viene, al menos 3.</summary>
    public List<CoordinateDto>? BoundaryCoordinates { get; set; }

    public bool HasBoundary => BoundaryCoordinates is { Count: > 0 };

    public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
    {
        if (HasBoundary && BoundaryCoordinates!.Count < 3)
            yield return new ValidationResult(
                "El lote dibujado necesita al menos 3 esquinas.",
                new[] { nameof(BoundaryCoordinates) });
    }
}
