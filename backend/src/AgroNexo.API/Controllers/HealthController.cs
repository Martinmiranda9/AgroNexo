using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AgroNexo.API.Controllers;

/// <summary>
/// Health check endpoint for container orchestrators and monitoring probes.
/// </summary>
[ApiController]
public class HealthController : ControllerBase
{
    /// <summary>
    /// Returns the health status and current server timestamp.
    /// </summary>
    [HttpGet("health")]
    [HttpGet("api/v1/health")]
    [AllowAnonymous]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public IActionResult GetHealth()
    {
        return Ok(new
        {
            status = "Healthy",
            timestamp = DateTime.UtcNow
        });
    }
}
