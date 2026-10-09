using AgroNexo.Application.Common.Interfaces;
using AgroNexo.Application.Matching.DTOs;
using AgroNexo.Application.Matching.UseCases;
using AgroNexo.Domain.Entities;
using AgroNexo.Domain.Enums;
using AgroNexo.Domain.Exceptions;
using AgroNexo.Domain.Interfaces;
using FluentAssertions;
using Moq;
using Xunit;
using Match = AgroNexo.Domain.Entities.Match;

namespace AgroNexo.UnitTests;

public class CreateMatchUseCaseTests
{
    private readonly Mock<IMatchRepository> _matchRepoMock = new();
    private readonly Mock<IProducerRepository> _producerRepoMock = new();
    private readonly Mock<IProfessionalRepository> _professionalRepoMock = new();
    private readonly Mock<IUnitOfWork> _unitOfWorkMock = new();
    private readonly Mock<IOwnershipValidator> _ownershipValidatorMock = new();

    private readonly CreateMatchUseCase _useCase;

    public CreateMatchUseCaseTests()
    {
        _useCase = new CreateMatchUseCase(
            _matchRepoMock.Object,
            _producerRepoMock.Object,
            _professionalRepoMock.Object,
            _unitOfWorkMock.Object,
            _ownershipValidatorMock.Object);

        // El validador de ownership delega en el repositorio mockeado de productores.
        _ownershipValidatorMock
            .Setup(v => v.GetOwnedProducerOrThrowAsync(It.IsAny<Guid>(), It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .Returns(async (Guid id, string auth0UserId, CancellationToken ct) =>
                (await _producerRepoMock.Object.GetByIdAsync(id, ct))
                ?? throw new CrossTenantAccessException("Productor no encontrado"));
    }

    [Fact]
    public async Task CreateMatch_DuplicatePair_ThrowsDuplicateMatchException()
    {
        // Arrange
        var producerId = Guid.NewGuid();
        var professionalId = Guid.NewGuid();
        var tenantId = Guid.NewGuid();

        var producer = new Producer(tenantId, "auth0|prod", "Carlos", "Perez", "20-12345678-9");
        var professional = new Professional(tenantId, "auth0|prof", "Maria", "Gomez", "27-87654321-4", ProfessionalRole.Agronomist, "Nutrición");

        _producerRepoMock.Setup(r => r.GetByIdAsync(producerId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(producer);

        _professionalRepoMock.Setup(r => r.GetByIdAcrossTenantsAsync(professionalId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(professional);

        // Simulate that an active or pending match already exists for this pair
        _matchRepoMock.Setup(r => r.HasActiveOrPendingMatchAsync(producerId, professionalId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);

        var request = new CreateMatchRequest
        {
            ProfessionalId = professionalId
        };

        // Act
        Func<Task> act = async () => await _useCase.ExecuteAsync(request, producerId, "auth0|prod");

        // Assert
        var exception = await act.Should().ThrowAsync<DuplicateMatchException>();
        exception.Which.ProducerId.Should().Be(producerId);
        exception.Which.ProfessionalId.Should().Be(professionalId);
        exception.Which.Message.Should().Contain("Ya existe una solicitud o vínculo de Match pendiente o activo");

        _matchRepoMock.Verify(r => r.AddAsync(It.IsAny<Match>(), It.IsAny<CancellationToken>()), Times.Never);
        _unitOfWorkMock.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task CreateMatch_MultipleDistinctProfessionalsSameSpecialty_Succeeds()
    {
        // Arrange: One producer invites two different agronomists with the same specialty ("Nutrición de Suelos")
        var tenantId = Guid.NewGuid();
        var producer = new Producer(tenantId, "auth0|prod", "Carlos", "Perez", "20-12345678-9");
        var prof1 = new Professional(tenantId, "auth0|prof1", "Maria", "Gomez", "27-11111111-1", ProfessionalRole.Agronomist, "Nutrición de Suelos");
        var prof2 = new Professional(tenantId, "auth0|prof2", "Lucas", "Diaz", "20-22222222-2", ProfessionalRole.Agronomist, "Nutrición de Suelos");
        var producerId = producer.Id;
        var prof1Id = prof1.Id;
        var prof2Id = prof2.Id;

        _producerRepoMock.Setup(r => r.GetByIdAsync(producerId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(producer);

        _professionalRepoMock.Setup(r => r.GetByIdAcrossTenantsAsync(prof1Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(prof1);

        _professionalRepoMock.Setup(r => r.GetByIdAcrossTenantsAsync(prof2Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(prof2);

        // No duplicate matches exist for either pair
        _matchRepoMock.Setup(r => r.HasActiveOrPendingMatchAsync(producerId, prof1Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(false);

        _matchRepoMock.Setup(r => r.HasActiveOrPendingMatchAsync(producerId, prof2Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(false);

        _matchRepoMock.Setup(r => r.AddAsync(It.IsAny<Match>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((Match m, CancellationToken ct) => m);

        _unitOfWorkMock.Setup(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(1);

        // Act 1: Create match with Professional 1
        var response1 = await _useCase.ExecuteAsync(new CreateMatchRequest { ProfessionalId = prof1Id }, producerId, "auth0|prod");

        // Act 2: Create match with Professional 2
        var response2 = await _useCase.ExecuteAsync(new CreateMatchRequest { ProfessionalId = prof2Id }, producerId, "auth0|prod");

        // Assert
        response1.Should().NotBeNull();
        response1.ProducerId.Should().Be(producerId);
        response1.ProfessionalId.Should().Be(prof1Id);
        response1.Status.Should().Be(MatchStatus.Pending);
        response1.Specialty.Should().Be("Nutrición de Suelos");

        response2.Should().NotBeNull();
        response2.ProducerId.Should().Be(producerId);
        response2.ProfessionalId.Should().Be(prof2Id);
        response2.Status.Should().Be(MatchStatus.Pending);
        response2.Specialty.Should().Be("Nutrición de Suelos");

        _matchRepoMock.Verify(r => r.AddAsync(It.IsAny<Match>(), It.IsAny<CancellationToken>()), Times.Exactly(2));
        _unitOfWorkMock.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Exactly(2));
    }

    [Fact]
    public async Task CreateMatch_NonExistentProfessional_ThrowsEntityNotFoundException()
    {
        // Arrange
        var producerId = Guid.NewGuid();
        var profId = Guid.NewGuid();
        var tenantId = Guid.NewGuid();
        var producer = new Producer(tenantId, "auth0|prod", "Carlos", "Perez", "20-12345678-9");

        _producerRepoMock.Setup(r => r.GetByIdAsync(producerId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(producer);

        _professionalRepoMock.Setup(r => r.GetByIdAcrossTenantsAsync(profId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((Professional?)null);

        // Act
        Func<Task> act = async () => await _useCase.ExecuteAsync(new CreateMatchRequest { ProfessionalId = profId }, producerId, "auth0|prod");

        // Assert
        await act.Should().ThrowAsync<EntityNotFoundException>()
            .WithMessage("*Profesional*");
    }

    private (Guid producerId, Guid professionalId) ArrangeValidPair()
    {
        var tenantId = Guid.NewGuid();
        var producer = new Producer(tenantId, "auth0|prod", "Carlos", "Perez", "20-12345678-9");
        var professional = new Professional(tenantId, "auth0|prof", "Maria", "Gomez", "27-87654321-4", ProfessionalRole.Accountant, "Impuestos agropecuarios");

        _producerRepoMock.Setup(r => r.GetByIdAsync(producer.Id, It.IsAny<CancellationToken>())).ReturnsAsync(producer);
        _professionalRepoMock.Setup(r => r.GetByIdAcrossTenantsAsync(professional.Id, It.IsAny<CancellationToken>())).ReturnsAsync(professional);
        _matchRepoMock.Setup(r => r.AddAsync(It.IsAny<Match>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((Match m, CancellationToken ct) => m);
        _unitOfWorkMock.Setup(u => u.SaveChangesAsync(It.IsAny<CancellationToken>())).ReturnsAsync(1);

        return (producer.Id, professional.Id);
    }

    [Fact]
    public async Task CreateMatch_WithNeedBrief_PersistsItAndReturnsItInTheResponse()
    {
        // Arrange
        var (producerId, professionalId) = ArrangeValidPair();
        Match? saved = null;
        _matchRepoMock.Setup(r => r.AddAsync(It.IsAny<Match>(), It.IsAny<CancellationToken>()))
            .Callback((Match m, CancellationToken ct) => saved = m)
            .ReturnsAsync((Match m, CancellationToken ct) => m);

        var request = new CreateMatchRequest
        {
            ProfessionalId = professionalId,
            NeedBrief = new NeedBriefRequest
            {
                Summary = "Productor de Berrotarán, 350 ha de soja, necesita ayuda con retenciones, este mes.",
                PlaceLabel = "Berrotarán, Córdoba",
                Hectares = 350,
                Urgency = MatchUrgency.ThisMonth,
                Topics = new List<string> { "farm-taxes" },
                Crops = new List<string> { "soybean" }
            }
        };

        // Act
        var response = await _useCase.ExecuteAsync(request, producerId, "auth0|prod");

        // Assert
        saved.Should().NotBeNull();
        saved!.NeedBrief.Should().NotBeNull();
        saved.NeedBrief!.Hectares.Should().Be(350);

        response.NeedBrief.Should().NotBeNull();
        response.NeedBrief!.PlaceLabel.Should().Be("Berrotarán, Córdoba");
        response.NeedBrief.Urgency.Should().Be(MatchUrgency.ThisMonth);
        response.NeedBrief.Topics.Should().Equal("farm-taxes");
        response.NeedBrief.Crops.Should().Equal("soybean");
    }

    [Fact]
    public async Task CreateMatch_WithoutNeedBrief_Succeeds_AndHasNoBrief()
    {
        // Arrange
        var (producerId, professionalId) = ArrangeValidPair();

        // Act
        var response = await _useCase.ExecuteAsync(new CreateMatchRequest { ProfessionalId = professionalId }, producerId, "auth0|prod");

        // Assert
        response.Status.Should().Be(MatchStatus.Pending);
        response.NeedBrief.Should().BeNull();
    }

    [Fact]
    public async Task CreateMatch_InvalidNeedBrief_ThrowsDomainValidationException_AndSavesNothing()
    {
        // Arrange
        var (producerId, professionalId) = ArrangeValidPair();
        var request = new CreateMatchRequest
        {
            ProfessionalId = professionalId,
            NeedBrief = new NeedBriefRequest { Summary = "corto", Hectares = 100 }
        };

        // Act
        Func<Task> act = async () => await _useCase.ExecuteAsync(request, producerId, "auth0|prod");

        // Assert
        await act.Should().ThrowAsync<DomainValidationException>();
        _matchRepoMock.Verify(r => r.AddAsync(It.IsAny<Match>(), It.IsAny<CancellationToken>()), Times.Never);
        _unitOfWorkMock.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Never);
    }
}
