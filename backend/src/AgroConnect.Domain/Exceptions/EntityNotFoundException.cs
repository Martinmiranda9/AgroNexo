namespace AgroConnect.Domain.Exceptions;

/// <summary>
/// Exception thrown when a requested domain entity is not found.
/// </summary>
public class EntityNotFoundException : DomainException
{
    public string EntityName { get; }
    public object Key { get; }

    public EntityNotFoundException(string entityName, object key)
        : base($"No se encontró el recurso '{entityName}' con identificador '{key}'.")
    {
        EntityName = entityName;
        Key = key;
    }
}
