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

public class UpdateMatchStatusUseCaseTests
{
    private readonly Mock<IMatchRepository> _matchRepoMock = new();
    private readonly Mock<IProducerRepository> _producerRepoMock = new();
    private readonly Mock<IProfessionalRepository> _professionalRepoMock = new();
    private readonly Mock<IUnitOfWork> _unitOfWorkMock = new();

    private readonly UpdateMatchStatusUseCase _useCase;

    public UpdateMatchStatusUseCaseTests()
    {
        _useCase = new UpdateMatchStatusUseCase(
            _matchRepoMock.Object,
            _producerRepoMock.Object,
            _professionalRepoMock.Object,
            _unitOfWorkMock.Object);
    }

    [Fact]
    public async Task UpdateMatchStatus_AcceptPendingMatch_TransitionsToActive()
    {
        // Arrange
        var matchId = Guid.NewGuid();
        var producerId = Guid.NewGuid();
        var professionalId = Guid.NewGuid();
        var match = new Match(producerId, professionalId);

        _matchRepoMock.Setup(r => r.GetByIdAsync(matchId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(match);

        _matchRepoMock.Setup(r => r.UpdateAsync(match, It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);

        _unitOfWorkMock.Setup(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(1);

        var request = new UpdateMatchStatusRequest { Status = MatchStatus.Active };

        // Act
        var response = await _useCase.ExecuteAsync(matchId, request);

        // Assert
        response.Should().NotBeNull();
        response.Status.Should().Be(MatchStatus.Active);
        response.RespondedAt.Should().NotBeNull();

        _matchRepoMock.Verify(r => r.UpdateAsync(match, It.IsAny<CancellationToken>()), Times.Once);
        _unitOfWorkMock.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task UpdateMatchStatus_ProfessionalAcceptsMatch_ReturnsProducerContact()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var producer = new Producer(tenantId, "auth0|prod", "Carlos", "Perez", "20-12345678-9",
            phoneNumber: "+5491155550000", email: "carlos@campo.com");
        var professional = new Professional(tenantId, "auth0|prof", "Maria", "Gomez", "27-87654321-4",
            ProfessionalRole.Agronomist, "Nutrición");
        var match = new Match(producer.Id, professional.Id);

        _matchRepoMock.Setup(r => r.GetByIdAsync(match.Id, It.IsAny<CancellationToken>())).ReturnsAsync(match);
        _producerRepoMock.Setup(r => r.GetByAuth0UserIdAsync("auth0|prof", It.IsAny<CancellationToken>())).ReturnsAsync((Producer?)null);
        _professionalRepoMock.Setup(r => r.GetByAuth0UserIdAsync("auth0|prof", It.IsAny<CancellationToken>())).ReturnsAsync(professional);
        _producerRepoMock.Setup(r => r.GetByIdAsync(producer.Id, It.IsAny<CancellationToken>())).ReturnsAsync(producer);
        _unitOfWorkMock.Setup(u => u.SaveChangesAsync(It.IsAny<CancellationToken>())).ReturnsAsync(1);

        // Act
        var response = await _useCase.ExecuteAsync(match.Id, new UpdateMatchStatusRequest { Status = MatchStatus.Active }, "auth0|prof");

        // Assert
        response.ProducerContact.Should().NotBeNull();
        response.ProducerContact!.PhoneNumber.Should().Be("+5491155550000");
        response.ProducerContact.Email.Should().Be("carlos@campo.com");
    }

    [Fact]
    public async Task UpdateMatchStatus_ProfessionalRejectsMatch_DoesNotReturnProducerContact()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var producer = new Producer(tenantId, "auth0|prod", "Carlos", "Perez", "20-12345678-9",
            phoneNumber: "+5491155550000", email: "carlos@campo.com");
        var professional = new Professional(tenantId, "auth0|prof", "Maria", "Gomez", "27-87654321-4",
            ProfessionalRole.Agronomist, "Nutrición");
        var match = new Match(producer.Id, professional.Id);

        _matchRepoMock.Setup(r => r.GetByIdAsync(match.Id, It.IsAny<CancellationToken>())).ReturnsAsync(match);
        _producerRepoMock.Setup(r => r.GetByAuth0UserIdAsync("auth0|prof", It.IsAny<CancellationToken>())).ReturnsAsync((Producer?)null);
        _professionalRepoMock.Setup(r => r.GetByAuth0UserIdAsync("auth0|prof", It.IsAny<CancellationToken>())).ReturnsAsync(professional);
        _producerRepoMock.Setup(r => r.GetByIdAsync(producer.Id, It.IsAny<CancellationToken>())).ReturnsAsync(producer);
        _unitOfWorkMock.Setup(u => u.SaveChangesAsync(It.IsAny<CancellationToken>())).ReturnsAsync(1);

        // Act
        var response = await _useCase.ExecuteAsync(match.Id, new UpdateMatchStatusRequest { Status = MatchStatus.Rejected }, "auth0|prof");

        // Assert
        response.ProducerContact.Should().BeNull();
    }

    [Fact]
    public async Task UpdateMatchStatus_RejectPendingMatch_TransitionsToRejected()
    {
        // Arrange
        var matchId = Guid.NewGuid();
        var producerId = Guid.NewGuid();
        var professionalId = Guid.NewGuid();
        var match = new Match(producerId, professionalId);

        _matchRepoMock.Setup(r => r.GetByIdAsync(matchId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(match);

        _unitOfWorkMock.Setup(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(1);

        var request = new UpdateMatchStatusRequest { Status = MatchStatus.Rejected };

        // Act
        var response = await _useCase.ExecuteAsync(matchId, request);

        // Assert
        response.Status.Should().Be(MatchStatus.Rejected);
        response.RespondedAt.Should().NotBeNull();
    }

    [Fact]
    public async Task UpdateMatchStatus_CompleteActiveMatch_TransitionsToCompleted()
    {
        // Arrange
        var matchId = Guid.NewGuid();
        var producerId = Guid.NewGuid();
        var professionalId = Guid.NewGuid();
        var match = new Match(producerId, professionalId);
        match.Accept(); // First move to Active

        _matchRepoMock.Setup(r => r.GetByIdAsync(matchId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(match);

        _unitOfWorkMock.Setup(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(1);

        var request = new UpdateMatchStatusRequest { Status = MatchStatus.Completed };

        // Act
        var response = await _useCase.ExecuteAsync(matchId, request);

        // Assert
        response.Status.Should().Be(MatchStatus.Completed);
    }

    [Fact]
    public async Task UpdateMatchStatus_CompletePendingMatch_ThrowsDomainException()
    {
        // Arrange
        var matchId = Guid.NewGuid();
        var producerId = Guid.NewGuid();
        var professionalId = Guid.NewGuid();
        var match = new Match(producerId, professionalId); // Status is Pending

        _matchRepoMock.Setup(r => r.GetByIdAsync(matchId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(match);

        var request = new UpdateMatchStatusRequest { Status = MatchStatus.Completed };

        // Act
        Func<Task> act = async () => await _useCase.ExecuteAsync(matchId, request);

        // Assert
        await act.Should().ThrowAsync<DomainException>()
            .WithMessage("*Solo un Match activo puede ser marcado como completado*");
    }

    private (Match match, Guid matchId) ArrangeOwnedMatch()
    {
        var tenantId = Guid.NewGuid();
        var producer = new Producer(tenantId, "auth0|prod", "Carlos", "Perez", "20-12345678-9");
        var professional = new Professional(tenantId, "auth0|prof", "Maria", "Gomez", "27-87654321-4", ProfessionalRole.Lawyer, "Arrendamientos");
        var brief = new AgroNexo.Domain.ValueObjects.NeedBrief("Productor de Berrotarán, necesita revisar un contrato de arrendamiento.");
        var match = new Match(producer.Id, professional.Id, brief);

        _matchRepoMock.Setup(r => r.GetByIdAsync(match.Id, It.IsAny<CancellationToken>())).ReturnsAsync(match);
        _producerRepoMock.Setup(r => r.GetByAuth0UserIdAsync("auth0|prod", It.IsAny<CancellationToken>())).ReturnsAsync(producer);
        _producerRepoMock.Setup(r => r.GetByIdAsync(producer.Id, It.IsAny<CancellationToken>())).ReturnsAsync(producer);
        _professionalRepoMock.Setup(r => r.GetByAuth0UserIdAsync("auth0|prof", It.IsAny<CancellationToken>())).ReturnsAsync(professional);
        _professionalRepoMock.Setup(r => r.GetByIdAsync(professional.Id, It.IsAny<CancellationToken>())).ReturnsAsync(professional);
        _unitOfWorkMock.Setup(u => u.SaveChangesAsync(It.IsAny<CancellationToken>())).ReturnsAsync(1);

        return (match, match.Id);
    }

    [Fact]
    public async Task UpdateMatchStatus_ProfessionalAcceptsOwnPendingMatch_TransitionsToActive_AndKeepsTheBrief()
    {
        var (_, matchId) = ArrangeOwnedMatch();

        var response = await _useCase.ExecuteAsync(matchId, new UpdateMatchStatusRequest { Status = MatchStatus.Active }, "auth0|prof");

        response.Status.Should().Be(MatchStatus.Active);
        response.NeedBrief.Should().NotBeNull();
        response.NeedBrief!.Summary.Should().Contain("arrendamiento");
    }

    [Theory]
    [InlineData(MatchStatus.Active)]
    [InlineData(MatchStatus.Rejected)]
    public async Task UpdateMatchStatus_ProducerAcceptsOrRejectsItsOwnRequest_ThrowsCrossTenantAccessException(MatchStatus status)
    {
        var (match, matchId) = ArrangeOwnedMatch();

        Func<Task> act = async () => await _useCase.ExecuteAsync(matchId, new UpdateMatchStatusRequest { Status = status }, "auth0|prod");

        await act.Should().ThrowAsync<CrossTenantAccessException>().WithMessage("*Solo el profesional invitado*");
        match.Status.Should().Be(MatchStatus.Pending);
        _unitOfWorkMock.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task UpdateMatchStatus_ProducerCancelsItsOwnRequest_TransitionsToCancelled()
    {
        var (_, matchId) = ArrangeOwnedMatch();

        var response = await _useCase.ExecuteAsync(matchId, new UpdateMatchStatusRequest { Status = MatchStatus.Cancelled }, "auth0|prod");

        response.Status.Should().Be(MatchStatus.Cancelled);
    }

    [Fact]
    public async Task UpdateMatchStatus_UnrelatedUser_ThrowsCrossTenantAccessException()
    {
        var (_, matchId) = ArrangeOwnedMatch();

        Func<Task> act = async () => await _useCase.ExecuteAsync(matchId, new UpdateMatchStatusRequest { Status = MatchStatus.Active }, "auth0|stranger");

        await act.Should().ThrowAsync<CrossTenantAccessException>();
    }
}
