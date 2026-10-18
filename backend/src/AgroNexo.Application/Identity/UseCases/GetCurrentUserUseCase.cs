using AgroNexo.Application.Identity.DTOs;
using AgroNexo.Domain.Enums;
using AgroNexo.Domain.Exceptions;
using AgroNexo.Domain.Interfaces;

namespace AgroNexo.Application.Identity.UseCases;

/// <summary>
/// Indica si la identidad de Firebase ya completó el registro (Producer o Professional).
/// </summary>
public class GetCurrentUserUseCase : IGetCurrentUserUseCase
{
    private readonly IProducerRepository _producerRepository;
    private readonly IProfessionalRepository _professionalRepository;

    public GetCurrentUserUseCase(
        IProducerRepository producerRepository,
        IProfessionalRepository professionalRepository)
    {
        _producerRepository = producerRepository;
        _professionalRepository = professionalRepository;
    }

    public async Task<CurrentUserResponse> ExecuteAsync(string firebaseUid, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(firebaseUid))
            throw new DomainValidationException(nameof(firebaseUid), "El identificador de autenticación es obligatorio.");

        var producer = await _producerRepository.GetByFirebaseUidAsync(firebaseUid, cancellationToken);
        if (producer != null)
        {
            return new CurrentUserResponse
            {
                IsRegistered = true,
                UserType = UserType.Producer,
                PublicId = producer.PublicId,
                FirstName = producer.FirstName
            };
        }

        var professional = await _professionalRepository.GetByFirebaseUidAsync(firebaseUid, cancellationToken);
        if (professional != null)
        {
            return new CurrentUserResponse
            {
                IsRegistered = true,
                UserType = UserType.Professional,
                PublicId = professional.PublicId,
                FirstName = professional.FirstName
            };
        }

        return new CurrentUserResponse { IsRegistered = false };
    }
}
