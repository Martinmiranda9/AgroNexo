using AgroNexo.Domain.Enums;

namespace AgroNexo.Application.Farms.DTOs;

/// <summary>
/// Profesional que el productor puede sumar al equipo de un campo: tiene un match aceptado con él y todavía no está en
/// ese equipo.
/// </summary>
public class FarmCandidateResponse
{
    public Guid ProfessionalId { get; set; }
    public long PublicId { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public ProfessionalRole Role { get; set; }
    public string Specialty { get; set; } = string.Empty;

    /// <summary>Matrícula profesional, si la cargó.</summary>
    public string? LicenseNumber { get; set; }

    public bool IsVerified { get; set; }
    public int YearsExperience { get; set; }

    /// <summary>Cuándo aceptó el match con el productor.</summary>
    public DateTime? MatchedAt { get; set; }
}
