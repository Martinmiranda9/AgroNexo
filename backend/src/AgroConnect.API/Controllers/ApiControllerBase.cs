using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;

namespace AgroConnect.API.Controllers;

/// <summary>
/// Base API Controller providing common routing attributes and authenticated user metadata helpers.
/// </summary>
[ApiController]
[Route("api/v1/[controller]")]
[Produces("application/json")]
public abstract class ApiControllerBase : ControllerBase
{
    /// <summary>
    /// Gets the Auth0 User ID ('sub' claim) from the authenticated principal.
    /// </summary>
    protected string? CurrentAuth0UserId =>
        User.FindFirst(ClaimTypes.NameIdentifier)?.Value
        ?? User.FindFirst("sub")?.Value;

    /// <summary>
    /// Gets the user role or user type claim from the authenticated principal.
    /// </summary>
    protected string? CurrentUserRole =>
        User.FindFirst(ClaimTypes.Role)?.Value
        ?? User.FindFirst("role")?.Value
        ?? User.FindFirst("user_type")?.Value
        ?? User.FindFirst("https://agroconnect.com/user_type")?.Value
        ?? User.FindFirst("https://agroconnect.com/roles")?.Value;
}
