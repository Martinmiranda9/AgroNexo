using AgroNexo.Application.Common.DTOs;
using AgroNexo.Application.Common.Helpers;
using AgroNexo.Application.Matching.DTOs;
using AgroNexo.Application.Matching.ScoringEngine;
using AgroNexo.Application.Matching.UseCases;
using AgroNexo.Domain.Entities;
using AgroNexo.Domain.Enums;
using AgroNexo.Domain.Interfaces;
using FluentAssertions;
using Moq;
using NetTopologySuite.Geometries;
using Xunit;

namespace AgroNexo.UnitTests;

public class GenerateMatchRecommendationsUseCaseTests
{
    private readonly Mock<IProducerRepository> _producerRepoMock = new();
    private readonly Mock<IProfessionalRepository> _professionalRepoMock = new();
    private readonly Mock<IMatchDiscoveryRepository> _matchDiscoveryRepoMock = new();
    private readonly Mock<IUnitOfWork> _unitOfWorkMock = new();
    private readonly ScoringEngine _scoringEngine = new();

    private readonly GenerateMatchRecommendationsUseCase _useCase;

    public GenerateMatchRecommendationsUseCaseTests()
    {
        _useCase = new GenerateMatchRecommendationsUseCase(
            _producerRepoMock.Object,
            _professionalRepoMock.Object,
            _matchDiscoveryRepoMock.Object,
            _scoringEngine,
            _unitOfWorkMock.Object);
    }

    [Fact]
    public async Task GenerateMatchRecommendations_RanksAndPersistsRecommendations()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var producer = new Producer(tenantId, "auth0|prod", "Juan", "Perez", "20-11111111-1");
        var producerId = producer.Id;

        _producerRepoMock.Setup(r => r.GetByIdAsync(producerId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(producer);

        // Professional 1: high experience, verified, same specialty
        var prof1 = new Professional(
            tenantId,
            "auth0|prof1",
            "Maria",
            "Gomez",
            "27-11111111-1",
            ProfessionalRole.Agronomist,
            "Nutrición de Suelos",
            yearsExperience: 10,
            maxCapacity: 20,
            coverageArea: GeometryHelper.CreatePolygon(new[]
            {
                new CoordinateDto(-31.4, -64.1),
                new CoordinateDto(-31.3, -64.1),
                new CoordinateDto(-31.3, -64.2),
                new CoordinateDto(-31.4, -64.2),
                new CoordinateDto(-31.4, -64.1)
            }),
            isVerified: true);

        // Professional 2: lower experience, unverified
        var prof2 = new Professional(
            tenantId,
            "auth0|prof2",
            "Lucas",
            "Diaz",
            "20-22222222-2",
            ProfessionalRole.Agronomist,
            "Nutrición de Suelos",
            yearsExperience: 2,
            maxCapacity: 20,
            coverageArea: null,
            isVerified: false);

        _professionalRepoMock.Setup(r => r.FindCandidateProfessionalsAsync(
                It.IsAny<Point>(),
                "Nutrición de Suelos",
                true,
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<Professional> { prof1, prof2 });

        _professionalRepoMock.Setup(r => r.GetActiveMatchCountAsync(prof1.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(0);

        _professionalRepoMock.Setup(r => r.GetActiveMatchCountAsync(prof2.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(5);

        _matchDiscoveryRepoMock.Setup(r => r.AddAsync(It.IsAny<MatchDiscoveryRequest>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((MatchDiscoveryRequest req, CancellationToken ct) => req);

        _unitOfWorkMock.Setup(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(1);

        var request = new CreateMatchDiscoveryRequest
        {
            Latitude = -31.4167,
            Longitude = -64.1833,
            RequestedSpecialty = "Nutrición de Suelos",
            RequiresFieldPresence = true
        };

        // Act
        var response = await _useCase.ExecuteAsync(request, producerId);

        // Assert
        response.Should().NotBeNull();
        response.ProducerId.Should().Be(producerId);
        response.Recommendations.Should().HaveCount(2);

        // Verify Maria (prof1) is ranked #1 with higher score than Lucas (prof2)
        response.Recommendations[0].ProfessionalId.Should().Be(prof1.Id);
        response.Recommendations[0].RankPosition.Should().Be(1);
        response.Recommendations[0].Score.Should().BeGreaterThan(response.Recommendations[1].Score);

        response.Recommendations[1].ProfessionalId.Should().Be(prof2.Id);
        response.Recommendations[1].RankPosition.Should().Be(2);

        _matchDiscoveryRepoMock.Verify(r => r.AddAsync(It.Is<MatchDiscoveryRequest>(req => req.Recommendations.Count == 2), It.IsAny<CancellationToken>()), Times.Once);
        _unitOfWorkMock.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }
}
