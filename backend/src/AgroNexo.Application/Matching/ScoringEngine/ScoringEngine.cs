namespace AgroNexo.Application.Matching.ScoringEngine;

/// <summary>
/// Deterministic recommendation scoring engine for AgroNexo.
/// Evaluates candidate professionals against geo-spatial, credentials, specialty, experience, and workload factors.
/// Weights: Proximity (35%), Verification (25%), Specialty (20%), Experience (10%), Workload Capacity (10%).
/// Proximity applies to every role (remote roles use a wider radius), so closer professionals always rank first.
/// </summary>
public class ScoringEngine : IScoringEngine
{
    public const decimal ProximityWeight = 0.35m;
    public const decimal VerificationWeight = 0.25m;
    public const decimal SpecialtyWeight = 0.20m;
    public const decimal ExperienceWeight = 0.10m;
    public const decimal CapacityWeight = 0.10m;

    public ScoringResult CalculateScore(ScoringCandidate candidate, ScoringCriteria criteria)
    {
        if (candidate == null)
            throw new ArgumentNullException(nameof(candidate));

        if (criteria == null)
            throw new ArgumentNullException(nameof(criteria));

        // 1. Proximity Factor (35%)
        // Quien debe ir al campo se mide contra el radio de cobertura; quien trabaja a distancia, contra un radio mucho
        // más amplio. En ambos casos cuanto más cerca de la zona buscada, mejor puntaje: la distancia no descarta a
        // nadie, pero ordena (misma zona primero).
        double maxRadius = criteria.RequiresFieldPresence
            ? (criteria.MaxRadiusKm > 0 ? criteria.MaxRadiusKm : 100.0)
            : (criteria.RemoteRadiusKm > 0 ? criteria.RemoteRadiusKm : 800.0);

        decimal proximityScore;
        if (candidate.DistanceKm <= 0.0)
        {
            proximityScore = 1.0m;
        }
        else if (candidate.DistanceKm >= maxRadius)
        {
            proximityScore = 0.0m;
        }
        else
        {
            double proximityRatio = 1.0 - (candidate.DistanceKm / maxRadius);
            proximityScore = Math.Clamp((decimal)proximityRatio, 0.0m, 1.0m);
        }

        // 2. Verification Factor (25%)
        decimal verificationScore = candidate.IsVerified ? 1.0m : 0.0m;

        // 3. Specialty Factor (20%)
        decimal specialtyScore;
        if (string.IsNullOrWhiteSpace(criteria.RequestedSpecialty))
        {
            specialtyScore = 1.0m;
        }
        else
        {
            bool isMatch = string.Equals(
                candidate.Specialty?.Trim(),
                criteria.RequestedSpecialty.Trim(),
                StringComparison.OrdinalIgnoreCase);

            specialtyScore = isMatch ? 1.0m : 0.0m;
        }

        // 4. Experience Factor (10%)
        decimal experienceScore;
        if (candidate.YearsExperience <= 0)
        {
            experienceScore = 0.0m;
        }
        else
        {
            decimal expRatio = (decimal)candidate.YearsExperience / 10.0m;
            experienceScore = Math.Clamp(expRatio, 0.0m, 1.0m);
        }

        // 5. Workload Capacity Factor (10%)
        int maxCapacity = candidate.MaxCapacity > 0 ? candidate.MaxCapacity : 20;
        decimal capacityScore;
        if (candidate.ActiveMatches <= 0)
        {
            capacityScore = 1.0m;
        }
        else if (candidate.ActiveMatches >= maxCapacity)
        {
            capacityScore = 0.0m;
        }
        else
        {
            decimal capacityRatio = 1.0m - ((decimal)candidate.ActiveMatches / (decimal)maxCapacity);
            capacityScore = Math.Clamp(capacityRatio, 0.0m, 1.0m);
        }

        // Composite Weighted Total (Clamped [0.0, 1.0])
        decimal totalScore = (ProximityWeight * proximityScore) +
                             (VerificationWeight * verificationScore) +
                             (SpecialtyWeight * specialtyScore) +
                             (ExperienceWeight * experienceScore) +
                             (CapacityWeight * capacityScore);

        totalScore = Math.Round(Math.Clamp(totalScore, 0.0m, 1.0m), 4, MidpointRounding.AwayFromZero);

        return new ScoringResult
        {
            ProfessionalId = candidate.ProfessionalId,
            TotalScore = totalScore,
            ProximityScore = Math.Round(proximityScore, 4, MidpointRounding.AwayFromZero),
            VerificationScore = verificationScore,
            SpecialtyScore = specialtyScore,
            ExperienceScore = Math.Round(experienceScore, 4, MidpointRounding.AwayFromZero),
            CapacityScore = Math.Round(capacityScore, 4, MidpointRounding.AwayFromZero),
            DistanceKm = candidate.DistanceKm,
            ActiveMatches = candidate.ActiveMatches,
            MaxCapacity = maxCapacity
        };
    }

    public IReadOnlyList<ScoringResult> RankCandidates(IEnumerable<ScoringCandidate> candidates, ScoringCriteria criteria)
    {
        if (candidates == null)
            return Array.Empty<ScoringResult>();

        var results = new List<ScoringResult>();
        foreach (var candidate in candidates)
        {
            results.Add(CalculateScore(candidate, criteria));
        }

        // Order descending by TotalScore, then ascending by distance, then descending by experience
        return results
            .OrderByDescending(r => r.TotalScore)
            .ThenBy(r => r.DistanceKm)
            .ToList();
    }
}
