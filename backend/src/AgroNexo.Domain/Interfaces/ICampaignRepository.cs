using AgroNexo.Domain.Entities;

namespace AgroNexo.Domain.Interfaces;

/// <summary>
/// Campañas de un campo. El acceso al campo lo valida la capa de aplicación; acá solo se filtra por campo. Las entidades
/// quedan trackeadas: los cambios se guardan con la unidad de trabajo.
/// </summary>
public interface ICampaignRepository
{
    Task<Campaign?> GetByIdAsync(Guid farmId, Guid campaignId, CancellationToken cancellationToken = default);

    /// <summary>Campañas del campo, de la más nueva a la más vieja.</summary>
    Task<IReadOnlyList<Campaign>> GetByFarmAsync(Guid farmId, CancellationToken cancellationToken = default);

    Task<bool> NameExistsAsync(Guid farmId, string name, Guid? excludeId = null, CancellationToken cancellationToken = default);

    Task AddAsync(Campaign campaign, CancellationToken cancellationToken = default);
    void Remove(Campaign campaign);
}
