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
}
