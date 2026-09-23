namespace AgroConnect.Application.Common.Interfaces;

/// <summary>
/// Scoped service for retrieving the current authenticated user's TenantId and Auth0 claims.
/// </summary>
public interface ITenantContext
{
    Guid TenantId { get; }
    string? Auth0UserId { get; }
    string? UserRole { get; }
    bool IsAuthenticated { get; }
}
