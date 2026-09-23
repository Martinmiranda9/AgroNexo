using AgroNexo.Application.Common.Helpers;
using AgroNexo.Application.Farms.DTOs;
using AgroNexo.Domain.Entities;
using AgroNexo.Domain.Exceptions;
using AgroNexo.Domain.Interfaces;

namespace AgroNexo.Application.Farms.UseCases;

/// <summary>
/// Creates a new farm/lot for the authenticated producer and persists it.
/// </summary>
public class CreateFarmUseCase : ICreateFarmUseCase
{
    private readonly IProducerRepository _producerRepository;
    private readonly IFarmRepository _farmRepository;
    private readonly IUnitOfWork _unitOfWork;

    public CreateFarmUseCase(
        IProducerRepository producerRepository,
        IFarmRepository farmRepository,
        IUnitOfWork unitOfWork)
    {
        _producerRepository = producerRepository;
        _farmRepository = farmRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<FarmResponse> ExecuteAsync(
        CreateFarmRequest request,
        string auth0UserId,
        CancellationToken cancellationToken = default)
    {
        if (request == null) throw new ArgumentNullException(nameof(request));

        var producer = await _producerRepository.GetByAuth0UserIdAsync(auth0UserId, cancellationToken)
            ?? throw new EntityNotFoundException("Producer", auth0UserId);

        var location = request.LocationCoordinates != null && request.LocationCoordinates.Count > 0
            ? GeometryHelper.CreatePolygon(request.LocationCoordinates)
            : null;

        var farm = new Farm(
            producer.TenantId,
            producer.Id,
            request.Name,
            request.TotalHectares,
            location);

        await _farmRepository.AddAsync(farm, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return MapToResponse(farm, request.LocationCoordinates ?? new());
    }

    internal static FarmResponse MapToResponse(Farm farm, IEnumerable<Common.DTOs.CoordinateDto>? coordsOverride = null)
    {
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
