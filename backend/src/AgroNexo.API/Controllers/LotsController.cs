using AgroNexo.Application.Farms.DTOs;
using AgroNexo.Application.Farms.UseCases;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AgroNexo.API.Controllers;

/// <summary>
/// Lots of a farm and their crops per campaign. The whole team reads them; only the owner producer manages them. A farm
/// the caller cannot access answers 404.
/// </summary>
[Route("api/v1/farms/{farmId:guid}/lots")]
public class LotsController : ApiControllerBase
{
    private readonly IManageLotsUseCase _manageLotsUseCase;

    public LotsController(IManageLotsUseCase manageLotsUseCase)
    {
        _manageLotsUseCase = manageLotsUseCase;
    }

    /// <summary>Active lots of the farm with their crops of every campaign.</summary>
    [HttpGet]
    [Authorize(Policy = "Authenticated")]
    [ProducesResponseType(typeof(IReadOnlyList<LotResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetLots([FromRoute] Guid farmId, CancellationToken cancellationToken)
    {
        var firebaseUid = CurrentFirebaseUid;
        if (string.IsNullOrWhiteSpace(firebaseUid))
            return Unauthorized(BuildUnauthorizedProblem());

        return Ok(await _manageLotsUseCase.ListAsync(farmId, firebaseUid, cancellationToken));
    }

    /// <summary>
    /// Creates a lot. Returns 400 if the lots would add up to more hectares than the farm, 409 if the name is taken.
    /// </summary>
    [HttpPost]
    [Authorize(Policy = "IsProducer")]
    [ProducesResponseType(typeof(LotResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status409Conflict)]
    public async Task<IActionResult> CreateLot(
        [FromRoute] Guid farmId,
        [FromBody] LotRequest request,
        CancellationToken cancellationToken)
    {
        var firebaseUid = CurrentFirebaseUid;
        if (string.IsNullOrWhiteSpace(firebaseUid))
            return Unauthorized(BuildUnauthorizedProblem());

        var lot = await _manageLotsUseCase.CreateAsync(farmId, request, firebaseUid, cancellationToken);
        return CreatedAtAction(nameof(GetLots), new { farmId }, lot);
    }

    /// <summary>Updates the name or hectares of a lot.</summary>
    [HttpPut("{lotId:guid}")]
    [Authorize(Policy = "IsProducer")]
    [ProducesResponseType(typeof(LotResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status409Conflict)]
    public async Task<IActionResult> UpdateLot(
        [FromRoute] Guid farmId,
        [FromRoute] Guid lotId,
        [FromBody] LotRequest request,
        CancellationToken cancellationToken)
    {
        var firebaseUid = CurrentFirebaseUid;
        if (string.IsNullOrWhiteSpace(firebaseUid))
            return Unauthorized(BuildUnauthorizedProblem());

        return Ok(await _manageLotsUseCase.UpdateAsync(farmId, lotId, request, firebaseUid, cancellationToken));
    }

    /// <summary>Removes a lot (soft delete: its activities keep its name).</summary>
    [HttpDelete("{lotId:guid}")]
    [Authorize(Policy = "IsProducer")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteLot(
        [FromRoute] Guid farmId,
        [FromRoute] Guid lotId,
        CancellationToken cancellationToken)
    {
        var firebaseUid = CurrentFirebaseUid;
        if (string.IsNullOrWhiteSpace(firebaseUid))
            return Unauthorized(BuildUnauthorizedProblem());

        await _manageLotsUseCase.DeleteAsync(farmId, lotId, firebaseUid, cancellationToken);
        return NoContent();
    }

    /// <summary>Adds a crop to a lot for a campaign. Returns 409 if that crop is already in the lot for the campaign.</summary>
    [HttpPost("{lotId:guid}/crops")]
    [Authorize(Policy = "IsProducer")]
    [ProducesResponseType(typeof(LotResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status409Conflict)]
    public async Task<IActionResult> AddCrop(
        [FromRoute] Guid farmId,
        [FromRoute] Guid lotId,
        [FromBody] LotCropRequest request,
        CancellationToken cancellationToken)
    {
        var firebaseUid = CurrentFirebaseUid;
        if (string.IsNullOrWhiteSpace(firebaseUid))
            return Unauthorized(BuildUnauthorizedProblem());

        var lot = await _manageLotsUseCase.AddCropAsync(farmId, lotId, request, firebaseUid, cancellationToken);
        return CreatedAtAction(nameof(GetLots), new { farmId }, lot);
    }

    /// <summary>Removes a crop from a lot.</summary>
    [HttpDelete("{lotId:guid}/crops/{lotCropId:guid}")]
    [Authorize(Policy = "IsProducer")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> RemoveCrop(
        [FromRoute] Guid farmId,
        [FromRoute] Guid lotId,
        [FromRoute] Guid lotCropId,
        CancellationToken cancellationToken)
    {
        var firebaseUid = CurrentFirebaseUid;
        if (string.IsNullOrWhiteSpace(firebaseUid))
            return Unauthorized(BuildUnauthorizedProblem());

        await _manageLotsUseCase.RemoveCropAsync(farmId, lotId, lotCropId, firebaseUid, cancellationToken);
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
