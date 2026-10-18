using AgroNexo.Domain.Common;
using AgroNexo.Domain.Enums;
using AgroNexo.Domain.Exceptions;

namespace AgroNexo.Domain.Entities;

/// <summary>
/// Cultivo de un lote en una campaña. Un lote puede tener más de uno en la misma campaña (por ejemplo trigo y soja de
/// segunda), pero no el mismo cultivo dos veces. Se crea desde <see cref="Lot"/>.
/// </summary>
public class LotCrop : BaseEntity
{
    public Guid LotId { get; private set; }
    public Guid CampaignId { get; private set; }
    public CropType Crop { get; private set; }
    public DateOnly? SowingDate { get; private set; }
    public DateOnly? ExpectedHarvestDate { get; private set; }

    // Parameterless constructor for EF Core
    protected LotCrop()
    {
    }

    internal LotCrop(Guid lotId, Guid campaignId, CropType crop, DateOnly? sowingDate, DateOnly? expectedHarvestDate)
    {
        if (campaignId == Guid.Empty)
            throw new DomainValidationException(nameof(CampaignId), "La campaña es obligatoria.");

        if (!Enum.IsDefined(crop))
            throw new DomainValidationException(nameof(Crop), "El cultivo no es válido.");

        if (sowingDate.HasValue && expectedHarvestDate.HasValue && expectedHarvestDate <= sowingDate)
            throw new DomainValidationException(nameof(ExpectedHarvestDate), "La cosecha tiene que ser posterior a la siembra.");

        Id = Guid.NewGuid();
        LotId = lotId;
        CampaignId = campaignId;
        Crop = crop;
        SowingDate = sowingDate;
        ExpectedHarvestDate = expectedHarvestDate;
        CreatedAt = DateTime.UtcNow;
    }
}
