using AgroConnect.Domain.Enums;

namespace AgroConnect.Application.Matching.DTOs;

/// <summary>
/// Response DTO representing a cross-tenant Match relationship.
/// </summary>
public class MatchResponse
{
    public Guid Id { get; set; }
    public Guid ProducerId { get; set; }
    public string ProducerName { get; set; } = string.Empty;
    public Guid ProfessionalId { get; set; }
    public string ProfessionalName { get; set; } = string.Empty;
    public string Specialty { get; set; } = string.Empty;
    public MatchStatus Status { get; set; }
    public DateTime RequestedAt { get; set; }
    public DateTime? RespondedAt { get; set; }
}
