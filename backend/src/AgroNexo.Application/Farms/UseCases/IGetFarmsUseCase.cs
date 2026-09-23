using AgroNexo.Application.Farms.DTOs;

namespace AgroNexo.Application.Farms.UseCases;

public interface IGetFarmsUseCase
{
    Task<IReadOnlyList<FarmResponse>> ExecuteAsync(string auth0UserId, CancellationToken cancellationToken = default);
    Task<FarmResponse?> GetByIdAsync(Guid farmId, string auth0UserId, CancellationToken cancellationToken = default);
}
