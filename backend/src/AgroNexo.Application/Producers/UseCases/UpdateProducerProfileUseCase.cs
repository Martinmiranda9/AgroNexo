using AgroNexo.Application.Producers.DTOs;
using AgroNexo.Domain.Exceptions;
using AgroNexo.Domain.Interfaces;

namespace AgroNexo.Application.Producers.UseCases;

/// <summary>
/// Updates an authenticated producer's personal profile information.
/// </summary>
public class UpdateProducerProfileUseCase : IUpdateProducerProfileUseCase
{
    private readonly IProducerRepository _producerRepository;
    private readonly IUnitOfWork _unitOfWork;

    public UpdateProducerProfileUseCase(
        IProducerRepository producerRepository,
        IUnitOfWork unitOfWork)
    {
        _producerRepository = producerRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<ProducerProfileResponse> ExecuteAsync(
        string auth0UserId,
        UpdateProducerProfileRequest request,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(auth0UserId))
            throw new DomainValidationException(nameof(auth0UserId), "El identificador de usuario es obligatorio.");

        if (request == null)
            throw new ArgumentNullException(nameof(request));

        var producer = await _producerRepository.GetByAuth0UserIdAsync(auth0UserId, cancellationToken);
        if (producer == null)
            throw new EntityNotFoundException("Productor", auth0UserId);

        producer.UpdateProfile(request.FirstName, request.LastName, request.DocumentNumber ?? string.Empty);
        await _producerRepository.UpdateAsync(producer, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return new ProducerProfileResponse
        {
            Id = producer.Id,
            TenantId = producer.TenantId,
            Auth0UserId = producer.Auth0UserId,
            FirstName = producer.FirstName,
            LastName = producer.LastName,
            DocumentNumber = producer.DocumentNumber,
            IsActive = producer.IsActive,
            CreatedAt = producer.CreatedAt,
            UpdatedAt = producer.UpdatedAt
        };
    }
}
