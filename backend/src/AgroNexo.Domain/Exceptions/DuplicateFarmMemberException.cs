namespace AgroNexo.Domain.Exceptions;

/// <summary>
/// Se lanza al invitar a un profesional que ya forma parte del equipo activo del campo.
/// </summary>
public class DuplicateFarmMemberException : DomainException
{
    public Guid FarmId { get; }
    public Guid ProfessionalId { get; }

    public DuplicateFarmMemberException(Guid farmId, Guid professionalId)
        : base("El profesional ya forma parte del equipo de este campo.")
    {
        FarmId = farmId;
        ProfessionalId = professionalId;
    }
}
