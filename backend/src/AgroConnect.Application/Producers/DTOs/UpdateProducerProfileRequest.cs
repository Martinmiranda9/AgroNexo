using System.ComponentModel.DataAnnotations;

namespace AgroConnect.Application.Producers.DTOs;

/// <summary>
/// Request DTO for updating a producer's profile details.
/// </summary>
public class UpdateProducerProfileRequest
{
    [Required(ErrorMessage = "El nombre es obligatorio.")]
    [StringLength(100, MinimumLength = 2, ErrorMessage = "El nombre debe tener entre 2 y 100 caracteres.")]
    public string FirstName { get; set; } = string.Empty;

    [Required(ErrorMessage = "El apellido es obligatorio.")]
    [StringLength(100, MinimumLength = 2, ErrorMessage = "El apellido debe tener entre 2 y 100 caracteres.")]
    public string LastName { get; set; } = string.Empty;

    [StringLength(50, ErrorMessage = "El número de documento no puede superar los 50 caracteres.")]
    public string? DocumentNumber { get; set; }
}
