using AgroNexo.Application.Farms.DTOs;

namespace AgroNexo.Application.Farms.UseCases;

public interface IArchiveFarmUseCase
{
    Task<FarmResponse> ExecuteAsync(Guid farmId, UpdateFarmStatusRequest request, string auth0UserId, CancellationToken cancellationToken = default);
}
