using AgroNexo.Domain.Enums;

namespace AgroNexo.Application.Farms.DTOs;

/// <summary>
/// Profesional del equipo de un campo.
/// </summary>
public class FarmMemberResponse
{
    public Guid Id { get; set; }
    public Guid ProfessionalId { get; set; }
    public long PublicId { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public ProfessionalRole Role { get; set; }
    public string Specialty { get; set; } = string.Empty;
    public string? LicenseNumber { get; set; }
    public bool IsVerified { get; set; }
    public DateTime JoinedAt { get; set; }

    /// <summary>
    /// Contacto del profesional: solo lo recibe el productor. Entre profesionales del mismo campo no se comparte, porque
    /// no hay un match aceptado entre ellos.
    /// </summary>
    public FarmContactResponse? Contact { get; set; }
}
