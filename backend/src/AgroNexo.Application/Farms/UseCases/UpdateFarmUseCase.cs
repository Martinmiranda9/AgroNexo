using AgroNexo.Application.Common.Helpers;
using AgroNexo.Application.Farms.DTOs;
using AgroNexo.Domain.Exceptions;
using AgroNexo.Domain.Interfaces;

namespace AgroNexo.Application.Farms.UseCases;

/// <summary>
/// Updates name, hectares and location polygon of an existing farm owned by the authenticated producer.
/// </summary>
public class UpdateFarmUseCase : IUpdateFarmUseCase
{
    private readonly IProducerRepository _producerRepository;
    private readonly IFarmRepository _farmRepository;
    private readonly IUnitOfWork _unitOfWork;

    public UpdateFarmUseCase(
        IProducerRepository producerRepository,
        IFarmRepository farmRepository,
        IUnitOfWork unitOfWork)
    {
        _producerRepository = producerRepository;
        _farmRepository = farmRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<FarmResponse> ExecuteAsync(
        Guid farmId,
        UpdateFarmRequest request,
        string auth0UserId,
        CancellationToken cancellationToken = default)
    {
        var producer = await _producerRepository.GetByAuth0UserIdAsync(auth0UserId, cancellationToken)
            ?? throw new EntityNotFoundException("Producer", auth0UserId);

        var farm = await _farmRepository.GetByIdAsync(farmId, cancellationToken)
            ?? throw new EntityNotFoundException("Farm", farmId.ToString());

        if (farm.ProducerId != producer.Id)
            throw new CrossTenantAccessException($"El productor no tiene permisos para modificar el lote '{farmId}'.");

        var location = request.LocationCoordinates != null && request.LocationCoordinates.Count > 0
            ? GeometryHelper.CreatePolygon(request.LocationCoordinates)
            : null;

        farm.UpdateDetails(request.Name, request.TotalHectares, location);
        await _farmRepository.UpdateAsync(farm, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

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
