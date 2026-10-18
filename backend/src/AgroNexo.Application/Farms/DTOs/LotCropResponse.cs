using AgroNexo.Domain.Enums;

namespace AgroNexo.Application.Farms.DTOs;

/// <summary>
/// Cultivo de un lote en una campaña, con la etapa en la que está hoy.
/// </summary>
public class LotCropResponse
{
    public Guid Id { get; set; }
    public Guid CampaignId { get; set; }
    public CropType Crop { get; set; }
    public DateOnly? SowingDate { get; set; }
    public DateOnly? ExpectedHarvestDate { get; set; }
    public CropPhase Phase { get; set; }
}
