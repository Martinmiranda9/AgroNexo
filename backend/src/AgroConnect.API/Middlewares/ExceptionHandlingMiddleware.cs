using System.ComponentModel.DataAnnotations;
using System.Diagnostics;
using System.Text.Json;
using System.Text.Json.Serialization;
using AgroConnect.Domain.Exceptions;
using Microsoft.AspNetCore.Mvc;

namespace AgroConnect.API.Middlewares;

/// <summary>
/// Global exception handling middleware producing RFC 7807 ProblemDetails responses.
/// Intercepts domain and application exceptions, mapping them to appropriate HTTP status codes.
/// </summary>
public class ExceptionHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionHandlingMiddleware> _logger;
    private readonly IHostEnvironment _environment;

    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull
    };

    public ExceptionHandlingMiddleware(
        RequestDelegate next,
        ILogger<ExceptionHandlingMiddleware> logger,
        IHostEnvironment environment)
    {
        _next = next;
        _logger = logger;
        _environment = environment;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            await HandleExceptionAsync(context, ex);
        }
    }

    private async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        var (statusCode, title, detail, problemType, validationErrors) = MapException(exception);

        if (statusCode >= 500)
        {
            _logger.LogError(exception, "Unhandled exception occurred while processing request {Path}", context.Request.Path);
        }
        else
        {
            _logger.LogWarning(exception, "Handled exception ({StatusCode} {Title}) for request {Path}: {Message}",
                statusCode, title, context.Request.Path, exception.Message);
        }

        context.Response.ContentType = "application/problem+json";
        context.Response.StatusCode = statusCode;

        var traceId = Activity.Current?.Id ?? context.TraceIdentifier;

        var problemDetails = new ProblemDetails
        {
            Status = statusCode,
            Title = title,
            Type = problemType,
            Detail = detail,
            Instance = context.Request.Path
        };

        problemDetails.Extensions["traceId"] = traceId;

        if (validationErrors != null && validationErrors.Count > 0)
        {
            problemDetails.Extensions["errors"] = validationErrors;
        }

        if (_environment.IsDevelopment() && statusCode >= 500)
        {
            problemDetails.Extensions["exception"] = exception.ToString();
        }

        var json = JsonSerializer.Serialize(problemDetails, JsonOptions);
        await context.Response.WriteAsync(json);
    }

    private (int StatusCode, string Title, string Detail, string Type, IReadOnlyDictionary<string, string[]>? ValidationErrors) MapException(Exception exception)
    {
        return exception switch
        {
            DuplicateMatchException ex => (
                StatusCodes.Status409Conflict,
                "Conflicto de duplicidad",
                ex.Message,
                "https://httpstatuses.io/409",
                null
            ),

            EntityNotFoundException ex => (
                StatusCodes.Status404NotFound,
                "Recurso no encontrado",
                ex.Message,
                "https://httpstatuses.io/404",
                null
            ),

            CrossTenantAccessException ex => (
                StatusCodes.Status403Forbidden,
                "Acceso no autorizado a nivel de tenant",
                ex.Message,
                "https://httpstatuses.io/403",
                null
            ),

            UnauthorizedAccessException ex => (
                StatusCodes.Status403Forbidden,
                "Acceso denegado",
                ex.Message,
                "https://httpstatuses.io/403",
                null
            ),

            DomainValidationException ex => (
                StatusCodes.Status400BadRequest,
                "Error de validación",
                ex.Message,
                "https://httpstatuses.io/400",
                ex.Errors
            ),

            ValidationException ex => (
                StatusCodes.Status400BadRequest,
                "Error de validación",
                ex.Message,
                "https://httpstatuses.io/400",
                null
            ),

            ArgumentException ex => (
                StatusCodes.Status400BadRequest,
                "Solicitud inválida",
                ex.Message,
                "https://httpstatuses.io/400",
                null
            ),

            DomainException ex => (
                StatusCodes.Status400BadRequest,
                "Violación de regla de dominio",
                ex.Message,
                "https://httpstatuses.io/400",
                null
            ),

            _ => (
                StatusCodes.Status500InternalServerError,
                "Error interno del servidor",
                _environment.IsDevelopment()
                    ? exception.Message
                    : "Ha ocurrido un error inesperado al procesar la solicitud.",
                "https://httpstatuses.io/500",
                null
            )
        };
    }
}
