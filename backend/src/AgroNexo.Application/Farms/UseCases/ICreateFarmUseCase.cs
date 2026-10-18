using AgroNexo.Application.Farms.DTOs;

namespace AgroNexo.Application.Farms.UseCases;

public interface ICreateFarmUseCase
{
    Task<FarmResponse> ExecuteAsync(CreateFarmRequest request, string firebaseUid, CancellationToken cancellationToken = default);
}
