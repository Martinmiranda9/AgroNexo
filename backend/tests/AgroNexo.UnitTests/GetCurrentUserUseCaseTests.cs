using AgroNexo.Application.Identity.UseCases;
using AgroNexo.Domain.Entities;
using AgroNexo.Domain.Enums;
using AgroNexo.Domain.Exceptions;
using AgroNexo.Domain.Interfaces;
using FluentAssertions;
using Moq;
using Xunit;

namespace AgroNexo.UnitTests;

public class GetCurrentUserUseCaseTests
{
    private readonly Mock<IProducerRepository> _producerRepoMock = new();
    private readonly Mock<IProfessionalRepository> _professionalRepoMock = new();
    private readonly GetCurrentUserUseCase _useCase;

    public GetCurrentUserUseCaseTests()
    {
        _useCase = new GetCurrentUserUseCase(_producerRepoMock.Object, _professionalRepoMock.Object);
    }

    [Fact]
    public async Task GetCurrentUser_WithoutProfile_ReturnsNotRegistered()
    {
        _producerRepoMock.Setup(r => r.GetByAuth0UserIdAsync("google-oauth2|new", It.IsAny<CancellationToken>()))
            .ReturnsAsync((Producer?)null);
        _professionalRepoMock.Setup(r => r.GetByAuth0UserIdAsync("google-oauth2|new", It.IsAny<CancellationToken>()))
            .ReturnsAsync((Professional?)null);

        var response = await _useCase.ExecuteAsync("google-oauth2|new");

        response.IsRegistered.Should().BeFalse();
        response.UserType.Should().BeNull();
        response.PublicId.Should().BeNull();
    }

    [Fact]
    public async Task GetCurrentUser_WithProducerProfile_ReturnsRegisteredProducer()
    {
        var producer = new Producer(
            Guid.NewGuid(), "google-oauth2|producer", "Esteban", "Quito", "20-99887766-5",
            null, "Argentina", "Córdoba", "Río Cuarto", "+5493511234567", null, null);
        _producerRepoMock.Setup(r => r.GetByAuth0UserIdAsync("google-oauth2|producer", It.IsAny<CancellationToken>()))
            .ReturnsAsync(producer);

        var response = await _useCase.ExecuteAsync("google-oauth2|producer");

        response.IsRegistered.Should().BeTrue();
        response.UserType.Should().Be(UserType.Producer);
        response.FirstName.Should().Be("Esteban");
        _professionalRepoMock.Verify(
            r => r.GetByAuth0UserIdAsync(It.IsAny<string>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task GetCurrentUser_WithBlankAuth0Id_Throws()
    {
        var act = () => _useCase.ExecuteAsync("  ");

        await act.Should().ThrowAsync<DomainValidationException>();
    }
}
