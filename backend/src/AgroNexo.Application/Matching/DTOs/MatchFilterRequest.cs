using System.ComponentModel.DataAnnotations;
using AgroNexo.Domain.Enums;

namespace AgroNexo.Application.Matching.DTOs;

/// <summary>
/// Request query filter for retrieving matches with pagination.
/// </summary>
public class MatchFilterRequest
{
    public Guid? ProducerId { get; set; }
    public Guid? ProfessionalId { get; set; }
    public MatchStatus? Status { get; set; }

    [Range(1, int.MaxValue, ErrorMessage = "El número de página debe ser mayor o igual a 1.")]
    public int PageNumber { get; set; } = 1;

    [Range(1, 100, ErrorMessage = "El tamaño de página debe estar entre 1 y 100.")]
    public int PageSize { get; set; } = 20;
}
