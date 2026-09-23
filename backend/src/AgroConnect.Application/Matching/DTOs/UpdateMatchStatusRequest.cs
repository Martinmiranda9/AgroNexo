using System.ComponentModel.DataAnnotations;
using AgroConnect.Domain.Enums;

namespace AgroConnect.Application.Matching.DTOs;

/// <summary>
/// Request DTO for changing the status of a Match (Accept, Reject, Cancel, Complete).
/// </summary>
public class UpdateMatchStatusRequest
{
    [Required(ErrorMessage = "El estado del match (Status) es obligatorio (2 = Active, 3 = Rejected, 4 = Cancelled, 5 = Completed).")]
    public MatchStatus Status { get; set; }
}
