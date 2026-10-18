using AgroNexo.Application.Farms.DTOs;
using AgroNexo.Application.Farms.UseCases;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AgroNexo.API.Controllers;

/// <summary>
/// Shared dashboard of a farm: the same view for the owner producer and every professional in its team. A farm the
/// caller cannot access answers 404.
/// </summary>
[Route("api/v1/farms/{farmId:guid}/dashboard")]
public class FarmDashboardController : ApiControllerBase
{
    private readonly IGetFarmDashboardUseCase _getFarmDashboardUseCase;

    public FarmDashboardController(IGetFarmDashboardUseCase getFarmDashboardUseCase)
    {
        _getFarmDashboardUseCase = getFarmDashboardUseCase;
    }

    /// <summary>
    /// Workspace, campaign KPIs, surface by crop, lots, campaign timeline, recent activity and weekly summary. Without
    /// <c>campaignId</c> it shows the campaign that contains today, or the most recent one.
    /// </summary>
    [HttpGet]
    [Authorize(Policy = "Authenticated")]
    [ProducesResponseType(typeof(FarmDashboardResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetDashboard(
        [FromRoute] Guid farmId,
        [FromQuery] Guid? campaignId,
        CancellationToken cancellationToken)
    {
        var firebaseUid = CurrentFirebaseUid;
        if (string.IsNullOrWhiteSpace(firebaseUid))
            return Unauthorized(BuildUnauthorizedProblem());

        var dashboard = await _getFarmDashboardUseCase.GetAsync(farmId, campaignId, firebaseUid, cancellationToken);
        return Ok(dashboard);
    }

    private ProblemDetails BuildUnauthorizedProblem() => new()
    {
        Status = StatusCodes.Status401Unauthorized,
        Title = "No autorizado",
        Detail = "No se pudo obtener el identificador de usuario del token.",
        Instance = HttpContext.Request.Path
    };
}
