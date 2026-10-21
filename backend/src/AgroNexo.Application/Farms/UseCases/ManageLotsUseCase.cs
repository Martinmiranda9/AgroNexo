using AgroNexo.Application.Common.Helpers;
using AgroNexo.Application.Farms.DTOs;
using AgroNexo.Application.Farms.Services;
using AgroNexo.Domain.Entities;
using AgroNexo.Domain.Exceptions;
using AgroNexo.Domain.Interfaces;
using NetTopologySuite.Geometries;

namespace AgroNexo.Application.Farms.UseCases;

/// <summary>
/// Lotes del campo y sus cultivos por campaña. Los ve todo el equipo. Los crean y corrigen (nombre, hectáreas declaradas
/// y ubicación en el mapa) el productor dueño o el ingeniero agrónomo del equipo; la baja y los cultivos son solo del
/// productor. Las hectáreas son las que se declaran: no se comparan con las del campo ni con el dibujo.
/// </summary>
public class ManageLotsUseCase : IManageLotsUseCase
{
    private const string CannotEditLotsMessage =
        "Solo el productor o el ingeniero agrónomo del equipo pueden crear o corregir lotes.";

    private readonly IFarmAccessService _farmAccessService;
    private readonly ILotRepository _lotRepository;
    private readonly ICampaignRepository _campaignRepository;
    private readonly ILotAuthorDirectory _lotAuthorDirectory;
    private readonly IUnitOfWork _unitOfWork;
    private readonly TimeProvider _clock;

    public ManageLotsUseCase(
        IFarmAccessService farmAccessService,
        ILotRepository lotRepository,
        ICampaignRepository campaignRepository,
        ILotAuthorDirectory lotAuthorDirectory,
        IUnitOfWork unitOfWork,
        TimeProvider clock)
    {
        _farmAccessService = farmAccessService;
        _lotRepository = lotRepository;
        _campaignRepository = campaignRepository;
        _lotAuthorDirectory = lotAuthorDirectory;
        _unitOfWork = unitOfWork;
        _clock = clock;
    }

    public async Task<IReadOnlyList<LotResponse>> ListAsync(Guid farmId, string firebaseUid, CancellationToken cancellationToken = default)
    {
        var access = await _farmAccessService.GetAccessAsync(farmId, firebaseUid, cancellationToken);
        var today = FarmCalendar.Today(_clock);
        var lots = await _lotRepository.GetByFarmAsync(farmId, cancellationToken);
        var authors = await _lotAuthorDirectory.LoadAsync(lots, access, cancellationToken);
        return lots.Select(l => FarmPlanningMapper.ToResponse(l, today, authors)).ToList();
    }

    public async Task<LotResponse> CreateAsync(Guid farmId, LotRequest request, string firebaseUid, CancellationToken cancellationToken = default)
    {
        if (request == null) throw new ArgumentNullException(nameof(request));

        var access = await GetEditorAccessAsync(farmId, firebaseUid, cancellationToken);

        if (await _lotRepository.NameExistsAsync(farmId, request.Name, null, cancellationToken))
            throw new DuplicateFarmRecordException($"Ya hay un lote llamado {request.Name.Trim()} en este campo.");

        var lot = new Lot(farmId, request.Name, request.Hectares!.Value, BoundaryOf(request), access.Professional?.Id);

        await _lotRepository.AddAsync(lot, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return await ToResponseAsync(lot, access, cancellationToken);
    }

    public async Task<LotResponse> UpdateAsync(Guid farmId, Guid lotId, LotRequest request, string firebaseUid, CancellationToken cancellationToken = default)
    {
        if (request == null) throw new ArgumentNullException(nameof(request));

        var access = await GetEditorAccessAsync(farmId, firebaseUid, cancellationToken);

        var lot = await _lotRepository.GetByIdAsync(farmId, lotId, cancellationToken)
            ?? throw new EntityNotFoundException("Lote", lotId);

        if (await _lotRepository.NameExistsAsync(farmId, request.Name, lotId, cancellationToken))
            throw new DuplicateFarmRecordException($"Ya hay un lote llamado {request.Name.Trim()} en este campo.");

        lot.Update(request.Name, request.Hectares!.Value, BoundaryOf(request), access.Professional?.Id);

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return await ToResponseAsync(lot, access, cancellationToken);
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

        return await ToResponseAsync(lot, access, cancellationToken);
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

    /// <summary>
    /// Dueño o miembro activo (si no, 404); entre los miembros, solo el agrónomo (si no, 403). El campo no puede estar
    /// archivado.
    /// </summary>
    private async Task<FarmAccess> GetEditorAccessAsync(Guid farmId, string firebaseUid, CancellationToken cancellationToken)
    {
        var access = await _farmAccessService.GetAccessAsync(farmId, firebaseUid, cancellationToken);
        if (!access.CanEditLots)
            throw new UnauthorizedAccessException(CannotEditLotsMessage);

        access.Farm.EnsureNotArchived();
        return access;
    }

    /// <summary>La ubicación dibujada, si vino; el borde no puede cruzarse consigo mismo (lo valida el lote).</summary>
    private static Polygon? BoundaryOf(LotRequest request) =>
        request.HasBoundary ? GeometryHelper.CreatePolygon(request.BoundaryCoordinates) : null;

    private async Task<LotResponse> ToResponseAsync(Lot lot, FarmAccess access, CancellationToken cancellationToken)
    {
        var authors = await _lotAuthorDirectory.LoadAsync(new[] { lot }, access, cancellationToken);
        return FarmPlanningMapper.ToResponse(lot, FarmCalendar.Today(_clock), authors);
    }
}
