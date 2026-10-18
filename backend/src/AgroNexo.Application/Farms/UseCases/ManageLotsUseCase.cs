using AgroNexo.Application.Farms.DTOs;
using AgroNexo.Application.Farms.Services;
using AgroNexo.Domain.Entities;
using AgroNexo.Domain.Exceptions;
using AgroNexo.Domain.Interfaces;

namespace AgroNexo.Application.Farms.UseCases;

/// <summary>
/// Lotes del campo y sus cultivos por campaña. Los ve todo el equipo; solo el productor dueño los administra.
/// </summary>
public class ManageLotsUseCase : IManageLotsUseCase
{
    private readonly IFarmAccessService _farmAccessService;
    private readonly ILotRepository _lotRepository;
    private readonly ICampaignRepository _campaignRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly TimeProvider _clock;

    public ManageLotsUseCase(
        IFarmAccessService farmAccessService,
        ILotRepository lotRepository,
        ICampaignRepository campaignRepository,
        IUnitOfWork unitOfWork,
        TimeProvider clock)
    {
        _farmAccessService = farmAccessService;
        _lotRepository = lotRepository;
        _campaignRepository = campaignRepository;
        _unitOfWork = unitOfWork;
        _clock = clock;
    }

    public async Task<IReadOnlyList<LotResponse>> ListAsync(Guid farmId, string firebaseUid, CancellationToken cancellationToken = default)
    {
        await _farmAccessService.GetAccessAsync(farmId, firebaseUid, cancellationToken);
        var today = FarmCalendar.Today(_clock);
        var lots = await _lotRepository.GetByFarmAsync(farmId, cancellationToken);
        return lots.Select(l => FarmPlanningMapper.ToResponse(l, today)).ToList();
    }

    public async Task<LotResponse> CreateAsync(Guid farmId, LotRequest request, string firebaseUid, CancellationToken cancellationToken = default)
    {
        if (request == null) throw new ArgumentNullException(nameof(request));

        var access = await _farmAccessService.GetOwnerAccessAsync(farmId, firebaseUid, cancellationToken);
        access.Farm.EnsureNotArchived();

        if (await _lotRepository.NameExistsAsync(farmId, request.Name, null, cancellationToken))
            throw new DuplicateFarmRecordException($"Ya hay un lote llamado {request.Name.Trim()} en este campo.");

        var lots = await _lotRepository.GetByFarmAsync(farmId, cancellationToken);
        EnsureFitsInFarm(access.Farm, lots.Sum(l => l.Hectares) + request.Hectares);

        var lot = new Lot(farmId, request.Name, request.Hectares);
        await _lotRepository.AddAsync(lot, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return FarmPlanningMapper.ToResponse(lot, FarmCalendar.Today(_clock));
    }

    public async Task<LotResponse> UpdateAsync(Guid farmId, Guid lotId, LotRequest request, string firebaseUid, CancellationToken cancellationToken = default)
    {
        if (request == null) throw new ArgumentNullException(nameof(request));

        var access = await _farmAccessService.GetOwnerAccessAsync(farmId, firebaseUid, cancellationToken);
        access.Farm.EnsureNotArchived();

        var lots = await _lotRepository.GetByFarmAsync(farmId, cancellationToken);
        var lot = lots.FirstOrDefault(l => l.Id == lotId) ?? throw new EntityNotFoundException("Lote", lotId);

        if (await _lotRepository.NameExistsAsync(farmId, request.Name, lotId, cancellationToken))
            throw new DuplicateFarmRecordException($"Ya hay un lote llamado {request.Name.Trim()} en este campo.");

        EnsureFitsInFarm(access.Farm, lots.Where(l => l.Id != lotId).Sum(l => l.Hectares) + request.Hectares);

        lot.Update(request.Name, request.Hectares);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return FarmPlanningMapper.ToResponse(lot, FarmCalendar.Today(_clock));
    }

    public async Task DeleteAsync(Guid farmId, Guid lotId, string firebaseUid, CancellationToken cancellationToken = default)
    {
        var access = await _farmAccessService.GetOwnerAccessAsync(farmId, firebaseUid, cancellationToken);
        access.Farm.EnsureNotArchived();

        var lot = await _lotRepository.GetByIdAsync(farmId, lotId, cancellationToken)
            ?? throw new EntityNotFoundException("Lote", lotId);

        lot.Deactivate();
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }

    public async Task<LotResponse> AddCropAsync(Guid farmId, Guid lotId, LotCropRequest request, string firebaseUid, CancellationToken cancellationToken = default)
    {
        if (request == null) throw new ArgumentNullException(nameof(request));

        var access = await _farmAccessService.GetOwnerAccessAsync(farmId, firebaseUid, cancellationToken);
        access.Farm.EnsureNotArchived();

        var lot = await _lotRepository.GetByIdAsync(farmId, lotId, cancellationToken)
            ?? throw new EntityNotFoundException("Lote", lotId);

        var campaign = await _campaignRepository.GetByIdAsync(farmId, request.CampaignId!.Value, cancellationToken)
            ?? throw new EntityNotFoundException("Campaña", request.CampaignId.Value);

        var lotCrop = lot.AddCrop(campaign.Id, request.Crop!.Value, request.SowingDate, request.ExpectedHarvestDate);
        await _lotRepository.AddCropAsync(lotCrop, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return FarmPlanningMapper.ToResponse(lot, FarmCalendar.Today(_clock));
    }

    public async Task RemoveCropAsync(Guid farmId, Guid lotId, Guid lotCropId, string firebaseUid, CancellationToken cancellationToken = default)
    {
        var access = await _farmAccessService.GetOwnerAccessAsync(farmId, firebaseUid, cancellationToken);
        access.Farm.EnsureNotArchived();

        var lot = await _lotRepository.GetByIdAsync(farmId, lotId, cancellationToken)
            ?? throw new EntityNotFoundException("Lote", lotId);

        var lotCrop = lot.RemoveCrop(lotCropId);
        _lotRepository.RemoveCrop(lotCrop);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }

    /// <summary>Si el campo tiene hectáreas cargadas, los lotes no pueden sumar más.</summary>
    private static void EnsureFitsInFarm(Farm farm, decimal lotsTotal)
    {
        if (farm.TotalHectares > 0 && lotsTotal > farm.TotalHectares)
            throw new DomainValidationException(
                nameof(Lot.Hectares),
                $"Los lotes sumarían {lotsTotal:0.##} ha y el campo tiene {farm.TotalHectares:0.##} ha.");
    }
}
