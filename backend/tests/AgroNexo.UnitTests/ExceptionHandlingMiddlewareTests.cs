using System.Net;
using System.Text.Json;
using AgroNexo.API.Middlewares;
using AgroNexo.Domain.Exceptions;
using FluentAssertions;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Moq;
using Xunit;

namespace AgroNexo.UnitTests;

public class ExceptionHandlingMiddlewareTests
{
    private readonly Mock<ILogger<ExceptionHandlingMiddleware>> _loggerMock = new();
    private readonly Mock<IHostEnvironment> _envMock = new();

    public ExceptionHandlingMiddlewareTests()
    {
        _envMock.Setup(e => e.EnvironmentName).Returns(Environments.Production);
    }

    [Fact]
    public async Task InvokeAsync_WhenDuplicateMatchExceptionThrown_Returns409ConflictProblemDetails()
    {
        // Arrange
        var producerId = Guid.NewGuid();
        var professionalId = Guid.NewGuid();
        RequestDelegate next = _ => throw new DuplicateMatchException(producerId, professionalId);

        var middleware = new ExceptionHandlingMiddleware(next, _loggerMock.Object, _envMock.Object);
        var context = new DefaultHttpContext();
        context.Response.Body = new MemoryStream();
        context.Request.Path = "/api/v1/matches";

        // Act
        await middleware.InvokeAsync(context);

        // Assert
        context.Response.StatusCode.Should().Be((int)HttpStatusCode.Conflict);
        context.Response.ContentType.Should().Be("application/problem+json");

        context.Response.Body.Seek(0, SeekOrigin.Begin);
        var json = await new StreamReader(context.Response.Body).ReadToEndAsync();
        var problemDetails = JsonSerializer.Deserialize<ProblemDetails>(json, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

        problemDetails.Should().NotBeNull();
        problemDetails!.Status.Should().Be(409);
        problemDetails.Title.Should().Be("Conflicto de duplicidad");
        problemDetails.Detail.Should().Contain(producerId.ToString());
    }

    [Fact]
    public async Task InvokeAsync_WhenEntityNotFoundExceptionThrown_Returns404NotFoundProblemDetails()
    {
        // Arrange
        RequestDelegate next = _ => throw new EntityNotFoundException("Productor", "auth0|test");

        var middleware = new ExceptionHandlingMiddleware(next, _loggerMock.Object, _envMock.Object);
        var context = new DefaultHttpContext();
        context.Response.Body = new MemoryStream();
        context.Request.Path = "/api/v1/producers/me";

        // Act
        await middleware.InvokeAsync(context);

        // Assert
        context.Response.StatusCode.Should().Be((int)HttpStatusCode.NotFound);
        context.Response.ContentType.Should().Be("application/problem+json");

        context.Response.Body.Seek(0, SeekOrigin.Begin);
        var json = await new StreamReader(context.Response.Body).ReadToEndAsync();
        var problemDetails = JsonSerializer.Deserialize<ProblemDetails>(json, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

        problemDetails.Should().NotBeNull();
        problemDetails!.Status.Should().Be(404);
        problemDetails.Title.Should().Be("Recurso no encontrado");
    }

    [Fact]
    public async Task InvokeAsync_WhenCrossTenantAccessExceptionThrown_Returns403ForbiddenProblemDetails()
    {
        // Arrange
        RequestDelegate next = _ => throw new CrossTenantAccessException("Acceso denegado inter-tenant.");

        var middleware = new ExceptionHandlingMiddleware(next, _loggerMock.Object, _envMock.Object);
        var context = new DefaultHttpContext();
        context.Response.Body = new MemoryStream();
        context.Request.Path = "/api/v1/matches/123/status";

        // Act
        await middleware.InvokeAsync(context);

        // Assert
        context.Response.StatusCode.Should().Be((int)HttpStatusCode.Forbidden);
        context.Response.ContentType.Should().Be("application/problem+json");

        context.Response.Body.Seek(0, SeekOrigin.Begin);
        var json = await new StreamReader(context.Response.Body).ReadToEndAsync();
        var problemDetails = JsonSerializer.Deserialize<ProblemDetails>(json, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

        problemDetails.Should().NotBeNull();
        problemDetails!.Status.Should().Be(403);
        problemDetails.Title.Should().Be("Acceso no autorizado a nivel de tenant");
    }

    [Fact]
    public async Task InvokeAsync_WhenDomainValidationExceptionThrown_Returns400BadRequestProblemDetailsWithErrors()
    {
        // Arrange
        var errors = new Dictionary<string, string[]>
        {
            { "FirstName", new[] { "El nombre es obligatorio." } }
        };
        RequestDelegate next = _ => throw new DomainValidationException("Error de validación", errors);

        var middleware = new ExceptionHandlingMiddleware(next, _loggerMock.Object, _envMock.Object);
        var context = new DefaultHttpContext();
        context.Response.Body = new MemoryStream();
        context.Request.Path = "/api/v1/identity/register";

        // Act
        await middleware.InvokeAsync(context);

        // Assert
        context.Response.StatusCode.Should().Be((int)HttpStatusCode.BadRequest);
        context.Response.ContentType.Should().Be("application/problem+json");

        context.Response.Body.Seek(0, SeekOrigin.Begin);
        var json = await new StreamReader(context.Response.Body).ReadToEndAsync();
        var problemDetails = JsonSerializer.Deserialize<ProblemDetails>(json, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

        problemDetails.Should().NotBeNull();
        problemDetails!.Status.Should().Be(400);
        problemDetails.Title.Should().Be("Error de validación");
    }

    [Fact]
    public async Task InvokeAsync_WhenUnhandledExceptionThrown_Returns500InternalServerError()
    {
        // Arrange
        RequestDelegate next = _ => throw new InvalidOperationException("Unexpected fatal failure");

        var middleware = new ExceptionHandlingMiddleware(next, _loggerMock.Object, _envMock.Object);
        var context = new DefaultHttpContext();
        context.Response.Body = new MemoryStream();
        context.Request.Path = "/api/v1/unknown";

        // Act
        await middleware.InvokeAsync(context);

        // Assert
        context.Response.StatusCode.Should().Be((int)HttpStatusCode.InternalServerError);
        context.Response.ContentType.Should().Be("application/problem+json");

        context.Response.Body.Seek(0, SeekOrigin.Begin);
        var json = await new StreamReader(context.Response.Body).ReadToEndAsync();
        var problemDetails = JsonSerializer.Deserialize<ProblemDetails>(json, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

        problemDetails.Should().NotBeNull();
        problemDetails!.Status.Should().Be(500);
        problemDetails.Title.Should().Be("Error interno del servidor");
        // In production, details should be generic
        problemDetails.Detail.Should().Be("Ha ocurrido un error inesperado al procesar la solicitud.");
    }
}
