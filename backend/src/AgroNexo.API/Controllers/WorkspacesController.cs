using AgroNexo.Application.Farms.DTOs;
using AgroNexo.Application.Farms.UseCases;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AgroNexo.API.Controllers;

/// <summary>
/// Farms as shared workspaces, for both sides: the owner producer and the professionals in its team.
/// </summary>
[Route("api/v1/workspaces")]
public class WorkspacesController : ApiControllerBase
{
    private readonly IGetWorkspacesUseCase _getWorkspacesUseCase;

    public WorkspacesController(IGetWorkspacesUseCase getWorkspacesUseCase)
    {
        _getWorkspacesUseCase = getWorkspacesUseCase;
    }

    /// <summary>
    /// Producer: its farms, archived ones included. Professional: the farms whose team they belong to.
    /// </summary>
    [HttpGet]
    [Authorize]
    [ProducesResponseType(typeof(IReadOnlyList<WorkspaceResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetWorkspaces(CancellationToken cancellationToken)
    {
        var firebaseUid = CurrentFirebaseUid;
        if (string.IsNullOrWhiteSpace(firebaseUid))
            return Unauthorized(BuildUnauthorizedProblem());

        var workspaces = await _getWorkspacesUseCase.ListAsync(firebaseUid, cancellationToken);
        return Ok(workspaces);
    }

    /// <summary>
    /// One farm with its team and the contacts the caller is allowed to see. 404 when the caller has no access.
    /// </summary>
    [HttpGet("{farmId:guid}")]
    [Authorize]
    [ProducesResponseType(typeof(WorkspaceResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetWorkspace([FromRoute] Guid farmId, CancellationToken cancellationToken)
    {
        var firebaseUid = CurrentFirebaseUid;
        if (string.IsNullOrWhiteSpace(firebaseUid))
            return Unauthorized(BuildUnauthorizedProblem());

        var workspace = await _getWorkspacesUseCase.GetAsync(farmId, firebaseUid, cancellationToken);
        return Ok(workspace);
    }

    private ProblemDetails BuildUnauthorizedProblem() => new()
    {
        Status = StatusCodes.Status401Unauthorized,
        Title = "No autorizado",
        Detail = "No se pudo obtener el identificador de usuario del token.",
        Instance = HttpContext.Request.Path
    };
}
