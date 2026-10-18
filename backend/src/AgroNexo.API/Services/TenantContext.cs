using AgroNexo.Application.Common.Interfaces;

namespace AgroNexo.API.Services;

/// <summary>
/// Scoped implementation of ITenantContext for resolving the current tenant and user identity.
/// </summary>
public class TenantContext : ITenantContext
{
    public Guid TenantId { get; set; } = Guid.Empty;
    public string? FirebaseUid { get; set; }
    public string? UserRole { get; set; }
    public bool IsAuthenticated => !string.IsNullOrWhiteSpace(FirebaseUid);

    public void SetContext(Guid tenantId, string? firebaseUid, string? userRole)
    {
        TenantId = tenantId;
        FirebaseUid = firebaseUid;
        UserRole = userRole;
    }
}
