using AgroNexo.Application.Common.Interfaces;

namespace AgroNexo.API.Services;

/// <summary>
/// Scoped implementation of ICurrentUserService for accessing authenticated user profile metadata.
/// </summary>
public class CurrentUserService : ICurrentUserService
{
    public string? UserId { get; set; }
    public string? Email { get; set; }
    public Guid? TenantId { get; set; }
    public string? Role { get; set; }
    public bool IsAuthenticated => !string.IsNullOrWhiteSpace(UserId);

    public void SetUser(string? userId, string? email, Guid? tenantId, string? role)
    {
        UserId = userId;
        Email = email;
        TenantId = tenantId;
        Role = role;
    }
}
