using AgroConnect.Domain.Entities;
using AgroConnect.Domain.Enums;
using AgroConnect.Domain.Exceptions;
using AgroConnect.Domain.ValueObjects;
using FluentAssertions;
using NetTopologySuite.Geometries;
using Xunit;

namespace AgroConnect.UnitTests;

public class DomainTests
{
    [Fact]
    public void Tenant_Creation_WithValidName_ShouldSucceed()
    {
        // Arrange & Act
        var tenant = new Tenant("Workspace de Juan Perez");

        // Assert
        tenant.Id.Should().NotBeEmpty();
        tenant.Name.Should().Be("Workspace de Juan Perez");
        tenant.IsActive.Should().BeTrue();
        tenant.CreatedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(2));
    }

    [Fact]
    public void Tenant_Creation_WithEmptyName_ShouldThrowDomainValidationException()
    {
        // Act
        Action act = () => new Tenant("");

        // Assert
        act.Should().Throw<DomainValidationException>()
            .WithMessage("*nombre del tenant es obligatorio*");
    }

    [Fact]
    public void Producer_Creation_WithValidData_ShouldSucceed()
    {
        // Arrange
        var tenantId = Guid.NewGuid();

        // Act
        var producer = new Producer(tenantId, "auth0|12345", "Carlos", "Perez", "20-12345678-9");

        // Assert
        producer.Id.Should().NotBeEmpty();
        producer.TenantId.Should().Be(tenantId);
        producer.Auth0UserId.Should().Be("auth0|12345");
        producer.FirstName.Should().Be("Carlos");
        producer.LastName.Should().Be("Perez");
        producer.DocumentNumber.Should().Be("20-12345678-9");
        producer.IsActive.Should().BeTrue();
    }

    [Fact]
    public void Professional_Creation_WithValidDataAndGeometry_ShouldSucceed()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var geometryFactory = NetTopologySuite.NtsGeometryServices.Instance.CreateGeometryFactory(4326);
        var polygon = geometryFactory.CreatePolygon(new[]
        {
            new NetTopologySuite.Geometries.Coordinate(-60.0, -32.0),
            new NetTopologySuite.Geometries.Coordinate(-59.0, -32.0),
            new NetTopologySuite.Geometries.Coordinate(-59.0, -31.0),
            new NetTopologySuite.Geometries.Coordinate(-60.0, -31.0),
            new NetTopologySuite.Geometries.Coordinate(-60.0, -32.0)
        });

        // Act
        var professional = new Professional(
            tenantId,
            "auth0|pro123",
            "Maria",
            "Gomez",
            "27-87654321-4",
            ProfessionalRole.Agronomist,
            "Nutrición de Suelos",
            yearsExperience: 8,
            maxCapacity: 25,
            coverageArea: polygon,
            isVerified: true);

        // Assert
        professional.Id.Should().NotBeEmpty();
        professional.Role.Should().Be(ProfessionalRole.Agronomist);
        professional.Specialty.Should().Be("Nutrición de Suelos");
        professional.YearsExperience.Should().Be(8);
        professional.MaxCapacity.Should().Be(25);
        professional.CoverageArea.Should().NotBeNull();
        professional.IsVerified.Should().BeTrue();
    }

    [Fact]
    public void Match_Lifecycle_TransitionsCorrectly()
    {
        // Arrange
        var producerId = Guid.NewGuid();
        var professionalId = Guid.NewGuid();
        var match = new Match(producerId, professionalId);

        // Assert initial
        match.Status.Should().Be(MatchStatus.Pending);
        match.RespondedAt.Should().BeNull();

        // Act Accept
        match.Accept();
        match.Status.Should().Be(MatchStatus.Active);
        match.RespondedAt.Should().NotBeNull();

        // Act Complete
        match.Complete();
        match.Status.Should().Be(MatchStatus.Completed);
    }

    [Fact]
    public void MatchDiscoveryRequest_WithNetTopologySuitePoint_AddsRecommendationsProperly()
    {
        // Arrange
        var producerId = Guid.NewGuid();
        var point = new AgroConnect.Domain.ValueObjects.Coordinate(-31.4201, -64.1888).ToPoint();

        // Act
        var request = new MatchDiscoveryRequest(producerId, point, "Agronomía General", requiresFieldPresence: true);
        var professionalId = Guid.NewGuid();
        var recommendation = request.AddRecommendation(professionalId, 0.85m, 1);

        // Assert
        request.Recommendations.Should().ContainSingle();
        recommendation.ProfessionalId.Should().Be(professionalId);
        recommendation.Score.Should().Be(0.85m);
        recommendation.RankPosition.Should().Be(1);
    }
}
