using AgroNexo.Application.Farms.DTOs;

namespace AgroNexo.Application.Farms.UseCases;

public interface ICreateFarmUseCase
{
    Task<FarmResponse> ExecuteAsync(CreateFarmRequest request, string auth0UserId, CancellationToken cancellationToken = default);
}
