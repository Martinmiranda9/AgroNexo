using AgroConnect.Application.Identity.DTOs;
using AgroConnect.Application.Identity.UseCases;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AgroConnect.API.Controllers;

/// <summary>
/// Handles user onboarding and registration with automatic workspace generation.
/// </summary>
[Route("api/v1/identity")]
public class IdentityController : ApiControllerBase
{
    private readonly IRegisterUserUseCase _registerUserUseCase;

    public IdentityController(IRegisterUserUseCase registerUserUseCase)
    {
        _registerUserUseCase = registerUserUseCase;
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
