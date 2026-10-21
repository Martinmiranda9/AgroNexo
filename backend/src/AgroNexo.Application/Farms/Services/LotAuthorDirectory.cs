using AgroNexo.Application.Farms.DTOs;
using AgroNexo.Domain.Entities;
using AgroNexo.Domain.Interfaces;

namespace AgroNexo.Application.Farms.Services;

/// <summary>
/// Nombres de quienes crearon o corrigieron lotes, para mostrarlos en el lote. Sin contacto, como el resto del equipo.
/// </summary>
public sealed class LotAuthors
{
    private readonly string _ownerName;
    private readonly IReadOnlyDictionary<Guid, Professional?> _professionals;

    public LotAuthors(string ownerName, IReadOnlyDictionary<Guid, Professional?> professionals)
    {
        _ownerName = ownerName;
        _professionals = professionals;
    }

    /// <summary><c>null</c> es el productor dueño; si no, el profesional (aunque ya no esté en el equipo).</summary>
    public LotEditorResponse Resolve(Guid? professionalId)
    {
        if (professionalId == null)
            return new LotEditorResponse { Name = _ownerName };

        var professional = _professionals.GetValueOrDefault(professionalId.Value);
        return new LotEditorResponse
        {
            Name = professional != null ? $"{professional.FirstName} {professional.LastName}".Trim() : "Profesional",
            Role = professional?.Role
        };
    }
}

public interface ILotAuthorDirectory
{
    /// <summary>Busca al productor dueño y a los profesionales que crearon o corrigieron estos lotes.</summary>
    Task<LotAuthors> LoadAsync(IEnumerable<Lot> lots, FarmAccess access, CancellationToken cancellationToken = default);
}

public class LotAuthorDirectory : ILotAuthorDirectory
{
    private readonly IProducerRepository _producerRepository;
    private readonly IProfessionalRepository _professionalRepository;

    public LotAuthorDirectory(IProducerRepository producerRepository, IProfessionalRepository professionalRepository)
    {
        _producerRepository = producerRepository;
        _professionalRepository = professionalRepository;
    }

    public async Task<LotAuthors> LoadAsync(IEnumerable<Lot> lots, FarmAccess access, CancellationToken cancellationToken = default)
    {
        var owner = access.Owner ?? await _producerRepository.GetByIdAsync(access.Farm.ProducerId, cancellationToken);
        var ownerName = owner != null ? $"{owner.FirstName} {owner.LastName}".Trim() : "Productor";

        // Pueden haber dejado el equipo: se buscan por id, aunque sean de otro tenant.
        var professionalIds = lots
            .SelectMany(l => new[] { l.CreatedByProfessionalId, l.BoundaryEditedByProfessionalId })
            .Where(id => id.HasValue)
            .Select(id => id!.Value)
            .Distinct();

        var professionals = new Dictionary<Guid, Professional?>();
        foreach (var id in professionalIds)
            professionals[id] = await _professionalRepository.GetByIdAcrossTenantsAsync(id, cancellationToken);

        return new LotAuthors(ownerName, professionals);
    }
}
