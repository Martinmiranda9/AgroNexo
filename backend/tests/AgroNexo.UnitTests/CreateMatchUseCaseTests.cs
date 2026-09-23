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

    private readonly CreateMatchUseCase _useCase;

    public CreateMatchUseCaseTests()
    {
        _useCase = new CreateMatchUseCase(
            _matchRepoMock.Object,
            _producerRepoMock.Object,
            _professionalRepoMock.Object,
            _unitOfWorkMock.Object);
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

        _professionalRepoMock.Setup(r => r.GetByIdAsync(professionalId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(professional);

        // Simulate that an active or pending match already exists for this pair
        _matchRepoMock.Setup(r => r.HasActiveOrPendingMatchAsync(producerId, professionalId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);

        var request = new CreateMatchRequest
        {
            ProfessionalId = professionalId
        };

        // Act
        Func<Task> act = async () => await _useCase.ExecuteAsync(request, producerId);

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

        _professionalRepoMock.Setup(r => r.GetByIdAsync(prof1Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(prof1);

        _professionalRepoMock.Setup(r => r.GetByIdAsync(prof2Id, It.IsAny<CancellationToken>()))
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
        var response1 = await _useCase.ExecuteAsync(new CreateMatchRequest { ProfessionalId = prof1Id }, producerId);

        // Act 2: Create match with Professional 2
        var response2 = await _useCase.ExecuteAsync(new CreateMatchRequest { ProfessionalId = prof2Id }, producerId);

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

        _professionalRepoMock.Setup(r => r.GetByIdAsync(profId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((Professional?)null);

        // Act
        Func<Task> act = async () => await _useCase.ExecuteAsync(new CreateMatchRequest { ProfessionalId = profId }, producerId);

        // Assert
        await act.Should().ThrowAsync<EntityNotFoundException>()
            .WithMessage("*Profesional*");
    }
}
