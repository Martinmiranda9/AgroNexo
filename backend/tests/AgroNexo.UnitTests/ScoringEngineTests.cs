using AgroNexo.Application.Matching.ScoringEngine;
using AgroNexo.Domain.Enums;
using FluentAssertions;
using Xunit;

namespace AgroNexo.UnitTests;

public class ScoringEngineTests
{
    private readonly ScoringEngine _engine = new();

    [Fact]
    public void CalculateScore_PerfectCandidate_ReturnsOne()
    {
        // Arrange: 0km distance, verified, matching specialty, 10 years experience, 0 active matches
        var candidate = new ScoringCandidate
        {
            ProfessionalId = Guid.NewGuid(),
            FirstName = "Juan",
            LastName = "Perez",
            Role = ProfessionalRole.Agronomist,
            Specialty = "Nutrición de Suelos",
            YearsExperience = 10,
            MaxCapacity = 20,
            IsVerified = true,
            ActiveMatches = 0,
            DistanceKm = 0.0
        };

        var criteria = new ScoringCriteria
        {
            RequestedSpecialty = "Nutrición de Suelos",
            RequiresFieldPresence = true,
            MaxRadiusKm = 100.0
        };

        // Act
        var result = _engine.CalculateScore(candidate, criteria);

        // Assert
        // 0.35 * 1.0 + 0.25 * 1.0 + 0.20 * 1.0 + 0.10 * 1.0 + 0.10 * 1.0 = 1.0
        result.TotalScore.Should().Be(1.0000m);
        result.ProximityScore.Should().Be(1.0000m);
        result.VerificationScore.Should().Be(1.0m);
        result.SpecialtyScore.Should().Be(1.0m);
        result.ExperienceScore.Should().Be(1.0000m);
        result.CapacityScore.Should().Be(1.0000m);
    }

    [Fact]
    public void CalculateScore_ZeroCandidate_ReturnsZero()
    {
        // Arrange: max distance (>=100km), unverified, non-matching specialty, 0 experience, saturated capacity
        var candidate = new ScoringCandidate
        {
            ProfessionalId = Guid.NewGuid(),
            Specialty = "Finanzas",
            YearsExperience = 0,
            MaxCapacity = 20,
            IsVerified = false,
            ActiveMatches = 20,
            DistanceKm = 120.0
        };

        var criteria = new ScoringCriteria
        {
            RequestedSpecialty = "Nutrición de Suelos",
            RequiresFieldPresence = true,
            MaxRadiusKm = 100.0
        };

        // Act
        var result = _engine.CalculateScore(candidate, criteria);

        // Assert
        result.TotalScore.Should().Be(0.0000m);
        result.ProximityScore.Should().Be(0.0000m);
        result.VerificationScore.Should().Be(0.0m);
        result.SpecialtyScore.Should().Be(0.0m);
        result.ExperienceScore.Should().Be(0.0000m);
        result.CapacityScore.Should().Be(0.0000m);
    }

    [Fact]
    public void CalculateScore_RequiresFieldPresenceFalse_BypassesDistancePenalty()
    {
        // Arrange: 500km distance, but remote work is allowed
        var candidate = new ScoringCandidate
        {
            ProfessionalId = Guid.NewGuid(),
            Specialty = "Contabilidad Agropecuaria",
            YearsExperience = 10,
            MaxCapacity = 20,
            IsVerified = true,
            ActiveMatches = 0,
            DistanceKm = 500.0
        };

        var criteria = new ScoringCriteria
        {
            RequestedSpecialty = "Contabilidad Agropecuaria",
            RequiresFieldPresence = false,
            MaxRadiusKm = 100.0
        };

        // Act
        var result = _engine.CalculateScore(candidate, criteria);

        // Assert
        result.ProximityScore.Should().Be(1.0000m);
        result.TotalScore.Should().Be(1.0000m);
    }

    [Fact]
    public void CalculateScore_ProximityWeight35Percent_CalculatesLinearDecay()
    {
        // Arrange: 50km out of 100km max -> proximity ratio = 0.5 -> 0.35 * 0.5 = 0.175
        var candidate = new ScoringCandidate
        {
            ProfessionalId = Guid.NewGuid(),
            Specialty = "Other",
            YearsExperience = 0,
            MaxCapacity = 20,
            IsVerified = false,
            ActiveMatches = 20,
            DistanceKm = 50.0
        };

        var criteria = new ScoringCriteria
        {
            RequestedSpecialty = "Different",
            RequiresFieldPresence = true,
            MaxRadiusKm = 100.0
        };

        // Act
        var result = _engine.CalculateScore(candidate, criteria);

        // Assert
        result.ProximityScore.Should().Be(0.5000m);
        result.TotalScore.Should().Be(0.1750m);
    }

    [Fact]
    public void CalculateScore_VerificationWeight25Percent_AddsExactly25Percent()
    {
        // Arrange
        var candidate = new ScoringCandidate
        {
            ProfessionalId = Guid.NewGuid(),
            Specialty = "Other",
            YearsExperience = 0,
            MaxCapacity = 20,
            IsVerified = true,
            ActiveMatches = 20,
            DistanceKm = 100.0
        };

        var criteria = new ScoringCriteria
        {
            RequestedSpecialty = "Different",
            RequiresFieldPresence = true,
            MaxRadiusKm = 100.0
        };

        // Act
        var result = _engine.CalculateScore(candidate, criteria);

        // Assert
        result.VerificationScore.Should().Be(1.0m);
        result.TotalScore.Should().Be(0.2500m);
    }

    [Fact]
    public void CalculateScore_SpecialtyWeight20Percent_AddsExactly20Percent()
    {
        // Arrange
        var candidate = new ScoringCandidate
        {
            ProfessionalId = Guid.NewGuid(),
            Specialty = "Riego por Goteo",
            YearsExperience = 0,
            MaxCapacity = 20,
            IsVerified = false,
            ActiveMatches = 20,
            DistanceKm = 100.0
        };

        var criteria = new ScoringCriteria
        {
            RequestedSpecialty = "riego por goteo", // case-insensitive match
            RequiresFieldPresence = true,
            MaxRadiusKm = 100.0
        };

        // Act
        var result = _engine.CalculateScore(candidate, criteria);

        // Assert
        result.SpecialtyScore.Should().Be(1.0m);
        result.TotalScore.Should().Be(0.2000m);
    }

    [Theory]
    [InlineData(0, 0.0, 0.0)]
    [InlineData(5, 0.5, 0.05)]
    [InlineData(10, 1.0, 0.10)]
    [InlineData(25, 1.0, 0.10)] // Clamped to 1.0
    public void CalculateScore_ExperienceWeight10Percent_HandlesBoundaries(
        int yearsExperience,
        decimal expectedExperienceScore,
        decimal expectedTotalScore)
    {
        // Arrange
        var candidate = new ScoringCandidate
        {
            ProfessionalId = Guid.NewGuid(),
            Specialty = "Other",
            YearsExperience = yearsExperience,
            MaxCapacity = 20,
            IsVerified = false,
            ActiveMatches = 20,
            DistanceKm = 100.0
        };

        var criteria = new ScoringCriteria
        {
            RequestedSpecialty = "Different",
            RequiresFieldPresence = true,
            MaxRadiusKm = 100.0
        };

        // Act
        var result = _engine.CalculateScore(candidate, criteria);

        // Assert
        result.ExperienceScore.Should().Be(expectedExperienceScore);
        result.TotalScore.Should().Be(expectedTotalScore);
    }

    [Theory]
    [InlineData(0, 20, 1.0, 0.10)]   // 0 active / 20 capacity = 1.0 score -> 0.10 total
    [InlineData(10, 20, 0.5, 0.05)]  // 10 active / 20 capacity = 0.5 score -> 0.05 total
    [InlineData(20, 20, 0.0, 0.0)]   // 20 active / 20 capacity = 0.0 score -> 0.00 total
    [InlineData(25, 20, 0.0, 0.0)]   // Over capacity -> clamped to 0.0
    public void CalculateScore_WorkloadCapacityWeight10Percent_HandlesBoundaries(
        int activeMatches,
        int maxCapacity,
        decimal expectedCapacityScore,
        decimal expectedTotalScore)
    {
        // Arrange
        var candidate = new ScoringCandidate
        {
            ProfessionalId = Guid.NewGuid(),
            Specialty = "Other",
            YearsExperience = 0,
            MaxCapacity = maxCapacity,
            IsVerified = false,
            ActiveMatches = activeMatches,
            DistanceKm = 100.0
        };

        var criteria = new ScoringCriteria
        {
            RequestedSpecialty = "Different",
            RequiresFieldPresence = true,
            MaxRadiusKm = 100.0
        };

        // Act
        var result = _engine.CalculateScore(candidate, criteria);

        // Assert
        result.CapacityScore.Should().Be(expectedCapacityScore);
        result.TotalScore.Should().Be(expectedTotalScore);
    }

    [Fact]
    public void RankCandidates_SortsByTotalScoreDescending()
    {
        // Arrange
        var candA = new ScoringCandidate
        {
            ProfessionalId = Guid.NewGuid(),
            Specialty = "Nutrición de Suelos",
            YearsExperience = 2,
            MaxCapacity = 20,
            IsVerified = false,
            ActiveMatches = 10,
            DistanceKm = 80.0
        };

        var candB = new ScoringCandidate
        {
            ProfessionalId = Guid.NewGuid(),
            Specialty = "Nutrición de Suelos",
            YearsExperience = 10,
            MaxCapacity = 20,
            IsVerified = true,
            ActiveMatches = 0,
            DistanceKm = 10.0
        };

        var candC = new ScoringCandidate
        {
            ProfessionalId = Guid.NewGuid(),
            Specialty = "Nutrición de Suelos",
            YearsExperience = 5,
            MaxCapacity = 20,
            IsVerified = true,
            ActiveMatches = 5,
            DistanceKm = 30.0
        };

        var criteria = new ScoringCriteria
        {
            RequestedSpecialty = "Nutrición de Suelos",
            RequiresFieldPresence = true,
            MaxRadiusKm = 100.0
        };

        // Act
        var ranked = _engine.RankCandidates(new[] { candA, candB, candC }, criteria);

        // Assert
        ranked.Should().HaveCount(3);
        ranked[0].ProfessionalId.Should().Be(candB.ProfessionalId);
        ranked[1].ProfessionalId.Should().Be(candC.ProfessionalId);
        ranked[2].ProfessionalId.Should().Be(candA.ProfessionalId);

        ranked[0].TotalScore.Should().BeGreaterThan(ranked[1].TotalScore);
        ranked[1].TotalScore.Should().BeGreaterThan(ranked[2].TotalScore);
    }
}
