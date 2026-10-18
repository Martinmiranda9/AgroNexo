using System.Security.Claims;
using AgroNexo.API.Middlewares;
using AgroNexo.API.Services;
using AgroNexo.Domain.Entities;
using AgroNexo.Domain.Enums;
using AgroNexo.Domain.Interfaces;
using FluentAssertions;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Moq;
using Xunit;

namespace AgroNexo.UnitTests;

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
        tenantContext.FirebaseUid.Should().Be(expectedUserId);
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
        _producerRepoMock.Setup(r => r.GetByFirebaseUidAsync(expectedUserId, It.IsAny<CancellationToken>()))
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
        tenantContext.FirebaseUid.Should().Be(expectedUserId);
        tenantContext.UserRole.Should().Be("Producer");

        currentUserService.TenantId.Should().Be(expectedTenantId);
        currentUserService.Role.Should().Be("Producer");
    }

    [Fact]
    public async Task InvokeAsync_WhenUnregisteredUserSendsTenantHeader_IgnoresHeaderAndReturnsUnauthorized()
    {
        // Arrange
        var headerTenantId = Guid.NewGuid();
        var expectedUserId = "auth0|headeruser";

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, expectedUserId)
        };
        var identity = new ClaimsIdentity(claims, "TestAuth");
        var principal = new ClaimsPrincipal(identity);

        var context = new DefaultHttpContext { User = principal };
        context.Request.Path = "/api/v1/farms";
        context.Request.Headers["X-Tenant-ID"] = headerTenantId.ToString();
        context.Response.Body = new MemoryStream();

        var tenantContext = new TenantContext();
        var currentUserService = new CurrentUserService();

        var nextCalled = false;
        RequestDelegate next = _ =>
        {
            nextCalled = true;
            return Task.CompletedTask;
        };
        var middleware = new TenantMiddleware(next, _loggerMock.Object);

        // Act
        await middleware.InvokeAsync(
            context,
            tenantContext,
            currentUserService,
            _producerRepoMock.Object,
            _professionalRepoMock.Object);

        // Assert
        context.Response.StatusCode.Should().Be(StatusCodes.Status401Unauthorized);
        context.Response.Body.Position = 0;
        var body = await new StreamReader(context.Response.Body).ReadToEndAsync();
        body.Should().Contain("tenant_claim_missing");

        nextCalled.Should().BeFalse();
        tenantContext.TenantId.Should().NotBe(headerTenantId);
        tenantContext.IsAuthenticated.Should().BeFalse();
        currentUserService.TenantId.Should().BeNull();
    }

    [Fact]
    public async Task InvokeAsync_WhenRegisteredUserSendsDifferentTenantHeader_UsesTenantFromRepository()
    {
        // Arrange
        var registeredTenantId = Guid.NewGuid();
        var headerTenantId = Guid.NewGuid();
        var expectedUserId = "auth0|headerproducer";

        var producer = new Producer(registeredTenantId, expectedUserId, "Carlos", "Gomez", "20123456");
        _producerRepoMock.Setup(r => r.GetByFirebaseUidAsync(expectedUserId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(producer);

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, expectedUserId)
        };
        var identity = new ClaimsIdentity(claims, "TestAuth");
        var principal = new ClaimsPrincipal(identity);

        var context = new DefaultHttpContext { User = principal };
        context.Request.Headers["X-Tenant-ID"] = headerTenantId.ToString();

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
        tenantContext.TenantId.Should().Be(registeredTenantId);
        tenantContext.FirebaseUid.Should().Be(expectedUserId);
        currentUserService.TenantId.Should().Be(registeredTenantId);
    }
}
