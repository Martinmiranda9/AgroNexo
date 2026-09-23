namespace AgroNexo.Application.Common.Interfaces;

/// <summary>
/// Service contract to access information about the currently authenticated user.
/// </summary>
public interface ICurrentUserService
{
    string? UserId { get; }
    string? Email { get; }
    Guid? TenantId { get; }
    string? Role { get; }
    bool IsAuthenticated { get; }
}
