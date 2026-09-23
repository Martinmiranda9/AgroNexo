using AgroNexo.Application.Common.Interfaces;

namespace AgroNexo.API.Services;

/// <summary>
/// Scoped implementation of ITenantContext for resolving the current tenant and user identity.
/// </summary>
public class TenantContext : ITenantContext
{
    public Guid TenantId { get; set; } = Guid.Empty;
    public string? Auth0UserId { get; set; }
    public string? UserRole { get; set; }
    public bool IsAuthenticated => !string.IsNullOrWhiteSpace(Auth0UserId);

    public void SetContext(Guid tenantId, string? auth0UserId, string? userRole)
    {
        TenantId = tenantId;
        Auth0UserId = auth0UserId;
        UserRole = userRole;
    }
}
