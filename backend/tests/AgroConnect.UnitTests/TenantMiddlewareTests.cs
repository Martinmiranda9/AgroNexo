using System.Security.Claims;
using AgroConnect.API.Middlewares;
using AgroConnect.API.Services;
using AgroConnect.Domain.Entities;
using AgroConnect.Domain.Enums;
using AgroConnect.Domain.Interfaces;
using FluentAssertions;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Moq;
using Xunit;

namespace AgroConnect.UnitTests;

public class TenantMiddlewareTests
{
    private readonly Mock<ILogger<TenantMiddleware>> _loggerMock = new();
    private readonly Mock<IProducerRepository> _producerRepoMock = new();
    private readonly Mock<IProfessionalRepository> _professionalRepoMock = new();

    [Fact]
    public async Task InvokeAsync_WhenUserHasTenantClaim_PopulatesTenantContextFromClaim()
    {
        // Arrange
        var expectedTenantId = Guid.NewGuid();
        var expectedUserId = "auth0|producer123";

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, expectedUserId),
            new Claim("tenant_id", expectedTenantId.ToString()),
            new Claim(ClaimTypes.Role, "Producer")
        };
        var identity = new ClaimsIdentity(claims, "TestAuth");
        var principal = new ClaimsPrincipal(identity);

        var context = new DefaultHttpContext { User = principal };
        var tenantContext = new TenantContext();
        var currentUserService = new CurrentUserService();

        RequestDelegate next = _ => Task.CompletedTask;
        var middleware = new TenantMiddleware(next, _loggerMock.Object);

        // Act
        await middleware.InvokeAsync(
            context,
            tenantContext,
            currentUserService,
            _producerRepoMock.Object,
            _professionalRepoMock.Object);

        // Assert
        tenantContext.TenantId.Should().Be(expectedTenantId);
        tenantContext.Auth0UserId.Should().Be(expectedUserId);
        tenantContext.UserRole.Should().Be("Producer");
        tenantContext.IsAuthenticated.Should().BeTrue();

        currentUserService.UserId.Should().Be(expectedUserId);
        currentUserService.TenantId.Should().Be(expectedTenantId);
        currentUserService.Role.Should().Be("Producer");
        currentUserService.IsAuthenticated.Should().BeTrue();
    }

    [Fact]
    public async Task InvokeAsync_WhenUserHasNoTenantClaim_ResolvesTenantFromProducerRepository()
    {
        // Arrange
        var expectedTenantId = Guid.NewGuid();
        var expectedUserId = "auth0|dbproducer";

        var producer = new Producer(expectedTenantId, expectedUserId, "Carlos", "Gomez", "20123456");
        _producerRepoMock.Setup(r => r.GetByAuth0UserIdAsync(expectedUserId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(producer);

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, expectedUserId)
        };
        var identity = new ClaimsIdentity(claims, "TestAuth");
        var principal = new ClaimsPrincipal(identity);

        var context = new DefaultHttpContext { User = principal };
        var tenantContext = new TenantContext();
        var currentUserService = new CurrentUserService();

        RequestDelegate next = _ => Task.CompletedTask;
        var middleware = new TenantMiddleware(next, _loggerMock.Object);

        // Act
        await middleware.InvokeAsync(
            context,
            tenantContext,
            currentUserService,
            _producerRepoMock.Object,
            _professionalRepoMock.Object);

        // Assert
        tenantContext.TenantId.Should().Be(expectedTenantId);
        tenantContext.Auth0UserId.Should().Be(expectedUserId);
        tenantContext.UserRole.Should().Be("Producer");

        currentUserService.TenantId.Should().Be(expectedTenantId);
        currentUserService.Role.Should().Be("Producer");
    }

    [Fact]
    public async Task InvokeAsync_WhenUserHasHeaderTenantId_PopulatesTenantContextFromHeader()
    {
        // Arrange
        var expectedTenantId = Guid.NewGuid();
        var expectedUserId = "auth0|headeruser";

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, expectedUserId)
        };
        var identity = new ClaimsIdentity(claims, "TestAuth");
        var principal = new ClaimsPrincipal(identity);

        var context = new DefaultHttpContext { User = principal };
        context.Request.Headers["X-Tenant-ID"] = expectedTenantId.ToString();

        var tenantContext = new TenantContext();
        var currentUserService = new CurrentUserService();

        RequestDelegate next = _ => Task.CompletedTask;
        var middleware = new TenantMiddleware(next, _loggerMock.Object);

        // Act
        await middleware.InvokeAsync(
            context,
            tenantContext,
            currentUserService,
            _producerRepoMock.Object,
            _professionalRepoMock.Object);

        // Assert
        tenantContext.TenantId.Should().Be(expectedTenantId);
        tenantContext.Auth0UserId.Should().Be(expectedUserId);
        currentUserService.TenantId.Should().Be(expectedTenantId);
    }
}
