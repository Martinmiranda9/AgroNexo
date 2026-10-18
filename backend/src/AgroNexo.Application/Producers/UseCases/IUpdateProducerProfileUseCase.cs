using AgroNexo.Application.Producers.DTOs;

namespace AgroNexo.Application.Producers.UseCases;

/// <summary>
/// Use case contract for updating a producer's profile.
/// </summary>
public interface IUpdateProducerProfileUseCase
{
    Task<ProducerProfileResponse> ExecuteAsync(string firebaseUid, UpdateProducerProfileRequest request, CancellationToken cancellationToken = default);
}
