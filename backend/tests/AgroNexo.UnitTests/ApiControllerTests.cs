using System.Security.Claims;
using AgroNexo.API.Controllers;
using AgroNexo.Application.Identity.DTOs;
using AgroNexo.Application.Identity.UseCases;
using AgroNexo.Application.Matching.DTOs;
using AgroNexo.Application.Matching.UseCases;
using AgroNexo.Application.Producers.DTOs;
using AgroNexo.Application.Producers.UseCases;
using AgroNexo.Application.Professionals.DTOs;
using AgroNexo.Application.Professionals.UseCases;
using AgroNexo.Domain.Enums;
using FluentAssertions;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Moq;
using Xunit;

namespace AgroNexo.UnitTests;

public class ApiControllerTests
{
    private static void SetUserContext(ControllerBase controller, string auth0UserId, string role = "Producer")
    {
        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, auth0UserId),
            new Claim(ClaimTypes.Role, role),
            new Claim("user_type", role)
        };
        var identity = new ClaimsIdentity(claims, "TestAuth");
        var principal = new ClaimsPrincipal(identity);

        controller.ControllerContext = new ControllerContext
        {
            HttpContext = new DefaultHttpContext { User = principal }
        };
    }

    [Fact]
    public async Task IdentityController_Register_Returns201Created()
    {
        // Arrange
        var mockUseCase = new Mock<IRegisterUserUseCase>();
        var request = new RegisterUserRequest
        {
            UserType = UserType.Producer,
            FirstName = "Juan",
            LastName = "Perez"
        };
        var expectedResponse = new RegisterUserResponse
        {
            UserId = Guid.NewGuid(),
            TenantId = Guid.NewGuid(),
            TenantName = "Workspace de Juan Perez",
            Auth0UserId = "auth0|user1",
            FirstName = "Juan",
            LastName = "Perez"
        };

        mockUseCase.Setup(u => u.ExecuteAsync(request, "auth0|user1", It.IsAny<CancellationToken>()))
            .ReturnsAsync(expectedResponse);

        var controller = new IdentityController(mockUseCase.Object);
        SetUserContext(controller, "auth0|user1");

        // Act
        var result = await controller.Register(request, CancellationToken.None);

        // Assert
        var objectResult = result.Should().BeOfType<ObjectResult>().Subject;
        objectResult.StatusCode.Should().Be(StatusCodes.Status201Created);
        objectResult.Value.Should().BeEquivalentTo(expectedResponse);
    }

    [Fact]
    public async Task ProducersController_GetMyProfile_WhenFound_Returns200Ok()
    {
        // Arrange
        var mockUseCase = new Mock<IGetProducerProfileUseCase>();
        var expectedResponse = new ProducerProfileResponse
        {
            Id = Guid.NewGuid(),
            Auth0UserId = "auth0|producer1",
            FirstName = "Carlos",
            LastName = "Gomez",
            IsActive = true
        };

        mockUseCase.Setup(u => u.GetByAuth0UserIdAsync("auth0|producer1", It.IsAny<CancellationToken>()))
            .ReturnsAsync(expectedResponse);

        var controller = new ProducersController(mockUseCase.Object);
        SetUserContext(controller, "auth0|producer1", "Producer");

        // Act
        var result = await controller.GetMyProfile(CancellationToken.None);

        // Assert
        var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
        okResult.StatusCode.Should().Be(StatusCodes.Status200OK);
        okResult.Value.Should().BeEquivalentTo(expectedResponse);
    }

    [Fact]
    public async Task ProfessionalsController_GetMyProfile_WhenFound_Returns200Ok()
    {
        // Arrange
        var mockGetUseCase = new Mock<IGetProfessionalProfileUseCase>();
        var mockUpdateUseCase = new Mock<IUpdateProfessionalProfileUseCase>();
        var expectedResponse = new ProfessionalProfileResponse
        {
            Id = Guid.NewGuid(),
            Auth0UserId = "auth0|prof1",
            FirstName = "Maria",
            LastName = "Lopez",
            Role = ProfessionalRole.Agronomist,
            Specialty = "Agronomía",
            IsVerified = true,
            IsActive = true
        };

        mockGetUseCase.Setup(u => u.GetByAuth0UserIdAsync("auth0|prof1", It.IsAny<CancellationToken>()))
            .ReturnsAsync(expectedResponse);

        var controller = new ProfessionalsController(mockGetUseCase.Object, mockUpdateUseCase.Object);
        SetUserContext(controller, "auth0|prof1", "Professional");

        // Act
        var result = await controller.GetMyProfile(CancellationToken.None);

        // Assert
        var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
        okResult.StatusCode.Should().Be(StatusCodes.Status200OK);
        okResult.Value.Should().BeEquivalentTo(expectedResponse);
    }

    [Fact]
    public async Task MatchDiscoveryController_CreateDiscoveryRequest_Returns201CreatedAtAction()
    {
        // Arrange
        var mockGenerateUseCase = new Mock<IGenerateMatchRecommendationsUseCase>();
        var mockGetUseCase = new Mock<IGetMatchRecommendationsUseCase>();
        var request = new CreateMatchDiscoveryRequest
        {
            Latitude = -34.6037,
            Longitude = -58.3816,
            RequestedSpecialty = "Agronomía",
            RequiresFieldPresence = true
        };
        var expectedResponse = new MatchDiscoveryResponse
        {
            Id = Guid.NewGuid(),
            ProducerId = Guid.NewGuid(),
            Latitude = -34.6037,
            Longitude = -58.3816,
            RequestedSpecialty = "Agronomía",
            RequiresFieldPresence = true,
            CreatedAt = DateTime.UtcNow,
            Recommendations = new List<MatchRecommendationResponse>()
        };

        mockGenerateUseCase.Setup(u => u.ExecuteByAuth0UserIdAsync(request, "auth0|producer1", It.IsAny<CancellationToken>()))
            .ReturnsAsync(expectedResponse);

        var controller = new MatchDiscoveryController(mockGenerateUseCase.Object, mockGetUseCase.Object);
        SetUserContext(controller, "auth0|producer1", "Producer");

        // Act
        var result = await controller.CreateDiscoveryRequest(request, CancellationToken.None);

        // Assert
        var createdResult = result.Should().BeOfType<CreatedAtActionResult>().Subject;
        createdResult.StatusCode.Should().Be(StatusCodes.Status201Created);
        createdResult.ActionName.Should().Be(nameof(MatchDiscoveryController.GetRecommendations));
        createdResult.Value.Should().BeEquivalentTo(expectedResponse);
    }

    [Fact]
    public async Task MatchesController_CreateMatch_Returns201CreatedAtAction()
    {
        // Arrange
        var mockCreateUseCase = new Mock<ICreateMatchUseCase>();
        var mockGetUseCase = new Mock<IGetMatchesUseCase>();
        var mockUpdateUseCase = new Mock<IUpdateMatchStatusUseCase>();

        var professionalId = Guid.NewGuid();
        var request = new CreateMatchRequest { ProfessionalId = professionalId };
        var expectedResponse = new MatchResponse
        {
            Id = Guid.NewGuid(),
            ProducerId = Guid.NewGuid(),
            ProducerName = "Juan Perez",
            ProfessionalId = professionalId,
            ProfessionalName = "Maria Lopez",
            Specialty = "Agronomía",
            Status = MatchStatus.Pending,
            RequestedAt = DateTime.UtcNow
        };

        mockCreateUseCase.Setup(u => u.ExecuteByAuth0UserIdAsync(request, "auth0|producer1", It.IsAny<CancellationToken>()))
            .ReturnsAsync(expectedResponse);

        var controller = new MatchesController(mockCreateUseCase.Object, mockGetUseCase.Object, mockUpdateUseCase.Object);
        SetUserContext(controller, "auth0|producer1", "Producer");

        // Act
        var result = await controller.CreateMatch(request, CancellationToken.None);

        // Assert
        var createdResult = result.Should().BeOfType<CreatedAtActionResult>().Subject;
        createdResult.StatusCode.Should().Be(StatusCodes.Status201Created);
        createdResult.ActionName.Should().Be(nameof(MatchesController.GetMatches));
        createdResult.Value.Should().BeEquivalentTo(expectedResponse);
    }

    [Fact]
    public void HealthController_GetHealth_Returns200OkWithHealthyStatus()
    {
        // Arrange
        var controller = new HealthController();

        // Act
        var result = controller.GetHealth();

        // Assert
        var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
        okResult.StatusCode.Should().Be(StatusCodes.Status200OK);
        okResult.Value.Should().NotBeNull();
    }
}
