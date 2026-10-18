using AgroNexo.Application.Farms.DTOs;
using AgroNexo.Application.Farms.Services;
using AgroNexo.Domain.Entities;
using AgroNexo.Domain.Exceptions;
using AgroNexo.Domain.Interfaces;

namespace AgroNexo.Application.Farms.UseCases;

/// <summary>
/// Campañas del campo. Las ve todo el equipo; solo el productor dueño las crea, edita o borra.
/// </summary>
public class ManageCampaignsUseCase : IManageCampaignsUseCase
{
    private readonly IFarmAccessService _farmAccessService;
    private readonly ICampaignRepository _campaignRepository;
    private readonly ILotRepository _lotRepository;
    private readonly IFarmActivityRepository _farmActivityRepository;
    private readonly IUnitOfWork _unitOfWork;

    public ManageCampaignsUseCase(
        IFarmAccessService farmAccessService,
        ICampaignRepository campaignRepository,
        ILotRepository lotRepository,
        IFarmActivityRepository farmActivityRepository,
        IUnitOfWork unitOfWork)
    {
        _farmAccessService = farmAccessService;
        _campaignRepository = campaignRepository;
        _lotRepository = lotRepository;
        _farmActivityRepository = farmActivityRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<IReadOnlyList<CampaignResponse>> ListAsync(Guid farmId, string firebaseUid, CancellationToken cancellationToken = default)
    {
        await _farmAccessService.GetAccessAsync(farmId, firebaseUid, cancellationToken);
        var campaigns = await _campaignRepository.GetByFarmAsync(farmId, cancellationToken);
        return campaigns.Select(FarmPlanningMapper.ToResponse).ToList();
    }

    public async Task<CampaignResponse> CreateAsync(Guid farmId, CampaignRequest request, string firebaseUid, CancellationToken cancellationToken = default)
    {
        if (request == null) throw new ArgumentNullException(nameof(request));

        var access = await _farmAccessService.GetOwnerAccessAsync(farmId, firebaseUid, cancellationToken);
        access.Farm.EnsureNotArchived();

        if (await _campaignRepository.NameExistsAsync(farmId, request.Name, null, cancellationToken))
            throw new DuplicateFarmRecordException($"Ya existe la campaña {request.Name.Trim()} en este campo.");

        var campaign = new Campaign(farmId, request.Name, request.StartsOn!.Value, request.EndsOn!.Value);
        await _campaignRepository.AddAsync(campaign, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return FarmPlanningMapper.ToResponse(campaign);
    }

    public async Task<CampaignResponse> UpdateAsync(Guid farmId, Guid campaignId, CampaignRequest request, string firebaseUid, CancellationToken cancellationToken = default)
    {
        if (request == null) throw new ArgumentNullException(nameof(request));

        var access = await _farmAccessService.GetOwnerAccessAsync(farmId, firebaseUid, cancellationToken);
        access.Farm.EnsureNotArchived();

        var campaign = await _campaignRepository.GetByIdAsync(farmId, campaignId, cancellationToken)
            ?? throw new EntityNotFoundException("Campaña", campaignId);

        if (await _campaignRepository.NameExistsAsync(farmId, request.Name, campaignId, cancellationToken))
            throw new DuplicateFarmRecordException($"Ya existe la campaña {request.Name.Trim()} en este campo.");

        campaign.Update(request.Name, request.StartsOn!.Value, request.EndsOn!.Value);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return FarmPlanningMapper.ToResponse(campaign);
    }

    public async Task DeleteAsync(Guid farmId, Guid campaignId, string firebaseUid, CancellationToken cancellationToken = default)
    {
        var access = await _farmAccessService.GetOwnerAccessAsync(farmId, firebaseUid, cancellationToken);
        access.Farm.EnsureNotArchived();

        var campaign = await _campaignRepository.GetByIdAsync(farmId, campaignId, cancellationToken)
            ?? throw new EntityNotFoundException("Campaña", campaignId);

        // Una campaña con historia no se borra: se perderían cultivos y actividades del equipo.
        if (await _lotRepository.AnyCropInCampaignAsync(campaignId, cancellationToken)
            || await _farmActivityRepository.AnyInCampaignAsync(campaignId, cancellationToken))
            throw new DomainException("La campaña tiene cultivos o actividades cargadas: no se puede borrar.");

        _campaignRepository.Remove(campaign);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}
