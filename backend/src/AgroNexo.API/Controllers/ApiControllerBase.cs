using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;

namespace AgroNexo.API.Controllers;

/// <summary>
/// Base API Controller providing common routing attributes and authenticated user metadata helpers.
/// </summary>
[ApiController]
[Route("api/v1/[controller]")]
[Produces("application/json")]
public abstract class ApiControllerBase : ControllerBase
{
    /// <summary>
    /// Gets the external identity provider's user id ('sub' claim, now issued by Firebase) from the
    /// authenticated principal. Property name kept as-is: it's what every repository/use case matches
    /// against the `Auth0UserId` column, and renaming it would be a mechanical, unrelated refactor.
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
