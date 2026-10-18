using AgroNexo.Application.Common.Models;
using AgroNexo.Application.Farms.DTOs;

namespace AgroNexo.Application.Farms.UseCases;

public interface IManageFarmActivitiesUseCase
{
    /// <summary>Actividades del campo, paginadas, para el dueño o un profesional del equipo.</summary>
    Task<PagedResult<FarmActivityResponse>> ListAsync(Guid farmId, FarmActivityFilterRequest filter, string firebaseUid, CancellationToken cancellationToken = default);

    /// <summary>El dueño o un profesional del equipo registra una actividad.</summary>
    Task<FarmActivityResponse> CreateAsync(Guid farmId, FarmActivityRequest request, string firebaseUid, CancellationToken cancellationToken = default);

    /// <summary>El dueño o quien la registró cambia el estado.</summary>
    Task<FarmActivityResponse> UpdateStatusAsync(Guid farmId, Guid activityId, UpdateFarmActivityStatusRequest request, string firebaseUid, CancellationToken cancellationToken = default);

    /// <summary>El dueño o quien la registró la borra.</summary>
    Task DeleteAsync(Guid farmId, Guid activityId, string firebaseUid, CancellationToken cancellationToken = default);
}
