using AgroNexo.Domain.Enums;

namespace AgroNexo.Application.Matching.ScoringEngine;

/// <summary>
/// Candidate professional data fed into the recommendation scoring calculation.
/// </summary>
public class ScoringCandidate
{
    public Guid ProfessionalId { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public ProfessionalRole Role { get; set; }
    public string Specialty { get; set; } = string.Empty;
    public int YearsExperience { get; set; }
    public int MaxCapacity { get; set; } = 20;
    public bool IsVerified { get; set; }
    public int ActiveMatches { get; set; }
    public double DistanceKm { get; set; }
}

/// <summary>
/// Criteria specified by the producer initiating the discovery search.
/// </summary>
public class ScoringCriteria
{
    public string? RequestedSpecialty { get; set; }
    public bool RequiresFieldPresence { get; set; }
    public double MaxRadiusKm { get; set; } = 100.0;

    /// <summary>
    /// Radio de decaimiento de la proximidad para profesionales que trabajan a distancia (contador, abogado,
    /// inversionista). Es más amplio que <see cref="MaxRadiusKm"/>: no se los descarta por estar lejos, pero a igual
    /// condición aparece primero quien está en la misma zona o provincia.
    /// </summary>
    public double RemoteRadiusKm { get; set; } = 800.0;
}

/// <summary>
/// Detailed breakdown and total composite score for a professional.
/// </summary>
public class ScoringResult
{
    public Guid ProfessionalId { get; set; }
    public decimal TotalScore { get; set; }
    public decimal ProximityScore { get; set; }
    public decimal VerificationScore { get; set; }
    public decimal SpecialtyScore { get; set; }
    public decimal ExperienceScore { get; set; }
    public decimal CapacityScore { get; set; }
    public double DistanceKm { get; set; }
    public int ActiveMatches { get; set; }
    public int MaxCapacity { get; set; }
}

/// <summary>
/// Engine contract for evaluating candidate professionals and calculating match suitability scores.
/// </summary>
public interface IScoringEngine
{
    ScoringResult CalculateScore(ScoringCandidate candidate, ScoringCriteria criteria);
    IReadOnlyList<ScoringResult> RankCandidates(IEnumerable<ScoringCandidate> candidates, ScoringCriteria criteria);
}
