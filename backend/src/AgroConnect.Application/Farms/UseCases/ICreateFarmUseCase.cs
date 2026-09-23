using AgroConnect.Application.Farms.DTOs;

namespace AgroConnect.Application.Farms.UseCases;

public interface ICreateFarmUseCase
{
    Task<FarmResponse> ExecuteAsync(CreateFarmRequest request, string auth0UserId, CancellationToken cancellationToken = default);
}
