using AgroNexo.Domain.Enums;

namespace AgroNexo.Application.Matching.DTOs;

/// <summary>
/// Response DTO representing an individual ranked professional recommendation.
/// </summary>
public class MatchRecommendationResponse
{
    public Guid Id { get; set; }
    public Guid ProfessionalId { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string FullName => $"{FirstName} {LastName}".Trim();
    public ProfessionalRole Role { get; set; }
    public string Specialty { get; set; } = string.Empty;
    public int YearsExperience { get; set; }
    public bool IsVerified { get; set; }
    public int MaxCapacity { get; set; }
    public int ActiveMatches { get; set; }
    public double DistanceKm { get; set; }
    public decimal Score { get; set; }
    public int RankPosition { get; set; }
}
