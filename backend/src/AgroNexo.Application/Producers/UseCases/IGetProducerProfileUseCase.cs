using AgroNexo.Application.Producers.DTOs;

namespace AgroNexo.Application.Producers.UseCases;

/// <summary>
/// Use case contract for retrieving a producer's profile.
/// </summary>
public interface IGetProducerProfileUseCase
{
    Task<ProducerProfileResponse?> GetByFirebaseUidAsync(string firebaseUid, CancellationToken cancellationToken = default);
    Task<ProducerProfileResponse?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
}
