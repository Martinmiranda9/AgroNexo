using AgroNexo.Application.Common.Models;
using AgroNexo.Application.Farms.DTOs;
using AgroNexo.Application.Farms.UseCases;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AgroNexo.API.Controllers;

/// <summary>
/// Activities of a farm (sowing, spraying, visits…) with date and status. The whole team reads and records them; only the
/// owner producer or the author changes or deletes one. A farm the caller cannot access answers 404.
/// </summary>
[Route("api/v1/farms/{farmId:guid}/activities")]
public class FarmActivitiesController : ApiControllerBase
{
    private readonly IManageFarmActivitiesUseCase _manageFarmActivitiesUseCase;

    public FarmActivitiesController(IManageFarmActivitiesUseCase manageFarmActivitiesUseCase)
    {
        _manageFarmActivitiesUseCase = manageFarmActivitiesUseCase;
    }

    /// <summary>Paginated activities, newest first, optionally by campaign, lot or status.</summary>
    [HttpGet]
    [Authorize(Policy = "Authenticated")]
    [ProducesResponseType(typeof(PagedResult<FarmActivityResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetActivities(
        [FromRoute] Guid farmId,
        [FromQuery] FarmActivityFilterRequest filter,
        CancellationToken cancellationToken)
    {
        var firebaseUid = CurrentFirebaseUid;
        if (string.IsNullOrWhiteSpace(firebaseUid))
            return Unauthorized(BuildUnauthorizedProblem());

        return Ok(await _manageFarmActivitiesUseCase.ListAsync(farmId, filter, firebaseUid, cancellationToken));
    }

    /// <summary>Records an activity. Without a campaign, it takes the one that contains its date.</summary>
    [HttpPost]
    [Authorize(Policy = "Authenticated")]
    [ProducesResponseType(typeof(FarmActivityResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> CreateActivity(
        [FromRoute] Guid farmId,
        [FromBody] FarmActivityRequest request,
        CancellationToken cancellationToken)
    {
        var firebaseUid = CurrentFirebaseUid;
        if (string.IsNullOrWhiteSpace(firebaseUid))
            return Unauthorized(BuildUnauthorizedProblem());

        var activity = await _manageFarmActivitiesUseCase.CreateAsync(farmId, request, firebaseUid, cancellationToken);
        return CreatedAtAction(nameof(GetActivities), new { farmId }, activity);
    }

    /// <summary>Changes the status. Returns 403 if the caller is neither the owner nor the author.</summary>
    [HttpPatch("{activityId:guid}/status")]
    [Authorize(Policy = "Authenticated")]
    [ProducesResponseType(typeof(FarmActivityResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateActivityStatus(
        [FromRoute] Guid farmId,
        [FromRoute] Guid activityId,
        [FromBody] UpdateFarmActivityStatusRequest request,
        CancellationToken cancellationToken)
    {
        var firebaseUid = CurrentFirebaseUid;
        if (string.IsNullOrWhiteSpace(firebaseUid))
            return Unauthorized(BuildUnauthorizedProblem());

        return Ok(await _manageFarmActivitiesUseCase.UpdateStatusAsync(farmId, activityId, request, firebaseUid, cancellationToken));
    }

    /// <summary>Deletes an activity. Returns 403 if the caller is neither the owner nor the author.</summary>
    [HttpDelete("{activityId:guid}")]
    [Authorize(Policy = "Authenticated")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteActivity(
        [FromRoute] Guid farmId,
        [FromRoute] Guid activityId,
        CancellationToken cancellationToken)
    {
        var firebaseUid = CurrentFirebaseUid;
        if (string.IsNullOrWhiteSpace(firebaseUid))
            return Unauthorized(BuildUnauthorizedProblem());

        await _manageFarmActivitiesUseCase.DeleteAsync(farmId, activityId, firebaseUid, cancellationToken);
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
