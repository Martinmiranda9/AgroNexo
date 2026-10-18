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
        string firebaseUid,
        CancellationToken cancellationToken = default)
    {
        var producer = await _producerRepository.GetByFirebaseUidAsync(firebaseUid, cancellationToken)
            ?? throw new EntityNotFoundException("Producer", firebaseUid);

        var farms = await _farmRepository.GetByProducerIdAsync(producer.Id, cancellationToken);

        return farms.Select(f => CreateFarmUseCase.MapToResponse(f)).ToList();
    }

    public async Task<FarmResponse?> GetByIdAsync(
        Guid farmId,
        string firebaseUid,
        CancellationToken cancellationToken = default)
    {
        var producer = await _producerRepository.GetByFirebaseUidAsync(firebaseUid, cancellationToken)
            ?? throw new EntityNotFoundException("Producer", firebaseUid);

        var farm = await _farmRepository.GetByIdAsync(farmId, cancellationToken);
        if (farm == null || farm.ProducerId != producer.Id) return null;

        return CreateFarmUseCase.MapToResponse(farm);
    }
}
