using AgroConnect.Application.Professionals.DTOs;
using AgroConnect.Application.Professionals.UseCases;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AgroConnect.API.Controllers;

/// <summary>
/// Manages agricultural professional profile information, capacity settings, and coverage polygons.
/// </summary>
[Route("api/v1/professionals")]
public class ProfessionalsController : ApiControllerBase
{
    private readonly IGetProfessionalProfileUseCase _getProfessionalProfileUseCase;
    private readonly IUpdateProfessionalProfileUseCase _updateProfessionalProfileUseCase;

    public ProfessionalsController(
        IGetProfessionalProfileUseCase getProfessionalProfileUseCase,
        IUpdateProfessionalProfileUseCase updateProfessionalProfileUseCase)
    {
        _getProfessionalProfileUseCase = getProfessionalProfileUseCase;
        _updateProfessionalProfileUseCase = updateProfessionalProfileUseCase;
    }

    /// <summary>
    /// Retrieves the profile details and coverage area of the currently authenticated professional.
    /// </summary>
    [HttpGet("me")]
    [Authorize(Policy = "IsProfessional")]
    [ProducesResponseType(typeof(ProfessionalProfileResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetMyProfile(CancellationToken cancellationToken)
    {
        var auth0UserId = CurrentAuth0UserId;
        if (string.IsNullOrWhiteSpace(auth0UserId))
        {
            return Unauthorized(new ProblemDetails
            {
                Status = StatusCodes.Status401Unauthorized,
                Title = "No autorizado",
                Detail = "No se pudo obtener el identificador de usuario del token.",
                Instance = HttpContext.Request.Path
            });
        }

        var profile = await _getProfessionalProfileUseCase.GetByAuth0UserIdAsync(auth0UserId, cancellationToken);
        if (profile == null)
        {
            return NotFound(new ProblemDetails
            {
                Status = StatusCodes.Status404NotFound,
                Title = "Perfil no encontrado",
                Detail = "No se encontró el perfil profesional correspondiente al usuario autenticado.",
                Instance = HttpContext.Request.Path
            });
        }

        return Ok(profile);
    }

    /// <summary>
    /// Updates the profile data, specialty, capacity, and coverage polygon for the authenticated professional.
    /// </summary>
    [HttpPut("me")]
    [Authorize(Policy = "IsProfessional")]
    [ProducesResponseType(typeof(ProfessionalProfileResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateMyProfile(
        [FromBody] UpdateProfessionalProfileRequest request,
        CancellationToken cancellationToken)
    {
        var auth0UserId = CurrentAuth0UserId;
        if (string.IsNullOrWhiteSpace(auth0UserId))
        {
            return Unauthorized(new ProblemDetails
            {
                Status = StatusCodes.Status401Unauthorized,
                Title = "No autorizado",
                Detail = "No se pudo obtener el identificador de usuario del token.",
                Instance = HttpContext.Request.Path
            });
        }

        var updatedProfile = await _updateProfessionalProfileUseCase.ExecuteAsync(auth0UserId, request, cancellationToken);
        return Ok(updatedProfile);
    }
}
