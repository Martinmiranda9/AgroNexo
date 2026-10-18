using AgroNexo.Application.Farms.DTOs;

namespace AgroNexo.Application.Farms.UseCases;

public interface IManageCampaignsUseCase
{
    /// <summary>Campañas del campo, para el dueño o un profesional del equipo.</summary>
    Task<IReadOnlyList<CampaignResponse>> ListAsync(Guid farmId, string firebaseUid, CancellationToken cancellationToken = default);

    /// <summary>El productor dueño crea una campaña.</summary>
    Task<CampaignResponse> CreateAsync(Guid farmId, CampaignRequest request, string firebaseUid, CancellationToken cancellationToken = default);

    /// <summary>El productor dueño corrige el nombre o las fechas de una campaña.</summary>
    Task<CampaignResponse> UpdateAsync(Guid farmId, Guid campaignId, CampaignRequest request, string firebaseUid, CancellationToken cancellationToken = default);

    /// <summary>El productor dueño borra una campaña vacía (sin cultivos ni actividades).</summary>
    Task DeleteAsync(Guid farmId, Guid campaignId, string firebaseUid, CancellationToken cancellationToken = default);
}
