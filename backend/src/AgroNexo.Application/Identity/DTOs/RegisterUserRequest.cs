using System.ComponentModel.DataAnnotations;
using AgroNexo.Application.Common.DTOs;
using AgroNexo.Domain.Common;
using AgroNexo.Domain.Enums;

namespace AgroNexo.Application.Identity.DTOs;

/// <summary>
/// Request DTO for user registration (public endpoint).
/// Enables toggling between Producer and Professional user profiles.
/// </summary>
public class RegisterUserRequest
{
    [Required(ErrorMessage = "El tipo de usuario es obligatorio (1 = Producer, 2 = Professional).")]
    public UserType UserType { get; set; } = UserType.Producer;

    [Required(ErrorMessage = "El nombre es obligatorio.")]
    [StringLength(100, MinimumLength = 2, ErrorMessage = "El nombre debe tener entre 2 y 100 caracteres.")]
    public string FirstName { get; set; } = string.Empty;

    [Required(ErrorMessage = "El apellido es obligatorio.")]
    [StringLength(100, MinimumLength = 2, ErrorMessage = "El apellido debe tener entre 2 y 100 caracteres.")]
    public string LastName { get; set; } = string.Empty;

    [StringLength(50, ErrorMessage = "El número de documento no puede superar los 50 caracteres.")]
    public string? DocumentNumber { get; set; }

    /// <summary>WhatsApp en formato internacional (E.164).</summary>
    [Required(ErrorMessage = "El WhatsApp es obligatorio.")]
    [RegularExpression(PhoneNumberRules.Pattern, ErrorMessage = PhoneNumberRules.ErrorMessage)]
    public string PhoneNumber { get; set; } = string.Empty;

    /// <summary>Correo del usuario, informado por el frontend (sesión de Google u onboarding). No se valida contra el token.</summary>
    [EmailAddress(ErrorMessage = "Ingresá un correo válido.")]
    [MaxLength(254)]
    public string? Email { get; set; }

    // Producer-specific attributes (ignorado cuando UserType == Professional)
    public ProducerType? ProducerType { get; set; }

    /// <summary>Rango de hectáreas del productor (solo productores).</summary>
    public HectaresRange? HectaresRange { get; set; }

    /// <summary>Tipos de profesional que busca el productor (Agronomist, Accountant, Lawyer, Investor).</summary>
    public List<ProfessionalRole>? LookingFor { get; set; }

    [StringLength(100, ErrorMessage = "El país no puede superar los 100 caracteres.")]
    public string? Country { get; set; }

    [StringLength(100, ErrorMessage = "La provincia no puede superar los 100 caracteres.")]
    public string? Province { get; set; }

    [StringLength(100, ErrorMessage = "La ciudad no puede superar los 100 caracteres.")]
    public string? City { get; set; }

    // Professional-specific attributes (ignored when UserType == Producer)
    public ProfessionalRole? Role { get; set; }

    /// <summary>Matrícula profesional (solo el número). Obligatoria para Agronomist, Accountant y Lawyer.</summary>
    [StringLength(50, ErrorMessage = "La matrícula no puede superar los 50 caracteres.")]
    public string? LicenseNumber { get; set; }

    [StringLength(150, ErrorMessage = "La especialidad no puede superar los 150 caracteres.")]
    public string? Specialty { get; set; }

    [Range(0, 70, ErrorMessage = "Los años de experiencia deben estar entre 0 y 70.")]
    public int YearsExperience { get; set; } = 0;

    [Range(1, 200, ErrorMessage = "La capacidad máxima debe estar entre 1 y 200.")]
    public int MaxCapacity { get; set; } = 20;

    /// <summary>
    /// Optional polygon coordinates representing the professional's coverage zone.
    /// Minimum 4 coordinates (first and last matching for a closed polygon).
    /// </summary>
    public List<CoordinateDto>? CoverageAreaCoordinates { get; set; }
}

