using AgroNexo.Domain.Entities;
using AgroNexo.Domain.Enums;

namespace AgroNexo.Domain.Interfaces;

/// <summary>
/// Actividades de un campo. El acceso al campo lo valida la capa de aplicación; acá solo se filtra por campo. Las
/// entidades quedan trackeadas: los cambios se guardan con la unidad de trabajo.
/// </summary>
public interface IFarmActivityRepository
{
    Task<FarmActivity?> GetByIdAsync(Guid farmId, Guid activityId, CancellationToken cancellationToken = default);

    /// <summary>Página de actividades, de la más reciente a la más vieja.</summary>
    Task<(IReadOnlyList<FarmActivity> Items, int TotalCount)> GetPagedAsync(
        Guid farmId,
        Guid? campaignId,
        Guid? lotId,
        FarmActivityStatus? status,
        int pageNumber,
        int pageSize,
        CancellationToken cancellationToken = default);

    /// <summary>Labores de campo con lote de una campaña (para el avance de labores).</summary>
    Task<IReadOnlyList<FarmActivity>> GetFieldLaborsAsync(Guid farmId, Guid campaignId, CancellationToken cancellationToken = default);

    /// <summary>Actividades creadas o finalizadas desde una fecha (para el resumen semanal).</summary>
    Task<IReadOnlyList<FarmActivity>> GetTouchedSinceAsync(Guid farmId, DateTime sinceUtc, CancellationToken cancellationToken = default);

    /// <summary>Actividades sin finalizar (Inicio o En proceso), opcionalmente de una campaña.</summary>
    Task<int> CountOpenAsync(Guid farmId, Guid? campaignId, CancellationToken cancellationToken = default);

    Task<bool> AnyInCampaignAsync(Guid campaignId, CancellationToken cancellationToken = default);

    Task AddAsync(FarmActivity activity, CancellationToken cancellationToken = default);
    void Remove(FarmActivity activity);
}
