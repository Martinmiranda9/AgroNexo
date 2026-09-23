using AgroNexo.Application.Common.Helpers;
using AgroNexo.Application.Farms.DTOs;
using AgroNexo.Domain.Exceptions;
using AgroNexo.Domain.Interfaces;

namespace AgroNexo.Application.Farms.UseCases;

/// <summary>
/// Retrieves the list of farms belonging to the authenticated producer.
/// </summary>
public class GetFarmsUseCase : IGetFarmsUseCase
{
    private readonly IProducerRepository _producerRepository;
    private readonly IFarmRepository _farmRepository;

    public GetFarmsUseCase(IProducerRepository producerRepository, IFarmRepository farmRepository)
    {
        _producerRepository = producerRepository;
        _farmRepository = farmRepository;
    }

    public async Task<IReadOnlyList<FarmResponse>> ExecuteAsync(
        string auth0UserId,
        CancellationToken cancellationToken = default)
    {
        var producer = await _producerRepository.GetByAuth0UserIdAsync(auth0UserId, cancellationToken)
            ?? throw new EntityNotFoundException("Producer", auth0UserId);

        var farms = await _farmRepository.GetByProducerIdAsync(producer.Id, cancellationToken);

        return farms.Select(f => new FarmResponse
        {
            Id = f.Id,
            PublicId = f.PublicId,
            ProducerId = f.ProducerId,
            TenantId = f.TenantId,
            Name = f.Name,
            TotalHectares = f.TotalHectares,
            IsActive = f.IsActive,
            LocationCoordinates = GeometryHelper.ToCoordinateDtos(f.Location),
            CreatedAt = f.CreatedAt,
            UpdatedAt = f.UpdatedAt
        }).ToList();
    }

    public async Task<FarmResponse?> GetByIdAsync(
        Guid farmId,
        string auth0UserId,
        CancellationToken cancellationToken = default)
    {
        var producer = await _producerRepository.GetByAuth0UserIdAsync(auth0UserId, cancellationToken)
            ?? throw new EntityNotFoundException("Producer", auth0UserId);

        var farm = await _farmRepository.GetByIdAsync(farmId, cancellationToken);
        if (farm == null || farm.ProducerId != producer.Id) return null;

        return new FarmResponse
        {
            Id = farm.Id,
            PublicId = farm.PublicId,
            ProducerId = farm.ProducerId,
            TenantId = farm.TenantId,
            Name = farm.Name,
            TotalHectares = farm.TotalHectares,
            IsActive = farm.IsActive,
            LocationCoordinates = GeometryHelper.ToCoordinateDtos(farm.Location),
            CreatedAt = farm.CreatedAt,
            UpdatedAt = farm.UpdatedAt
        };
    }
}
