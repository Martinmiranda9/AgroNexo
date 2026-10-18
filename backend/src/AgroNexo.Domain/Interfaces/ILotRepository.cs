using AgroNexo.Domain.Entities;

namespace AgroNexo.Domain.Interfaces;

/// <summary>
/// Lotes de un campo con sus cultivos. Las entidades quedan trackeadas: los cambios se guardan con la unidad de trabajo.
/// </summary>
public interface ILotRepository
{
    /// <summary>Lote activo del campo, con sus cultivos.</summary>
    Task<Lot?> GetByIdAsync(Guid farmId, Guid lotId, CancellationToken cancellationToken = default);

    /// <summary>Lotes activos del campo, con sus cultivos, ordenados por nombre.</summary>
    Task<IReadOnlyList<Lot>> GetByFarmAsync(Guid farmId, CancellationToken cancellationToken = default);

    /// <summary>Nombres de lotes por id, incluidos los dados de baja (las actividades viejas los siguen nombrando).</summary>
    Task<IReadOnlyDictionary<Guid, string>> GetNamesAsync(IReadOnlyCollection<Guid> lotIds, CancellationToken cancellationToken = default);

    Task<bool> NameExistsAsync(Guid farmId, string name, Guid? excludeId = null, CancellationToken cancellationToken = default);

    /// <summary>¿Algún lote activo tiene cultivos en la campaña?</summary>
    Task<bool> AnyCropInCampaignAsync(Guid campaignId, CancellationToken cancellationToken = default);

    Task AddAsync(Lot lot, CancellationToken cancellationToken = default);
    Task AddCropAsync(LotCrop lotCrop, CancellationToken cancellationToken = default);
    void RemoveCrop(LotCrop lotCrop);
}
