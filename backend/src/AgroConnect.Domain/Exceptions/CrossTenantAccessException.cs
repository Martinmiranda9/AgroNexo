namespace AgroConnect.Domain.Exceptions;

/// <summary>
/// Exception thrown when an unauthorized cross-tenant data access is attempted.
/// </summary>
public class CrossTenantAccessException : DomainException
{
    public Guid RequestTenantId { get; }
    public Guid TargetTenantId { get; }

    public CrossTenantAccessException(Guid requestTenantId, Guid targetTenantId)
        : base($"Acceso denegado: el tenant '{requestTenantId}' no tiene permisos para acceder a recursos del tenant '{targetTenantId}'.")
    {
        RequestTenantId = requestTenantId;
        TargetTenantId = targetTenantId;
    }

    public CrossTenantAccessException(string message) : base(message)
    {
    }
}
