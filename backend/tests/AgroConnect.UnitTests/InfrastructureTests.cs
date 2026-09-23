using AgroConnect.Domain.Entities;
using AgroConnect.Domain.Interfaces;
using AgroConnect.Infrastructure;
using AgroConnect.Infrastructure.Data;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Xunit;

namespace AgroConnect.UnitTests;

public class InfrastructureTests
{
    private AgroConnectDbContext CreateDbContext()
    {
        var options = new DbContextOptionsBuilder<AgroConnectDbContext>()
            .UseNpgsql("Host=localhost;Database=agroconnect_test;Username=postgres;Password=postgres",
                npgsqlOptions => npgsqlOptions.UseNetTopologySuite())
            .Options;

        return new AgroConnectDbContext(options);
    }

    [Fact]
    public void DbContextModel_TableNames_ConfiguredCorrectly()
    {
        // Arrange
        using var context = CreateDbContext();
        var model = context.Model;

        // Assert
        model.FindEntityType(typeof(Tenant))!.GetTableName().Should().Be("tenants");
        model.FindEntityType(typeof(Producer))!.GetTableName().Should().Be("producers");
        model.FindEntityType(typeof(Professional))!.GetTableName().Should().Be("professionals");
        model.FindEntityType(typeof(Match))!.GetTableName().Should().Be("matches");
        model.FindEntityType(typeof(MatchDiscoveryRequest))!.GetTableName().Should().Be("match_discovery_requests");
        model.FindEntityType(typeof(MatchRecommendation))!.GetTableName().Should().Be("match_recommendations");
        model.FindEntityType(typeof(Farm))!.GetTableName().Should().Be("farms");
    }

    [Fact]
    public void Producer_Auth0UserId_HasUniqueIndex()
    {
        // Arrange
        using var context = CreateDbContext();
        var entity = context.Model.FindEntityType(typeof(Producer))!;

        // Act
        var auth0Index = entity.GetIndexes()
            .FirstOrDefault(i => i.Properties.Any(p => p.Name == nameof(Producer.Auth0UserId)));

        // Assert
        auth0Index.Should().NotBeNull();
        auth0Index!.IsUnique.Should().BeTrue();
    }

    [Fact]
    public void Professional_Auth0UserId_HasUniqueIndex_And_CoverageArea_HasGistSpatialIndex()
    {
        // Arrange
        using var context = CreateDbContext();
        var entity = context.Model.FindEntityType(typeof(Professional))!;

        // Act
        var auth0Index = entity.GetIndexes()
            .FirstOrDefault(i => i.Properties.Any(p => p.Name == nameof(Professional.Auth0UserId)));

        var gistIndex = entity.GetIndexes()
            .FirstOrDefault(i => i.Properties.Any(p => p.Name == nameof(Professional.CoverageArea)));

        // Assert
        auth0Index.Should().NotBeNull();
        auth0Index!.IsUnique.Should().BeTrue();

        gistIndex.Should().NotBeNull();
        gistIndex!.Properties.Should().ContainSingle(p => p.Name == nameof(Professional.CoverageArea));
    }

    [Fact]
    public void Match_HasPartialUniqueIndex_On_ProducerId_And_ProfessionalId()
    {
        // Arrange
        using var context = CreateDbContext();
        var entity = context.Model.FindEntityType(typeof(Match))!;

        // Act
        var matchIndex = entity.GetIndexes()
            .FirstOrDefault(i => i.Properties.Count == 2 &&
                                 i.Properties.Any(p => p.Name == nameof(Match.ProducerId)) &&
                                 i.Properties.Any(p => p.Name == nameof(Match.ProfessionalId)));

        // Assert
        matchIndex.Should().NotBeNull();
        matchIndex!.IsUnique.Should().BeTrue();
        matchIndex.GetFilter().Should().Contain("\"Status\" IN (1, 2)");
    }

    [Fact]
    public void MatchRecommendation_Score_HasDecimalPrecision5_4()
    {
        // Arrange
        using var context = CreateDbContext();
        var entity = context.Model.FindEntityType(typeof(MatchRecommendation))!;

        // Act
        var scoreProp = entity.FindProperty(nameof(MatchRecommendation.Score))!;

        // Assert
        scoreProp.GetPrecision().Should().Be(5);
        scoreProp.GetScale().Should().Be(4);
    }

    [Fact]
    public void DependencyInjection_RegistersAllRepositoriesAndUnitOfWork()
    {
        // Arrange
        var services = new ServiceCollection();
        var configuration = new ConfigurationBuilder().Build();

        // Act
        services.AddInfrastructure(configuration);

        // Assert
        services.Should().Contain(sd => sd.ServiceType == typeof(ITenantRepository));
        services.Should().Contain(sd => sd.ServiceType == typeof(IProducerRepository));
        services.Should().Contain(sd => sd.ServiceType == typeof(IProfessionalRepository));
        services.Should().Contain(sd => sd.ServiceType == typeof(IMatchRepository));
        services.Should().Contain(sd => sd.ServiceType == typeof(IMatchDiscoveryRepository));
        services.Should().Contain(sd => sd.ServiceType == typeof(IFarmRepository));
        services.Should().Contain(sd => sd.ServiceType == typeof(IUnitOfWork));
    }
}
