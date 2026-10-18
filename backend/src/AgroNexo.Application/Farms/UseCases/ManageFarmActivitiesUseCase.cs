using AgroNexo.Application.Common.Models;
using AgroNexo.Application.Farms.DTOs;
using AgroNexo.Application.Farms.Services;
using AgroNexo.Domain.Entities;
using AgroNexo.Domain.Exceptions;
using AgroNexo.Domain.Interfaces;

namespace AgroNexo.Application.Farms.UseCases;

/// <summary>
/// Actividades del campo. Todo el equipo las ve y las registra; el estado lo cambia el productor dueño o quien la
/// registró (un profesional no edita lo que cargó otro).
/// </summary>
public class ManageFarmActivitiesUseCase : IManageFarmActivitiesUseCase
{
    private readonly IFarmAccessService _farmAccessService;
    private readonly IFarmActivityRepository _farmActivityRepository;
    private readonly ICampaignRepository _campaignRepository;
    private readonly ILotRepository _lotRepository;
    private readonly IFarmActivityResponseFactory _responseFactory;
    private readonly IUnitOfWork _unitOfWork;

    public ManageFarmActivitiesUseCase(
        IFarmAccessService farmAccessService,
        IFarmActivityRepository farmActivityRepository,
        ICampaignRepository campaignRepository,
        ILotRepository lotRepository,
        IFarmActivityResponseFactory responseFactory,
        IUnitOfWork unitOfWork)
    {
        _farmAccessService = farmAccessService;
        _farmActivityRepository = farmActivityRepository;
        _campaignRepository = campaignRepository;
        _lotRepository = lotRepository;
        _responseFactory = responseFactory;
        _unitOfWork = unitOfWork;
    }

    public async Task<PagedResult<FarmActivityResponse>> ListAsync(Guid farmId, FarmActivityFilterRequest filter, string firebaseUid, CancellationToken cancellationToken = default)
    {
        filter ??= new FarmActivityFilterRequest();
        var access = await _farmAccessService.GetAccessAsync(farmId, firebaseUid, cancellationToken);

        var pageNumber = Math.Max(1, filter.PageNumber);
        var pageSize = Math.Clamp(filter.PageSize, 1, 50);
        var (items, total) = await _farmActivityRepository.GetPagedAsync(
            farmId, filter.CampaignId, filter.LotId, filter.Status, pageNumber, pageSize, cancellationToken);

        var responses = await _responseFactory.BuildAsync(items, access, cancellationToken);
        return PagedResult<FarmActivityResponse>.Create(responses, total, pageNumber, pageSize);
    }

    public async Task<FarmActivityResponse> CreateAsync(Guid farmId, FarmActivityRequest request, string firebaseUid, CancellationToken cancellationToken = default)
    {
        if (request == null) throw new ArgumentNullException(nameof(request));

        var access = await _farmAccessService.GetAccessAsync(farmId, firebaseUid, cancellationToken);
        access.Farm.EnsureNotArchived();

        var date = request.Date!.Value;

        if (request.LotId.HasValue && await _lotRepository.GetByIdAsync(farmId, request.LotId.Value, cancellationToken) == null)
            throw new EntityNotFoundException("Lote", request.LotId.Value);

        var campaignId = await ResolveCampaignAsync(farmId, request.CampaignId, date, cancellationToken);

        var activity = new FarmActivity(
            farmId,
            campaignId,
            request.LotId,
            request.Type!.Value,
            request.Title,
            request.Notes,
            date,
            request.Status,
            access.Professional?.Id,
            request.HectaresWorked);

        await _farmActivityRepository.AddAsync(activity, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return (await _responseFactory.BuildAsync(new[] { activity }, access, cancellationToken)).Single();
    }

    public async Task<FarmActivityResponse> UpdateStatusAsync(Guid farmId, Guid activityId, UpdateFarmActivityStatusRequest request, string firebaseUid, CancellationToken cancellationToken = default)
    {
        if (request == null) throw new ArgumentNullException(nameof(request));

        var (access, activity) = await GetEditableAsync(farmId, activityId, firebaseUid, cancellationToken);

        activity.ChangeStatus(request.Status!.Value, request.HectaresWorked);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return (await _responseFactory.BuildAsync(new[] { activity }, access, cancellationToken)).Single();
    }

    public async Task DeleteAsync(Guid farmId, Guid activityId, string firebaseUid, CancellationToken cancellationToken = default)
    {
        var (_, activity) = await GetEditableAsync(farmId, activityId, firebaseUid, cancellationToken);

        _farmActivityRepository.Remove(activity);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }

    private async Task<(FarmAccess Access, FarmActivity Activity)> GetEditableAsync(
        Guid farmId,
        Guid activityId,
        string firebaseUid,
        CancellationToken cancellationToken)
    {
        var access = await _farmAccessService.GetAccessAsync(farmId, firebaseUid, cancellationToken);
        access.Farm.EnsureNotArchived();

        var activity = await _farmActivityRepository.GetByIdAsync(farmId, activityId, cancellationToken)
            ?? throw new EntityNotFoundException("Actividad", activityId);

        // El equipo la ve, así que no se esconde con 404: se responde 403.
        if (!access.IsOwner && !activity.IsAuthoredBy(access.Professional?.Id))
            throw new UnauthorizedAccessException("Solo el productor o quien registró la actividad pueden cambiarla.");

        return (access, activity);
    }

    /// <summary>La campaña pedida (tiene que ser del campo) o, si no vino, la que contiene la fecha.</summary>
    private async Task<Guid?> ResolveCampaignAsync(Guid farmId, Guid? campaignId, DateOnly date, CancellationToken cancellationToken)
    {
        if (campaignId.HasValue)
        {
            var campaign = await _campaignRepository.GetByIdAsync(farmId, campaignId.Value, cancellationToken)
                ?? throw new EntityNotFoundException("Campaña", campaignId.Value);
            return campaign.Id;
        }

        var campaigns = await _campaignRepository.GetByFarmAsync(farmId, cancellationToken);
        return campaigns.FirstOrDefault(c => c.Contains(date))?.Id;
    }
}
