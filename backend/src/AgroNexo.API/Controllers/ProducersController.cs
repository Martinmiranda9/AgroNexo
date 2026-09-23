using AgroNexo.Application.Producers.DTOs;
using AgroNexo.Application.Producers.UseCases;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AgroNexo.API.Controllers;

/// <summary>
/// Manages agricultural producer profile information.
/// </summary>
[Route("api/v1/producers")]
public class ProducersController : ApiControllerBase
{
    private readonly IGetProducerProfileUseCase _getProducerProfileUseCase;

    public ProducersController(IGetProducerProfileUseCase getProducerProfileUseCase)
    {
        _getProducerProfileUseCase = getProducerProfileUseCase;
    }

    /// <summary>
    /// Retrieves the profile details of the currently authenticated producer.
    /// </summary>
    [HttpGet("me")]
    [Authorize(Policy = "IsProducer")]
    [ProducesResponseType(typeof(ProducerProfileResponse), StatusCodes.Status200OK)]
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

        var profile = await _getProducerProfileUseCase.GetByAuth0UserIdAsync(auth0UserId, cancellationToken);
        if (profile == null)
        {
            return NotFound(new ProblemDetails
            {
                Status = StatusCodes.Status404NotFound,
                Title = "Perfil no encontrado",
                Detail = "No se encontró el perfil de productor correspondiente al usuario autenticado.",
                Instance = HttpContext.Request.Path
            });
        }

        return Ok(profile);
    }
}
