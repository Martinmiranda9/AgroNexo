using AgroConnect.Application.Farms.DTOs;

namespace AgroConnect.Application.Farms.UseCases;

public interface IUpdateFarmUseCase
{
    Task<FarmResponse> ExecuteAsync(Guid farmId, UpdateFarmRequest request, string auth0UserId, CancellationToken cancellationToken = default);
}
