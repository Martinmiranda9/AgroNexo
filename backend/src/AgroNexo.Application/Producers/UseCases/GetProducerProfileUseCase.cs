using AgroNexo.Application.Producers.DTOs;
using AgroNexo.Domain.Entities;
using AgroNexo.Domain.Interfaces;

namespace AgroNexo.Application.Producers.UseCases;

/// <summary>
/// Retrieves producer profile details by Auth0 identifier or Producer ID.
/// </summary>
public class GetProducerProfileUseCase : IGetProducerProfileUseCase
{
    private readonly IProducerRepository _producerRepository;

    public GetProducerProfileUseCase(IProducerRepository producerRepository)
    {
        _producerRepository = producerRepository;
    }

    public async Task<ProducerProfileResponse?> GetByAuth0UserIdAsync(string auth0UserId, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(auth0UserId))
            return null;

        var producer = await _producerRepository.GetByAuth0UserIdAsync(auth0UserId, cancellationToken);
        return producer == null ? null : MapToResponse(producer);
    }

    public async Task<ProducerProfileResponse?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        if (id == Guid.Empty)
            return null;

        var producer = await _producerRepository.GetByIdAsync(id, cancellationToken);
        return producer == null ? null : MapToResponse(producer);
    }

    private static ProducerProfileResponse MapToResponse(Producer producer)
    {
        return new ProducerProfileResponse
        {
            Id = producer.Id,
            PublicId = producer.PublicId,
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
