using AgroNexo.Application.Farms.DTOs;

namespace AgroNexo.Application.Farms.UseCases;

public interface IGetFarmsUseCase
{
    Task<IReadOnlyList<FarmResponse>> ExecuteAsync(string firebaseUid, CancellationToken cancellationToken = default);
    Task<FarmResponse?> GetByIdAsync(Guid farmId, string firebaseUid, CancellationToken cancellationToken = default);
}
