using AgroConnect.Application.Producers.DTOs;

namespace AgroConnect.Application.Producers.UseCases;

/// <summary>
/// Use case contract for updating a producer's profile.
/// </summary>
public interface IUpdateProducerProfileUseCase
{
    Task<ProducerProfileResponse> ExecuteAsync(string auth0UserId, UpdateProducerProfileRequest request, CancellationToken cancellationToken = default);
}
