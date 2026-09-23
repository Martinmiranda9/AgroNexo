namespace AgroConnect.Domain.Exceptions;

/// <summary>
/// Exception thrown when domain validation rules are violated.
/// </summary>
public class DomainValidationException : DomainException
{
    public IReadOnlyDictionary<string, string[]> Errors { get; }

    public DomainValidationException(string message) : base(message)
    {
        Errors = new Dictionary<string, string[]>();
    }

    public DomainValidationException(string message, IReadOnlyDictionary<string, string[]> errors) : base(message)
    {
        Errors = errors;
    }

    public DomainValidationException(string propertyName, string error)
        : base($"Error de validación en '{propertyName}': {error}")
    {
        Errors = new Dictionary<string, string[]>
        {
            { propertyName, new[] { error } }
        };
    }
}
