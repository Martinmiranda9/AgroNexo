using AgroNexo.Application.Identity.UseCases;
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

        RegisterUserUseCase.EnsurePhoneNumber(request.PhoneNumber);

        producer.UpdateProfile(
            request.FirstName,
            request.LastName,
            request.DocumentNumber ?? string.Empty,
            producer.ProducerType,
            producer.Country,
            producer.Province,
            producer.City,
            request.PhoneNumber,
            request.HectaresRange,
            request.LookingFor);
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
            PhoneNumber = producer.PhoneNumber,
            ProducerType = producer.ProducerType?.ToString(),
            Country = producer.Country,
            Province = producer.Province,
            City = producer.City,
            HectaresRange = producer.HectaresRange,
            LookingFor = producer.LookingFor.ToList(),
            IsActive = producer.IsActive,
            CreatedAt = producer.CreatedAt,
            UpdatedAt = producer.UpdatedAt
        };
    }
}
