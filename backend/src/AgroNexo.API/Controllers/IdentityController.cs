using AgroNexo.Application.Identity.DTOs;
using AgroNexo.Application.Identity.UseCases;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AgroNexo.API.Controllers;

/// <summary>
/// Handles user onboarding and registration with automatic workspace generation.
/// </summary>
[Route("api/v1/identity")]
public class IdentityController : ApiControllerBase
{
    private readonly IRegisterUserUseCase _registerUserUseCase;
    private readonly IGetCurrentUserUseCase _getCurrentUserUseCase;

    public IdentityController(
        IRegisterUserUseCase registerUserUseCase,
        IGetCurrentUserUseCase getCurrentUserUseCase)
    {
        _registerUserUseCase = registerUserUseCase;
        _getCurrentUserUseCase = getCurrentUserUseCase;
    }

    /// <summary>
    /// Indica si el usuario autenticado ya completó el registro. El frontend lo usa tras el login
    /// para decidir entre el onboarding (primer ingreso) y la aplicación.
    /// </summary>
    [HttpGet("me")]
    [Authorize]
    [ProducesResponseType(typeof(CurrentUserResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Me(CancellationToken cancellationToken)
    {
        var auth0UserId = CurrentAuth0UserId;
        if (string.IsNullOrWhiteSpace(auth0UserId))
        {
            return Unauthorized(new ProblemDetails
            {
                Status = StatusCodes.Status401Unauthorized,
                Title = "No autorizado",
                Detail = "El token de autenticación no contiene un identificador de usuario válido.",
                Instance = HttpContext.Request.Path
            });
        }

        return Ok(await _getCurrentUserUseCase.ExecuteAsync(auth0UserId, cancellationToken));
    }

    /// <summary>
    /// Registers a new Producer or Professional profile and automatically creates an isolated Tenant workspace.
    /// </summary>
    /// <param name="request">Registration profile data including user type toggle.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Created user profile with assigned Tenant workspace ID.</returns>
    [HttpPost("register")]
    [Authorize]
    [ProducesResponseType(typeof(RegisterUserResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Register(
        [FromBody] RegisterUserRequest request,
        CancellationToken cancellationToken)
    {
        var auth0UserId = CurrentAuth0UserId;
        if (string.IsNullOrWhiteSpace(auth0UserId))
        {
            return Unauthorized(new ProblemDetails
            {
                Status = StatusCodes.Status401Unauthorized,
                Title = "No autorizado",
                Detail = "El token de autenticación no contiene un identificador de usuario válido.",
                Instance = HttpContext.Request.Path
            });
        }

        var response = await _registerUserUseCase.ExecuteAsync(request, auth0UserId, cancellationToken);
        return StatusCode(StatusCodes.Status201Created, response);
    }
}
