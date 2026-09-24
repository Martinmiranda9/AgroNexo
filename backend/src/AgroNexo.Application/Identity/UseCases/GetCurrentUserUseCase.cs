using AgroNexo.Application.Identity.DTOs;
using AgroNexo.Domain.Enums;
using AgroNexo.Domain.Exceptions;
using AgroNexo.Domain.Interfaces;

namespace AgroNexo.Application.Identity.UseCases;

/// <summary>
/// Indica si la identidad de Auth0 ya completó el registro (Producer o Professional).
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

    public async Task<CurrentUserResponse> ExecuteAsync(string auth0UserId, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(auth0UserId))
            throw new DomainValidationException(nameof(auth0UserId), "El identificador de autenticación Auth0 es obligatorio.");

        var producer = await _producerRepository.GetByAuth0UserIdAsync(auth0UserId, cancellationToken);
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

        var professional = await _professionalRepository.GetByAuth0UserIdAsync(auth0UserId, cancellationToken);
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
