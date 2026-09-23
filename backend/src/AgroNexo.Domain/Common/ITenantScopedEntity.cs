namespace AgroNexo.Domain.Common;

/// <summary>
/// Interface for entities that belong to a specific tenant workspace.
/// Enables automatic multi-tenant global query filters.
/// </summary>
public interface ITenantScopedEntity
{
    Guid TenantId { get; }
}
