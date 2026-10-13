using AgroNexo.Application.Farms.DTOs;
using AgroNexo.Application.Farms.UseCases;
using AgroNexo.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AgroNexo.API.Controllers;

/// <summary>
/// Team of a farm. The owner producer invites professionals with an accepted match and can remove them; a professional
/// can leave. A farm the caller cannot access answers 404, never 403, so its existence is not revealed.
/// </summary>
[Route("api/v1/farms/{farmId:guid}")]
public class FarmMembersController : ApiControllerBase
{
    private readonly IGetFarmCandidatesUseCase _getFarmCandidatesUseCase;
    private readonly IManageFarmMembersUseCase _manageFarmMembersUseCase;

    public FarmMembersController(
        IGetFarmCandidatesUseCase getFarmCandidatesUseCase,
        IManageFarmMembersUseCase manageFarmMembersUseCase)
    {
        _getFarmCandidatesUseCase = getFarmCandidatesUseCase;
        _manageFarmMembersUseCase = manageFarmMembersUseCase;
    }

    /// <summary>
    /// Professionals the producer can add to the farm: accepted matches not yet in its team, optionally by role.
    /// </summary>
    [HttpGet("candidates")]
    [Authorize(Policy = "IsProducer")]
    [ProducesResponseType(typeof(IReadOnlyList<FarmCandidateResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetCandidates(
        [FromRoute] Guid farmId,
        [FromQuery] ProfessionalRole? role,
        CancellationToken cancellationToken)
    {
        var auth0UserId = CurrentAuth0UserId;
        if (string.IsNullOrWhiteSpace(auth0UserId))
            return Unauthorized(BuildUnauthorizedProblem());

        var candidates = await _getFarmCandidatesUseCase.ExecuteAsync(farmId, role, auth0UserId, cancellationToken);
        return Ok(candidates);
    }

    /// <summary>
    /// Adds a professional to the farm team. Requires an accepted match between the producer and the professional.
    /// Returns 409 if the professional is already in the team.
    /// </summary>
    [HttpPost("members")]
    [Authorize(Policy = "IsProducer")]
    [ProducesResponseType(typeof(FarmMemberResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status409Conflict)]
    public async Task<IActionResult> AddMember(
        [FromRoute] Guid farmId,
        [FromBody] AddFarmMemberRequest request,
        CancellationToken cancellationToken)
    {
        var auth0UserId = CurrentAuth0UserId;
        if (string.IsNullOrWhiteSpace(auth0UserId))
            return Unauthorized(BuildUnauthorizedProblem());

        var member = await _manageFarmMembersUseCase.AddAsync(farmId, request, auth0UserId, cancellationToken);
        return CreatedAtAction(
            nameof(WorkspacesController.GetWorkspace),
            "Workspaces",
            new { farmId },
            member);
    }

    /// <summary>
    /// The owner producer removes a professional from the farm team.
    /// </summary>
    [HttpDelete("members/{memberId:guid}")]
    [Authorize(Policy = "IsProducer")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> RemoveMember(
        [FromRoute] Guid farmId,
        [FromRoute] Guid memberId,
        CancellationToken cancellationToken)
    {
        var auth0UserId = CurrentAuth0UserId;
        if (string.IsNullOrWhiteSpace(auth0UserId))
            return Unauthorized(BuildUnauthorizedProblem());

        await _manageFarmMembersUseCase.RemoveAsync(farmId, memberId, auth0UserId, cancellationToken);
        return NoContent();
    }

    /// <summary>
    /// The calling professional leaves the farm team.
    /// </summary>
    [HttpDelete("members/me")]
    [Authorize(Policy = "IsProfessional")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> LeaveFarm([FromRoute] Guid farmId, CancellationToken cancellationToken)
    {
        var auth0UserId = CurrentAuth0UserId;
        if (string.IsNullOrWhiteSpace(auth0UserId))
            return Unauthorized(BuildUnauthorizedProblem());

        await _manageFarmMembersUseCase.LeaveAsync(farmId, auth0UserId, cancellationToken);
        return NoContent();
    }

    private ProblemDetails BuildUnauthorizedProblem() => new()
    {
        Status = StatusCodes.Status401Unauthorized,
        Title = "No autorizado",
        Detail = "No se pudo obtener el identificador de usuario del token.",
        Instance = HttpContext.Request.Path
    };
}
