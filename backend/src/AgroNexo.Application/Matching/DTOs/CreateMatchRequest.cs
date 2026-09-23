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
}
