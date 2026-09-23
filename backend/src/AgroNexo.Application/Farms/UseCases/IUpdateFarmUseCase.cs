using AgroNexo.Application.Farms.DTOs;

namespace AgroNexo.Application.Farms.UseCases;

public interface IUpdateFarmUseCase
{
    Task<FarmResponse> ExecuteAsync(Guid farmId, UpdateFarmRequest request, string auth0UserId, CancellationToken cancellationToken = default);
}
