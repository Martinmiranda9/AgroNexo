using AgroNexo.Application.Farms.DTOs;

namespace AgroNexo.Application.Farms.UseCases;

public interface IGetFarmDashboardUseCase
{
    /// <summary>
    /// Tablero del campo para el dueño o un profesional del equipo. Sin <paramref name="campaignId"/>, muestra la campaña
    /// que contiene hoy o la más reciente.
    /// </summary>
    Task<FarmDashboardResponse> GetAsync(Guid farmId, Guid? campaignId, string firebaseUid, CancellationToken cancellationToken = default);
}
