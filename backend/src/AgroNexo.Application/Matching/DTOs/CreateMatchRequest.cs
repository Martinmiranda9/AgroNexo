using System.ComponentModel.DataAnnotations;

namespace AgroNexo.Application.Matching.DTOs;

/// <summary>
/// Request DTO for initiating a Match link / invitation between a Producer and a Professional.
/// </summary>
public class CreateMatchRequest
{
    [Required(ErrorMessage = "El identificador del profesional (ProfessionalId) es obligatorio.")]
    public Guid ProfessionalId { get; set; }

    /// <summary>
    /// Optional if derived directly from the authenticated producer's context.
    /// </summary>
    public Guid? ProducerId { get; set; }

    /// <summary>
    /// Ficha de necesidad con el contexto del pedido (resumen, zona, hectáreas, urgencia, temas y cultivos).
    /// Opcional: un pedido sin ficha sigue siendo válido.
    /// </summary>
    public NeedBriefRequest? NeedBrief { get; set; }
}
