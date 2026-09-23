using AgroConnect.Application.Farms.DTOs;

namespace AgroConnect.Application.Farms.UseCases;

public interface IGetFarmsUseCase
{
    Task<IReadOnlyList<FarmResponse>> ExecuteAsync(string auth0UserId, CancellationToken cancellationToken = default);
    Task<FarmResponse?> GetByIdAsync(Guid farmId, string auth0UserId, CancellationToken cancellationToken = default);
}
