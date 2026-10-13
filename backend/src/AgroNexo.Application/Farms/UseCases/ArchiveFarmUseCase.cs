using AgroNexo.Application.Farms.DTOs;
using AgroNexo.Application.Farms.Services;
using AgroNexo.Domain.Exceptions;
using AgroNexo.Domain.Interfaces;

namespace AgroNexo.Application.Farms.UseCases;

/// <summary>
/// El productor archiva el campo: queda en solo lectura y todo el equipo se da de baja con él. No se reabre.
/// </summary>
public class ArchiveFarmUseCase : IArchiveFarmUseCase
{
    private readonly IFarmAccessService _farmAccessService;
    private readonly IFarmRepository _farmRepository;
    private readonly IFarmMemberRepository _farmMemberRepository;
    private readonly IUnitOfWork _unitOfWork;

    public ArchiveFarmUseCase(
        IFarmAccessService farmAccessService,
        IFarmRepository farmRepository,
        IFarmMemberRepository farmMemberRepository,
        IUnitOfWork unitOfWork)
    {
        _farmAccessService = farmAccessService;
        _farmRepository = farmRepository;
        _farmMemberRepository = farmMemberRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<FarmResponse> ExecuteAsync(
        Guid farmId,
        UpdateFarmStatusRequest request,
        string auth0UserId,
        CancellationToken cancellationToken = default)
    {
        if (request?.Archived != true)
            throw new DomainValidationException(nameof(UpdateFarmStatusRequest.Archived), "Un campo archivado no se puede reabrir.");

        var access = await _farmAccessService.GetOwnerAccessAsync(farmId, auth0UserId, cancellationToken);
        var farm = access.Farm;

        farm.Archive();
        foreach (var member in await _farmMemberRepository.GetActiveByFarmAsync(farmId, cancellationToken))
        {
            member.CloseWithFarm();
            await _farmMemberRepository.UpdateAsync(member, cancellationToken);
        }

        await _farmRepository.UpdateAsync(farm, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return CreateFarmUseCase.MapToResponse(farm);
    }
}
