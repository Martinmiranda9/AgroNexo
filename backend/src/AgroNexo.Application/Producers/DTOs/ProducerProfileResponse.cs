using AgroNexo.Domain.Enums;

namespace AgroNexo.Application.Producers.DTOs;

/// <summary>
/// Response DTO representing an agricultural producer's profile.
/// </summary>
public class ProducerProfileResponse
{
    public Guid Id { get; set; }

    /// <summary>Human-readable numeric ID shown to the user (prefix 10, e.g. 100001).</summary>
    public long PublicId { get; set; }

    public Guid TenantId { get; set; }
    public string Auth0UserId { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string DocumentNumber { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public string? ProducerType { get; set; }
    public HectaresRange? HectaresRange { get; set; }
    public List<ProfessionalRole> LookingFor { get; set; } = new();
    public string? Country { get; set; }
    public string? Province { get; set; }
    public string? City { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}

