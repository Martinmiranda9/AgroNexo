namespace AgroConnect.Application.Farms.UseCases;

public interface IDeleteFarmUseCase
{
    Task ExecuteAsync(Guid farmId, string auth0UserId, CancellationToken cancellationToken = default);
}
