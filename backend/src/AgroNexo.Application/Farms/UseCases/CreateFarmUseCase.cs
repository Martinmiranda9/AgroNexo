using AgroNexo.Application.Common.Helpers;
using AgroNexo.Application.Common.Interfaces;
using AgroNexo.Application.Farms.DTOs;
using AgroNexo.Application.Farms.Services;
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
    private readonly IPlaceLookupService _placeLookup;
    private readonly IUnitOfWork _unitOfWork;

    public CreateFarmUseCase(
        IProducerRepository producerRepository,
        IFarmRepository farmRepository,
        IPlaceLookupService placeLookup,
        IUnitOfWork unitOfWork)
    {
        _producerRepository = producerRepository;
        _farmRepository = farmRepository;
        _placeLookup = placeLookup;
        _unitOfWork = unitOfWork;
    }

    public async Task<FarmResponse> ExecuteAsync(
        CreateFarmRequest request,
        string firebaseUid,
        CancellationToken cancellationToken = default)
    {
        if (request == null) throw new ArgumentNullException(nameof(request));

        var producer = await _producerRepository.GetByFirebaseUidAsync(firebaseUid, cancellationToken)
            ?? throw new EntityNotFoundException("Producer", firebaseUid);

        var location = request.LocationCoordinates != null && request.LocationCoordinates.Count > 0
            ? GeometryHelper.CreatePolygon(request.LocationCoordinates)
            : null;

        var farm = new Farm(
            producer.TenantId,
            producer.Id,
            request.Name,
            request.TotalHectares,
            location,
            request.Description);

        await FarmPlaceResolver.ApplyAsync(farm, _placeLookup, cancellationToken);

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
            Description = farm.Description,
            ArchivedAt = farm.ArchivedAt,
            LocationCoordinates = GeometryHelper.ToCoordinateDtos(farm.Location),
            Province = farm.Province,
            Department = farm.Department,
            Locality = farm.Locality,
            CreatedAt = farm.CreatedAt,
            UpdatedAt = farm.UpdatedAt
        };
    }
}
