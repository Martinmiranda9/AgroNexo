using System.ComponentModel.DataAnnotations;

namespace AgroNexo.Application.Farms.DTOs;

/// <summary>
/// Invitación de un profesional al equipo de un campo. Requiere un match aceptado entre el productor y el profesional.
/// </summary>
public class AddFarmMemberRequest
{
    [Required(ErrorMessage = "El profesional es obligatorio.")]
    public Guid ProfessionalId { get; set; }
}
