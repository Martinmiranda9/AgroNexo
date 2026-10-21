using AgroNexo.Application.Common.Helpers;
using AgroNexo.Application.Farms.DTOs;
using AgroNexo.Application.Farms.Services;
using AgroNexo.Domain.Entities;

namespace AgroNexo.Application.Farms.UseCases;

/// <summary>
/// Mapeo de campañas, lotes y cultivos a sus DTOs.
/// </summary>
public static class FarmPlanningMapper
{
    public static CampaignResponse ToResponse(Campaign campaign) => new()
    {
        Id = campaign.Id,
        Name = campaign.Name,
        StartsOn = campaign.StartsOn,
        EndsOn = campaign.EndsOn
    };

    /// <summary>Lote con sus cultivos, su forma y sus autores; con <paramref name="campaignId"/>, solo los cultivos de esa campaña.</summary>
    public static LotResponse ToResponse(Lot lot, DateOnly today, LotAuthors authors, Guid? campaignId = null) => new()
    {
        Id = lot.Id,
        Name = lot.Name,
        Hectares = lot.Hectares,
        Crops = (campaignId.HasValue ? lot.CropsIn(campaignId.Value) : lot.Crops)
            .OrderBy(c => c.SowingDate ?? DateOnly.MaxValue)
            .Select(c => ToResponse(c, today))
            .ToList(),
        BoundaryCoordinates = GeometryHelper.ToCoordinateDtos(lot.Boundary),
        CreatedBy = authors.Resolve(lot.CreatedByProfessionalId),
        BoundaryEditedBy = lot.Boundary != null ? authors.Resolve(lot.BoundaryEditedByProfessionalId) : null,
        BoundaryEditedAt = lot.BoundaryEditedAt
    };

    public static LotCropResponse ToResponse(LotCrop crop, DateOnly today) => new()
    {
        Id = crop.Id,
        CampaignId = crop.CampaignId,
        Crop = crop.Crop,
        SowingDate = crop.SowingDate,
        ExpectedHarvestDate = crop.ExpectedHarvestDate,
        Phase = PhaseOf(crop, today)
    };

    /// <summary>Por sembrar hasta la fecha de siembra, en cosecha desde la fecha prevista y en desarrollo en el medio.</summary>
    public static CropPhase PhaseOf(LotCrop crop, DateOnly today)
    {
        if (crop.SowingDate == null || today < crop.SowingDate)
            return CropPhase.Sowing;

        if (crop.ExpectedHarvestDate.HasValue && today >= crop.ExpectedHarvestDate)
            return CropPhase.Harvest;

        return CropPhase.Growing;
    }
}
