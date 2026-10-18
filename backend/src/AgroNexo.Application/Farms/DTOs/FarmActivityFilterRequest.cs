using System.ComponentModel.DataAnnotations;
using AgroNexo.Domain.Enums;

namespace AgroNexo.Application.Farms.DTOs;

/// <summary>
/// Filtros y paginación de la lista de actividades del campo.
/// </summary>
public class FarmActivityFilterRequest
{
    public Guid? CampaignId { get; set; }
    public Guid? LotId { get; set; }
    public FarmActivityStatus? Status { get; set; }

    [Range(1, int.MaxValue, ErrorMessage = "La página tiene que ser 1 o más.")]
    public int PageNumber { get; set; } = 1;

    [Range(1, 50, ErrorMessage = "El tamaño de página va de 1 a 50.")]
    public int PageSize { get; set; } = 20;
}
