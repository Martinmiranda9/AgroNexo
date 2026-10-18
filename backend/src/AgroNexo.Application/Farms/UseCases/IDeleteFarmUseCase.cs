namespace AgroNexo.Application.Farms.UseCases;

public interface IDeleteFarmUseCase
{
    Task ExecuteAsync(Guid farmId, string firebaseUid, CancellationToken cancellationToken = default);
}
