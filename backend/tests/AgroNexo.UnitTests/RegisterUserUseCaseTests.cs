using AgroNexo.Application.Identity.DTOs;
using AgroNexo.Application.Identity.UseCases;
using AgroNexo.Domain.Entities;
using AgroNexo.Domain.Enums;
using AgroNexo.Domain.Exceptions;
using AgroNexo.Domain.Interfaces;
using FluentAssertions;
using Moq;
using Xunit;

namespace AgroNexo.UnitTests;

public class RegisterUserUseCaseTests
{
    private readonly Mock<ITenantRepository> _tenantRepoMock = new();
    private readonly Mock<IProducerRepository> _producerRepoMock = new();
    private readonly Mock<IProfessionalRepository> _professionalRepoMock = new();
    private readonly Mock<IUnitOfWork> _unitOfWorkMock = new();

    private readonly RegisterUserUseCase _useCase;

    public RegisterUserUseCaseTests()
    {
        _useCase = new RegisterUserUseCase(
            _tenantRepoMock.Object,
            _producerRepoMock.Object,
            _professionalRepoMock.Object,
            _unitOfWorkMock.Object);
    }

    [Fact]
    public async Task RegisterUser_AsProducer_CreatesTenantWorkspaceAndProducerEntity()
    {
        // Arrange
        var request = new RegisterUserRequest
        {
            UserType = UserType.Producer,
            FirstName = "Esteban",
            LastName = "Quito",
            DocumentNumber = "20-99887766-5"
        };

        _producerRepoMock.Setup(r => r.GetByAuth0UserIdAsync("auth0|producer1", It.IsAny<CancellationToken>()))
            .ReturnsAsync((Producer?)null);

        _professionalRepoMock.Setup(r => r.GetByAuth0UserIdAsync("auth0|producer1", It.IsAny<CancellationToken>()))
            .ReturnsAsync((Professional?)null);

        _tenantRepoMock.Setup(r => r.AddAsync(It.IsAny<Tenant>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((Tenant t, CancellationToken ct) => t);

        _producerRepoMock.Setup(r => r.AddAsync(It.IsAny<Producer>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((Producer p, CancellationToken ct) => p);

        _unitOfWorkMock.Setup(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(1);

        // Act
        var response = await _useCase.ExecuteAsync(request, "auth0|producer1");

        // Assert
        response.Should().NotBeNull();
        response.FirstName.Should().Be("Esteban");
        response.LastName.Should().Be("Quito");
        response.TenantName.Should().Be("Workspace de Esteban Quito");
        response.UserType.Should().Be(UserType.Producer);
        response.Auth0UserId.Should().Be("auth0|producer1");
        response.TenantId.Should().NotBeEmpty();
        response.UserId.Should().NotBeEmpty();

        _tenantRepoMock.Verify(r => r.AddAsync(It.Is<Tenant>(t => t.Name == "Workspace de Esteban Quito"), It.IsAny<CancellationToken>()), Times.Once);
        _producerRepoMock.Verify(r => r.AddAsync(It.Is<Producer>(p => p.FirstName == "Esteban" && p.Auth0UserId == "auth0|producer1"), It.IsAny<CancellationToken>()), Times.Once);
        _professionalRepoMock.Verify(r => r.AddAsync(It.IsAny<Professional>(), It.IsAny<CancellationToken>()), Times.Never);
        _unitOfWorkMock.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task RegisterUser_AsProfessional_CreatesTenantWorkspaceAndProfessionalEntity()
    {
        // Arrange
        var request = new RegisterUserRequest
        {
            UserType = UserType.Professional,
            FirstName = "Luciana",
            LastName = "Fernandez",
            DocumentNumber = "27-55443322-1",
            Role = ProfessionalRole.Agronomist,
            Specialty = "Siembra Directa",
            YearsExperience = 7,
            MaxCapacity = 30
        };

        _producerRepoMock.Setup(r => r.GetByAuth0UserIdAsync("auth0|pro1", It.IsAny<CancellationToken>()))
            .ReturnsAsync((Producer?)null);

        _professionalRepoMock.Setup(r => r.GetByAuth0UserIdAsync("auth0|pro1", It.IsAny<CancellationToken>()))
            .ReturnsAsync((Professional?)null);

        _tenantRepoMock.Setup(r => r.AddAsync(It.IsAny<Tenant>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((Tenant t, CancellationToken ct) => t);

        _professionalRepoMock.Setup(r => r.AddAsync(It.IsAny<Professional>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((Professional p, CancellationToken ct) => p);

        _unitOfWorkMock.Setup(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(1);

        // Act
        var response = await _useCase.ExecuteAsync(request, "auth0|pro1");

        // Assert
        response.Should().NotBeNull();
        response.FirstName.Should().Be("Luciana");
        response.LastName.Should().Be("Fernandez");
        response.TenantName.Should().Be("Workspace de Luciana Fernandez");
        response.UserType.Should().Be(UserType.Professional);
        response.Role.Should().Be(ProfessionalRole.Agronomist.ToString());
        response.Specialty.Should().Be("Siembra Directa");

        _tenantRepoMock.Verify(r => r.AddAsync(It.Is<Tenant>(t => t.Name == "Workspace de Luciana Fernandez"), It.IsAny<CancellationToken>()), Times.Once);
        _professionalRepoMock.Verify(r => r.AddAsync(It.Is<Professional>(p => p.Specialty == "Siembra Directa" && p.YearsExperience == 7), It.IsAny<CancellationToken>()), Times.Once);
        _producerRepoMock.Verify(r => r.AddAsync(It.IsAny<Producer>(), It.IsAny<CancellationToken>()), Times.Never);
        _unitOfWorkMock.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task RegisterUser_WhenAlreadyRegistered_ThrowsDomainException()
    {
        // Arrange
        var request = new RegisterUserRequest
        {
            UserType = UserType.Producer,
            FirstName = "Carlos",
            LastName = "Perez"
        };

        var tenantId = Guid.NewGuid();
        var existing = new Producer(tenantId, "auth0|existing", "Carlos", "Perez", "20-11111111-1");

        _producerRepoMock.Setup(r => r.GetByAuth0UserIdAsync("auth0|existing", It.IsAny<CancellationToken>()))
            .ReturnsAsync(existing);

        // Act
        Func<Task> act = async () => await _useCase.ExecuteAsync(request, "auth0|existing");

        // Assert
        await act.Should().ThrowAsync<DomainException>()
            .WithMessage("*ya se encuentra registrado*");
    }
}
