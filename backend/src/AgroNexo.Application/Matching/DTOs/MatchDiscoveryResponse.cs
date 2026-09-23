namespace AgroNexo.Application.Matching.DTOs;

/// <summary>
/// Response DTO representing the outcome of a match discovery execution, including ranked recommendations.
/// </summary>
public class MatchDiscoveryResponse
{
    public Guid Id { get; set; }
    public Guid ProducerId { get; set; }
    public double Latitude { get; set; }
    public double Longitude { get; set; }
    public string RequestedSpecialty { get; set; } = string.Empty;
    public bool RequiresFieldPresence { get; set; }
    public DateTime CreatedAt { get; set; }
    public List<MatchRecommendationResponse> Recommendations { get; set; } = new();
}
