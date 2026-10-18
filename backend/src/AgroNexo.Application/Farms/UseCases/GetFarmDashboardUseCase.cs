using AgroNexo.Application.Farms.DTOs;
using AgroNexo.Application.Farms.Services;
using AgroNexo.Domain.Entities;
using AgroNexo.Domain.Enums;
using AgroNexo.Domain.Exceptions;
using AgroNexo.Domain.Interfaces;

namespace AgroNexo.Application.Farms.UseCases;

/// <summary>
/// Arma el tablero compartido del campo en una sola respuesta: el espacio de trabajo, los números de la campaña, la
/// superficie por cultivo, los lotes, la línea de la campaña, la actividad reciente y el resumen de la semana.
/// </summary>
public class GetFarmDashboardUseCase : IGetFarmDashboardUseCase
{
    private const int RecentActivitiesCount = 8;
    private const int HighlightsCount = 3;
    private const int WeekDays = 7;

    private readonly IFarmAccessService _farmAccessService;
    private readonly IGetWorkspacesUseCase _getWorkspacesUseCase;
    private readonly ICampaignRepository _campaignRepository;
    private readonly ILotRepository _lotRepository;
    private readonly IFarmActivityRepository _farmActivityRepository;
    private readonly IFarmActivityResponseFactory _activityResponseFactory;
    private readonly TimeProvider _clock;

    public GetFarmDashboardUseCase(
        IFarmAccessService farmAccessService,
        IGetWorkspacesUseCase getWorkspacesUseCase,
        ICampaignRepository campaignRepository,
        ILotRepository lotRepository,
        IFarmActivityRepository farmActivityRepository,
        IFarmActivityResponseFactory activityResponseFactory,
        TimeProvider clock)
    {
        _farmAccessService = farmAccessService;
        _getWorkspacesUseCase = getWorkspacesUseCase;
        _campaignRepository = campaignRepository;
        _lotRepository = lotRepository;
        _farmActivityRepository = farmActivityRepository;
        _activityResponseFactory = activityResponseFactory;
        _clock = clock;
    }

    public async Task<FarmDashboardResponse> GetAsync(Guid farmId, Guid? campaignId, string firebaseUid, CancellationToken cancellationToken = default)
    {
        var access = await _farmAccessService.GetAccessAsync(farmId, firebaseUid, cancellationToken);
        var workspace = await _getWorkspacesUseCase.GetAsync(farmId, firebaseUid, cancellationToken);
        var today = FarmCalendar.Today(_clock);

        var campaigns = await _campaignRepository.GetByFarmAsync(farmId, cancellationToken);
        var selected = SelectCampaign(campaigns, campaignId, today);

        var lots = await _lotRepository.GetByFarmAsync(farmId, cancellationToken);
        var plantings = selected == null
            ? new List<(Lot Lot, LotCrop Crop)>()
            : lots.SelectMany(l => l.CropsIn(selected.Id).Select(c => (Lot: l, Crop: c))).ToList();

        var labors = selected == null
            ? new List<FarmActivity>()
            : (await _farmActivityRepository.GetFieldLaborsAsync(farmId, selected.Id, cancellationToken)).ToList();

        var (recentItems, _) = await _farmActivityRepository.GetPagedAsync(
            farmId, selected?.Id, null, null, 1, RecentActivitiesCount, cancellationToken);

        return new FarmDashboardResponse
        {
            Workspace = workspace,
            Campaigns = campaigns.Select(FarmPlanningMapper.ToResponse).ToList(),
            SelectedCampaignId = selected?.Id,
            Kpis = new FarmDashboardKpisResponse
            {
                TotalHectares = access.Farm.TotalHectares,
                TeamSize = workspace.Members.Count,
                TeamRoleCount = workspace.Members.Select(m => m.Role).Distinct().Count(),
                LotCount = lots.Count,
                LotHectares = lots.Sum(l => l.Hectares),
                CropCount = plantings.Select(p => p.Crop.Crop).Distinct().Count(),
                OpenActivities = await _farmActivityRepository.CountOpenAsync(farmId, selected?.Id, cancellationToken)
            },
            CropSurfaces = plantings
                .GroupBy(p => p.Crop.Crop)
                .Select(g => new CropSurfaceResponse
                {
                    Crop = g.Key,
                    Hectares = g.Sum(p => p.Lot.Hectares),
                    LotCount = g.Select(p => p.Lot.Id).Distinct().Count()
                })
                .OrderByDescending(s => s.Hectares)
                .ToList(),
            Lots = lots.Select(l => WithLastLabor(FarmPlanningMapper.ToResponse(l, today, selected?.Id ?? Guid.Empty), labors)).ToList(),
            LaborProgress = selected == null ? new List<LaborProgressResponse>() : BuildLaborProgress(lots, plantings, labors),
            Timeline = selected == null ? null : BuildTimeline(selected, plantings, today),
            RecentActivities = await _activityResponseFactory.BuildAsync(recentItems, access, cancellationToken),
            WeeklySummary = await BuildWeeklySummaryAsync(access, workspace, today, cancellationToken)
        };
    }

    /// <summary>La pedida (tiene que ser del campo); si no, la que contiene hoy; si no, la más reciente.</summary>
    private static Campaign? SelectCampaign(IReadOnlyList<Campaign> campaigns, Guid? campaignId, DateOnly today)
    {
        if (campaignId.HasValue)
            return campaigns.FirstOrDefault(c => c.Id == campaignId)
                ?? throw new EntityNotFoundException("Campaña", campaignId.Value);

        return campaigns.FirstOrDefault(c => c.Contains(today))
            ?? campaigns.Where(c => c.StartsOn <= today).MaxBy(c => c.StartsOn)
            ?? campaigns.MinBy(c => c.StartsOn);
    }

    /// <summary>Orden en que se trabajan los lotes en la campaña.</summary>
    private static readonly FarmActivityType[] LaborOrder =
    {
        FarmActivityType.Tillage, FarmActivityType.Sowing, FarmActivityType.Fertilization,
        FarmActivityType.Spraying, FarmActivityType.Harvest
    };

    private static readonly FarmActivityType[] AlwaysShownLabors = { FarmActivityType.Sowing, FarmActivityType.Harvest };

    /// <summary>
    /// Por lote y labor: una finalizada suma sus hectáreas (o el lote entero si no las cargaron) y una en proceso suma
    /// las hectáreas que lleva, si las cargaron. Nunca más que el lote.
    /// </summary>
    private static List<LaborProgressResponse> BuildLaborProgress(
        IReadOnlyList<Lot> lots,
        List<(Lot Lot, LotCrop Crop)> plantings,
        List<FarmActivity> labors)
    {
        var planned = plantings.Count > 0
            ? plantings.Select(p => p.Lot).DistinctBy(l => l.Id).ToList()
            : lots.ToList();
        var plannedHectares = planned.Sum(l => l.Hectares);

        return LaborOrder
            .Where(type => AlwaysShownLabors.Contains(type) || labors.Any(a => a.Type == type))
            .Select(type =>
            {
                var worked = planned.Sum(lot => Math.Min(lot.Hectares, labors
                    .Where(a => a.Type == type && a.LotId == lot.Id)
                    .Sum(a => a.Status switch
                    {
                        FarmActivityStatus.Completed => a.HectaresWorked ?? lot.Hectares,
                        FarmActivityStatus.InProgress => a.HectaresWorked ?? 0m,
                        _ => 0m
                    })));

                return new LaborProgressResponse
                {
                    Type = type,
                    HectaresWorked = worked,
                    HectaresPlanned = plannedHectares,
                    Progress = plannedHectares > 0 ? Math.Round(worked / plannedHectares, 4) : 0m
                };
            })
            .ToList();
    }

    private static LotResponse WithLastLabor(LotResponse lot, List<FarmActivity> labors)
    {
        var last = labors
            .Where(a => a.LotId == lot.Id)
            .OrderByDescending(a => a.Date)
            .ThenByDescending(a => a.CreatedAt)
            .FirstOrDefault();

        lot.LastLabor = last == null
            ? null
            : new LotLastLaborResponse { Type = last.Type, Status = last.Status, Date = last.Date };
        return lot;
    }

    private static CampaignTimelineResponse BuildTimeline(Campaign campaign, List<(Lot Lot, LotCrop Crop)> plantings, DateOnly today)
    {
        var next = plantings
            .Where(p => p.Crop.ExpectedHarvestDate.HasValue && p.Crop.ExpectedHarvestDate >= today)
            .OrderBy(p => p.Crop.ExpectedHarvestDate)
            .FirstOrDefault();

        return new CampaignTimelineResponse
        {
            CampaignId = campaign.Id,
            Name = campaign.Name,
            StartsOn = campaign.StartsOn,
            EndsOn = campaign.EndsOn,
            Today = today,
            Progress = campaign.ProgressOn(today),
            Plantings = plantings
                .OrderBy(p => p.Crop.SowingDate ?? DateOnly.MaxValue)
                .ThenBy(p => p.Lot.Name)
                .Select(p => new TimelinePlantingResponse
                {
                    LotId = p.Lot.Id,
                    LotName = p.Lot.Name,
                    Crop = p.Crop.Crop,
                    SowingDate = p.Crop.SowingDate,
                    ExpectedHarvestDate = p.Crop.ExpectedHarvestDate,
                    Phase = FarmPlanningMapper.PhaseOf(p.Crop, today)
                })
                .ToList(),
            NextHarvest = next.Crop == null
                ? null
                : new NextHarvestResponse
                {
                    LotName = next.Lot.Name,
                    Crop = next.Crop.Crop,
                    Date = next.Crop.ExpectedHarvestDate!.Value,
                    DaysLeft = next.Crop.ExpectedHarvestDate.Value.DayNumber - today.DayNumber
                }
        };
    }

    private async Task<WeeklySummaryResponse> BuildWeeklySummaryAsync(
        FarmAccess access,
        WorkspaceResponse workspace,
        DateOnly today,
        CancellationToken cancellationToken)
    {
        var from = today.AddDays(-(WeekDays - 1));
        var sinceUtc = _clock.GetUtcNow().UtcDateTime.AddDays(-WeekDays);
        var touched = await _farmActivityRepository.GetTouchedSinceAsync(access.Farm.Id, sinceUtc, cancellationToken);

        var completed = touched
            .Where(a => a.CompletedAt.HasValue && a.CompletedAt >= sinceUtc)
            .OrderByDescending(a => a.CompletedAt)
            .ToList();

        return new WeeklySummaryResponse
        {
            From = from,
            To = today,
            ActivitiesCreated = touched.Count(a => a.CreatedAt >= sinceUtc),
            ActivitiesCompleted = completed.Count,
            NewMembers = workspace.Members.Count(m => m.JoinedAt >= sinceUtc),
            Highlights = await _activityResponseFactory.BuildAsync(completed.Take(HighlightsCount).ToList(), access, cancellationToken)
        };
    }
}
