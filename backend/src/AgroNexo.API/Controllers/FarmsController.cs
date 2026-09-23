using AgroNexo.Application.Farms.DTOs;
using AgroNexo.Application.Farms.UseCases;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AgroNexo.API.Controllers;

/// <summary>
/// Manages farm/lot registration, listing, update, and soft-deletion for authenticated producers.
/// Each farm stores a name, total hectares, an optional geographic polygon and a numeric PublicId.
/// </summary>
[Route("api/v1/farms")]
public class FarmsController : ApiControllerBase
{
    private readonly ICreateFarmUseCase _createFarmUseCase;
    private readonly IGetFarmsUseCase _getFarmsUseCase;
    private readonly IUpdateFarmUseCase _updateFarmUseCase;
    private readonly IDeleteFarmUseCase _deleteFarmUseCase;

    public FarmsController(
        ICreateFarmUseCase createFarmUseCase,
        IGetFarmsUseCase getFarmsUseCase,
        IUpdateFarmUseCase updateFarmUseCase,
        IDeleteFarmUseCase deleteFarmUseCase)
    {
        _createFarmUseCase = createFarmUseCase;
        _getFarmsUseCase   = getFarmsUseCase;
        _updateFarmUseCase = updateFarmUseCase;
        _deleteFarmUseCase = deleteFarmUseCase;
    }

    /// <summary>
    /// Creates a new farm/lot for the authenticated producer.
    /// The system automatically assigns a numeric PublicId with prefix 20 (e.g. 200001).
    /// </summary>
    [HttpPost]
    [Authorize(Policy = "IsProducer")]
    [ProducesResponseType(typeof(FarmResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> CreateFarm(
        [FromBody] CreateFarmRequest request,
        CancellationToken cancellationToken)
    {
        var auth0UserId = CurrentAuth0UserId;
        if (string.IsNullOrWhiteSpace(auth0UserId))
            return Unauthorized(BuildUnauthorizedProblem());

        var response = await _createFarmUseCase.ExecuteAsync(request, auth0UserId, cancellationToken);
        return CreatedAtAction(nameof(GetFarm), new { id = response.Id }, response);
    }

    /// <summary>
    /// Retrieves all active farms/lots belonging to the authenticated producer.
    /// </summary>
    [HttpGet]
    [Authorize(Policy = "IsProducer")]
    [ProducesResponseType(typeof(IReadOnlyList<FarmResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetMyFarms(CancellationToken cancellationToken)
    {
        var auth0UserId = CurrentAuth0UserId;
        if (string.IsNullOrWhiteSpace(auth0UserId))
            return Unauthorized(BuildUnauthorizedProblem());

        var farms = await _getFarmsUseCase.ExecuteAsync(auth0UserId, cancellationToken);
        return Ok(farms);
    }

    /// <summary>
    /// Retrieves the details of a specific farm/lot by its GUID.
    /// Only accessible by the owner producer.
    /// </summary>
    [HttpGet("{id:guid}")]
    [Authorize(Policy = "IsProducer")]
    [ProducesResponseType(typeof(FarmResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetFarm([FromRoute] Guid id, CancellationToken cancellationToken)
    {
        var auth0UserId = CurrentAuth0UserId;
        if (string.IsNullOrWhiteSpace(auth0UserId))
            return Unauthorized(BuildUnauthorizedProblem());

        var farm = await _getFarmsUseCase.GetByIdAsync(id, auth0UserId, cancellationToken);
        if (farm == null)
            return NotFound(new ProblemDetails
            {
                Status = StatusCodes.Status404NotFound,
                Title  = "Lote no encontrado",
                Detail = $"No se encontró el lote con identificador '{id}'.",
                Instance = HttpContext.Request.Path
            });

        return Ok(farm);
    }

    /// <summary>
    /// Updates the name, total hectares and coverage polygon of an existing farm/lot.
    /// Only accessible by the owner producer.
    /// </summary>
    [HttpPut("{id:guid}")]
    [Authorize(Policy = "IsProducer")]
    [ProducesResponseType(typeof(FarmResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateFarm(
        [FromRoute] Guid id,
        [FromBody] UpdateFarmRequest request,
        CancellationToken cancellationToken)
    {
        var auth0UserId = CurrentAuth0UserId;
        if (string.IsNullOrWhiteSpace(auth0UserId))
            return Unauthorized(BuildUnauthorizedProblem());

        var updated = await _updateFarmUseCase.ExecuteAsync(id, request, auth0UserId, cancellationToken);
        return Ok(updated);
    }

    /// <summary>
    /// Soft-deletes a farm/lot (sets IsActive = false). The record is preserved in the database.
    /// Only accessible by the owner producer.
    /// </summary>
    [HttpDelete("{id:guid}")]
    [Authorize(Policy = "IsProducer")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteFarm([FromRoute] Guid id, CancellationToken cancellationToken)
    {
        var auth0UserId = CurrentAuth0UserId;
        if (string.IsNullOrWhiteSpace(auth0UserId))
            return Unauthorized(BuildUnauthorizedProblem());

        await _deleteFarmUseCase.ExecuteAsync(id, auth0UserId, cancellationToken);
        return NoContent();
    }

    // -- Helpers ---------------------------------------------------------------

    private ProblemDetails BuildUnauthorizedProblem() => new()
    {
        Status   = StatusCodes.Status401Unauthorized,
        Title    = "No autorizado",
        Detail   = "No se pudo obtener el identificador de usuario del token.",
        Instance = HttpContext.Request.Path
    };
}
