using AgroNexo.Application.Common.Models;
using AgroNexo.Application.Matching.DTOs;
using AgroNexo.Application.Matching.UseCases;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AgroNexo.API.Controllers;

/// <summary>
/// Manages cross-tenant matches, invitations, and lifecycle state changes between producers and professionals.
/// </summary>
[Route("api/v1/matches")]
public class MatchesController : ApiControllerBase
{
    private readonly ICreateMatchUseCase _createMatchUseCase;
    private readonly IGetMatchesUseCase _getMatchesUseCase;
    private readonly IUpdateMatchStatusUseCase _updateMatchStatusUseCase;

    public MatchesController(
        ICreateMatchUseCase createMatchUseCase,
        IGetMatchesUseCase getMatchesUseCase,
        IUpdateMatchStatusUseCase updateMatchStatusUseCase)
    {
        _createMatchUseCase = createMatchUseCase;
        _getMatchesUseCase = getMatchesUseCase;
        _updateMatchStatusUseCase = updateMatchStatusUseCase;
    }

    /// <summary>
    /// Creates a new match invitation between an authenticated producer and a candidate professional.
    /// Returns 409 Conflict if a pending or active match already exists for this exact pair.
    /// </summary>
    /// <param name="request">Match creation payload containing candidate ProfessionalId.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Created match details.</returns>
    [HttpPost]
    [Authorize]
    [ProducesResponseType(typeof(MatchResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status409Conflict)]
    public async Task<IActionResult> CreateMatch(
        [FromBody] CreateMatchRequest request,
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

        MatchResponse response;

        if (request.ProducerId.HasValue && request.ProducerId.Value != Guid.Empty)
        {
            response = await _createMatchUseCase.ExecuteAsync(request, request.ProducerId.Value, auth0UserId, cancellationToken);
        }
        else
        {
            response = await _createMatchUseCase.ExecuteByAuth0UserIdAsync(request, auth0UserId, cancellationToken);
        }

        return CreatedAtAction(nameof(GetMatches), new { id = response.Id }, response);
    }

    /// <summary>
    /// Retrieves paginated matches associated with the authenticated user across tenant boundaries.
    /// </summary>
    /// <param name="filter">Optional filters for status and pagination parameters.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Paginated collection of matches.</returns>
    [HttpGet]
    [Authorize]
    [ProducesResponseType(typeof(PagedResult<MatchResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetMatches(
        [FromQuery] MatchFilterRequest filter,
        CancellationToken cancellationToken)
    {
        var auth0UserId = CurrentAuth0UserId;
        filter ??= new MatchFilterRequest();

        PagedResult<MatchResponse> result;

        if (!string.IsNullOrWhiteSpace(auth0UserId) && !filter.ProducerId.HasValue && !filter.ProfessionalId.HasValue)
        {
            result = await _getMatchesUseCase.ExecuteForUserAsync(auth0UserId, filter, cancellationToken);
        }
        else
        {
            result = await _getMatchesUseCase.ExecuteAsync(filter, auth0UserId, cancellationToken);
        }

        return Ok(result);
    }

    /// <summary>
    /// Updates the lifecycle status of an existing match (Accept, Reject, Cancel, Complete).
    /// Enforces cross-tenant ownership verification before applying the transition.
    /// </summary>
    /// <param name="id">The unique identifier of the Match.</param>
    /// <param name="request">New status to transition to.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Updated match details.</returns>
    [HttpPatch("{id:guid}/status")]
    [Authorize]
    [ProducesResponseType(typeof(MatchResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateStatus(
        [FromRoute] Guid id,
        [FromBody] UpdateMatchStatusRequest request,
        CancellationToken cancellationToken)
    {
        var auth0UserId = CurrentAuth0UserId;
        var response = await _updateMatchStatusUseCase.ExecuteAsync(id, request, auth0UserId, cancellationToken);
        return Ok(response);
    }
}
