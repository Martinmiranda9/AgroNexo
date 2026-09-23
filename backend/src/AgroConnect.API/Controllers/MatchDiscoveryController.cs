using AgroConnect.Application.Matching.DTOs;
using AgroConnect.Application.Matching.UseCases;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AgroConnect.API.Controllers;

/// <summary>
/// Executes geospatial candidate searches and calculates ranked professional recommendations for producers.
/// </summary>
[Route("api/v1/match-discovery")]
public class MatchDiscoveryController : ApiControllerBase
{
    private readonly IGenerateMatchRecommendationsUseCase _generateRecommendationsUseCase;
    private readonly IGetMatchRecommendationsUseCase _getRecommendationsUseCase;

    public MatchDiscoveryController(
        IGenerateMatchRecommendationsUseCase generateRecommendationsUseCase,
        IGetMatchRecommendationsUseCase getRecommendationsUseCase)
    {
        _generateRecommendationsUseCase = generateRecommendationsUseCase;
        _getRecommendationsUseCase = getRecommendationsUseCase;
    }

    /// <summary>
    /// Submits a new match discovery query, executing PostGIS spatial containment and the multi-factor scoring engine.
    /// </summary>
    /// <param name="request">Coordinates and specialty search criteria.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Created discovery search result with ranked candidate recommendations.</returns>
    [HttpPost]
    [Authorize(Policy = "IsProducer")]
    [ProducesResponseType(typeof(MatchDiscoveryResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> CreateDiscoveryRequest(
        [FromBody] CreateMatchDiscoveryRequest request,
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

        var response = await _generateRecommendationsUseCase.ExecuteByAuth0UserIdAsync(request, auth0UserId, cancellationToken);
        return CreatedAtAction(nameof(GetRecommendations), new { id = response.Id }, response);
    }

    /// <summary>
    /// Retrieves the ranked recommendations and candidate scores for a previously executed discovery request.
    /// </summary>
    /// <param name="id">The unique identifier of the match discovery request.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Ranked candidate recommendations for the request.</returns>
    [HttpGet("{id:guid}/recommendations")]
    [Authorize(Policy = "IsProducer")]
    [ProducesResponseType(typeof(MatchDiscoveryResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetRecommendations(
        [FromRoute] Guid id,
        CancellationToken cancellationToken)
    {
        var auth0UserId = CurrentAuth0UserId;
        var response = await _getRecommendationsUseCase.ExecuteAsync(id, auth0UserId, cancellationToken);
        if (response == null)
        {
            return NotFound(new ProblemDetails
            {
                Status = StatusCodes.Status404NotFound,
                Title = "Búsqueda no encontrada",
                Detail = $"No se encontró la solicitud de descubrimiento con identificador '{id}'.",
                Instance = HttpContext.Request.Path
            });
        }

        return Ok(response);
    }
}
