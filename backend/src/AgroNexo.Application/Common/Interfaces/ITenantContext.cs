namespace AgroNexo.Application.Common.Interfaces;

/// <summary>
/// Scoped service for retrieving the current authenticated user's TenantId and Firebase claims.
/// </summary>
public interface ITenantContext
{
    Guid TenantId { get; }
    string? FirebaseUid { get; }
    string? UserRole { get; }
    bool IsAuthenticated { get; }
}
