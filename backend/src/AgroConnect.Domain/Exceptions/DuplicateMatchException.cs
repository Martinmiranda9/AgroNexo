namespace AgroConnect.Domain.Exceptions;

/// <summary>
/// Exception thrown when attempting to create a duplicate active or pending match between the same Producer and Professional.
/// </summary>
public class DuplicateMatchException : DomainException
{
    public Guid ProducerId { get; }
    public Guid ProfessionalId { get; }

    public DuplicateMatchException(Guid producerId, Guid professionalId)
        : base($"Ya existe una solicitud o vínculo de Match pendiente o activo entre el productor '{producerId}' y el profesional '{professionalId}'.")
    {
        ProducerId = producerId;
        ProfessionalId = professionalId;
    }
}
