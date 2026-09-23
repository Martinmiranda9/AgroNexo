using AgroNexo.Domain.Exceptions;
using AgroNexo.Domain.Interfaces;

namespace AgroNexo.Application.Farms.UseCases;

/// <summary>
/// Soft-deletes a farm (sets IsActive = false) owned by the authenticated producer.
/// </summary>
public class DeleteFarmUseCase : IDeleteFarmUseCase
{
    private readonly IProducerRepository _producerRepository;
    private readonly IFarmRepository _farmRepository;
    private readonly IUnitOfWork _unitOfWork;

    public DeleteFarmUseCase(
        IProducerRepository producerRepository,
        IFarmRepository farmRepository,
        IUnitOfWork unitOfWork)
    {
        _producerRepository = producerRepository;
        _farmRepository = farmRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task ExecuteAsync(Guid farmId, string auth0UserId, CancellationToken cancellationToken = default)
    {
        var producer = await _producerRepository.GetByAuth0UserIdAsync(auth0UserId, cancellationToken)
            ?? throw new EntityNotFoundException("Producer", auth0UserId);

        var farm = await _farmRepository.GetByIdAsync(farmId, cancellationToken)
            ?? throw new EntityNotFoundException("Farm", farmId.ToString());

        if (farm.ProducerId != producer.Id)
            throw new CrossTenantAccessException($"El productor no tiene permisos para eliminar el lote '{farmId}'.");

        farm.Deactivate();
        await _farmRepository.UpdateAsync(farm, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}
