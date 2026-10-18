using AgroNexo.Application.Producers.DTOs;
using AgroNexo.Domain.Entities;
using AgroNexo.Domain.Interfaces;

namespace AgroNexo.Application.Producers.UseCases;

/// <summary>
/// Retrieves producer profile details by Firebase identifier (`sub`) or Producer ID.
/// </summary>
public class GetProducerProfileUseCase : IGetProducerProfileUseCase
{
    private readonly IProducerRepository _producerRepository;

    public GetProducerProfileUseCase(IProducerRepository producerRepository)
    {
        _producerRepository = producerRepository;
    }

    public async Task<ProducerProfileResponse?> GetByFirebaseUidAsync(string firebaseUid, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(firebaseUid))
            return null;

        var producer = await _producerRepository.GetByFirebaseUidAsync(firebaseUid, cancellationToken);
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
            FirebaseUid = producer.FirebaseUid,
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
