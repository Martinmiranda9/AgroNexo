using AgroConnect.Application.Producers.DTOs;

namespace AgroConnect.Application.Producers.UseCases;

/// <summary>
/// Use case contract for retrieving a producer's profile.
/// </summary>
public interface IGetProducerProfileUseCase
{
    Task<ProducerProfileResponse?> GetByAuth0UserIdAsync(string auth0UserId, CancellationToken cancellationToken = default);
    Task<ProducerProfileResponse?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
}
