using System.ComponentModel.DataAnnotations;
using AgroNexo.Domain.Enums;

namespace AgroNexo.Application.Farms.DTOs;

/// <summary>
/// Cultivo que se siembra en un lote para una campaña. Las fechas son opcionales y alimentan la línea de la campaña.
/// </summary>
public class LotCropRequest
{
    [Required(ErrorMessage = "La campaña es obligatoria.")]
    public Guid? CampaignId { get; set; }

    [Required(ErrorMessage = "El cultivo es obligatorio.")]
    public CropType? Crop { get; set; }

    public DateOnly? SowingDate { get; set; }
    public DateOnly? ExpectedHarvestDate { get; set; }
}
