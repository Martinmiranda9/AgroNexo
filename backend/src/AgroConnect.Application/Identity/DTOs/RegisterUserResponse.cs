using AgroConnect.Domain.Enums;

namespace AgroConnect.Application.Identity.DTOs;

/// <summary>
/// Response DTO containing registered user and assigned tenant workspace details.
/// </summary>
public class RegisterUserResponse
{
    public Guid UserId { get; set; }

    /// <summary>Human-readable numeric public ID assigned after registration.</summary>
    public long PublicId { get; set; }

    public Guid TenantId { get; set; }
    public string TenantName { get; set; } = string.Empty;
    public string Auth0UserId { get; set; } = string.Empty;
    public UserType UserType { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string DocumentNumber { get; set; } = string.Empty;
    public string? ProducerType { get; set; }
    public string? Country { get; set; }
    public string? Province { get; set; }
    public string? City { get; set; }
    public string? Role { get; set; }
    public string? Specialty { get; set; }
    public DateTime CreatedAt { get; set; }
}

