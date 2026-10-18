namespace AgroNexo.Domain.Exceptions;

/// <summary>
/// Se lanza cuando un registro del campo choca con otro que ya existe: una campaña o un lote con el mismo nombre, o el
/// mismo cultivo dos veces en un lote y campaña.
/// </summary>
public class DuplicateFarmRecordException : DomainException
{
    public DuplicateFarmRecordException(string message) : base(message)
    {
    }
}
