using AgroConnect.Application.Common.DTOs;
using AgroConnect.Domain.Enums;

namespace AgroConnect.Application.Professionals.DTOs;

/// <summary>
/// Response DTO representing an agricultural professional's profile and service attributes.
/// </summary>
public class ProfessionalProfileResponse
{
    public Guid Id { get; set; }

    /// <summary>Human-readable numeric ID shown to the user (prefix varies by role: 12/14/16/19).</summary>
    public long PublicId { get; set; }

    public Guid TenantId { get; set; }
    public string Auth0UserId { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string DocumentNumber { get; set; } = string.Empty;
    public ProfessionalRole Role { get; set; }
    public string Specialty { get; set; } = string.Empty;
    public int YearsExperience { get; set; }
    public int MaxCapacity { get; set; }
    public bool IsVerified { get; set; }
    public bool IsActive { get; set; }
    public List<CoordinateDto> CoverageAreaCoordinates { get; set; } = new();
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}
