using AgroNexo.Application.Farms.DTOs;
using AgroNexo.Application.Farms.UseCases;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AgroNexo.API.Controllers;

/// <summary>
/// Campaigns of a farm ("2026/27"). The whole team reads them; only the owner producer creates, edits or deletes them.
/// A farm the caller cannot access answers 404.
/// </summary>
[Route("api/v1/farms/{farmId:guid}/campaigns")]
public class CampaignsController : ApiControllerBase
{
    private readonly IManageCampaignsUseCase _manageCampaignsUseCase;

    public CampaignsController(IManageCampaignsUseCase manageCampaignsUseCase)
    {
        _manageCampaignsUseCase = manageCampaignsUseCase;
    }

    /// <summary>Campaigns of the farm, newest first.</summary>
    [HttpGet]
    [Authorize(Policy = "Authenticated")]
    [ProducesResponseType(typeof(IReadOnlyList<CampaignResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetCampaigns([FromRoute] Guid farmId, CancellationToken cancellationToken)
    {
        var firebaseUid = CurrentFirebaseUid;
        if (string.IsNullOrWhiteSpace(firebaseUid))
            return Unauthorized(BuildUnauthorizedProblem());

        return Ok(await _manageCampaignsUseCase.ListAsync(farmId, firebaseUid, cancellationToken));
    }

    /// <summary>Creates a campaign. Returns 409 if the farm already has one with the same name.</summary>
    [HttpPost]
    [Authorize(Policy = "IsProducer")]
    [ProducesResponseType(typeof(CampaignResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status409Conflict)]
    public async Task<IActionResult> CreateCampaign(
        [FromRoute] Guid farmId,
        [FromBody] CampaignRequest request,
        CancellationToken cancellationToken)
    {
        var firebaseUid = CurrentFirebaseUid;
        if (string.IsNullOrWhiteSpace(firebaseUid))
            return Unauthorized(BuildUnauthorizedProblem());

        var campaign = await _manageCampaignsUseCase.CreateAsync(farmId, request, firebaseUid, cancellationToken);
        return CreatedAtAction(nameof(GetCampaigns), new { farmId }, campaign);
    }

    /// <summary>Updates the name or dates of a campaign.</summary>
    [HttpPut("{campaignId:guid}")]
    [Authorize(Policy = "IsProducer")]
    [ProducesResponseType(typeof(CampaignResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status409Conflict)]
    public async Task<IActionResult> UpdateCampaign(
        [FromRoute] Guid farmId,
        [FromRoute] Guid campaignId,
        [FromBody] CampaignRequest request,
        CancellationToken cancellationToken)
    {
        var firebaseUid = CurrentFirebaseUid;
        if (string.IsNullOrWhiteSpace(firebaseUid))
            return Unauthorized(BuildUnauthorizedProblem());

        return Ok(await _manageCampaignsUseCase.UpdateAsync(farmId, campaignId, request, firebaseUid, cancellationToken));
    }

    /// <summary>Deletes an empty campaign. Returns 400 if it already has crops or activities.</summary>
    [HttpDelete("{campaignId:guid}")]
    [Authorize(Policy = "IsProducer")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteCampaign(
        [FromRoute] Guid farmId,
        [FromRoute] Guid campaignId,
        CancellationToken cancellationToken)
    {
        var firebaseUid = CurrentFirebaseUid;
        if (string.IsNullOrWhiteSpace(firebaseUid))
            return Unauthorized(BuildUnauthorizedProblem());

        await _manageCampaignsUseCase.DeleteAsync(farmId, campaignId, firebaseUid, cancellationToken);
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
