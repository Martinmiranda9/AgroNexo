using System.ComponentModel.DataAnnotations;
using AgroNexo.Application.Common.DTOs;
using AgroNexo.Domain.Common;
using AgroNexo.Domain.Enums;

namespace AgroNexo.Application.Professionals.DTOs;

/// <summary>
/// Request DTO for updating a professional's profile and capacity settings.
/// </summary>
public class UpdateProfessionalProfileRequest
{
    [Required(ErrorMessage = "El nombre es obligatorio.")]
    [StringLength(100, MinimumLength = 2, ErrorMessage = "El nombre debe tener entre 2 y 100 caracteres.")]
    public string FirstName { get; set; } = string.Empty;

    [Required(ErrorMessage = "El apellido es obligatorio.")]
    [StringLength(100, MinimumLength = 2, ErrorMessage = "El apellido debe tener entre 2 y 100 caracteres.")]
    public string LastName { get; set; } = string.Empty;

    [StringLength(50, ErrorMessage = "El número de documento no puede superar los 50 caracteres.")]
    public string? DocumentNumber { get; set; }

    [Required(ErrorMessage = "El WhatsApp es obligatorio.")]
    [RegularExpression(PhoneNumberRules.Pattern, ErrorMessage = PhoneNumberRules.ErrorMessage)]
    public string PhoneNumber { get; set; } = string.Empty;

    /// <summary>Matrícula profesional (solo el número). Obligatoria para Agronomist, Accountant y Lawyer.</summary>
    [StringLength(50, ErrorMessage = "La matrícula no puede superar los 50 caracteres.")]
    public string? LicenseNumber { get; set; }

    [Required(ErrorMessage = "El rol profesional es obligatorio.")]
    public ProfessionalRole Role { get; set; } = ProfessionalRole.Agronomist;

    [StringLength(150, ErrorMessage = "La especialidad no puede superar los 150 caracteres.")]
    public string? Specialty { get; set; }

    [Range(0, 70, ErrorMessage = "Los años de experiencia deben estar entre 0 y 70.")]
    public int YearsExperience { get; set; }

    [Range(1, 200, ErrorMessage = "La capacidad máxima debe estar entre 1 y 200.")]
    public int MaxCapacity { get; set; } = 20;

    /// <summary>
    /// Optional polygon coordinates representing the updated coverage zone.
    /// </summary>
    public List<CoordinateDto>? CoverageAreaCoordinates { get; set; }
}
