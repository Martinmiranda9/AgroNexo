using System.Security.Claims;
using AgroNexo.API.Services;
using AgroNexo.Domain.Interfaces;

namespace AgroNexo.API.Middlewares;

/// <summary>
/// Middleware that resolves the current tenant workspace, user identity, and role metadata
/// from JWT claims, request headers, or database lookups, populating ITenantContext and ICurrentUserService.
/// </summary>
public class TenantMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<TenantMiddleware> _logger;

    public TenantMiddleware(RequestDelegate next, ILogger<TenantMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(
        HttpContext context,
        TenantContext tenantContext,
        CurrentUserService currentUserService,
        IProducerRepository producerRepository,
        IProfessionalRepository professionalRepository)
    {
        var user = context.User;

        if (user.Identity?.IsAuthenticated == true)
        {
            var auth0UserId = user.FindFirst(ClaimTypes.NameIdentifier)?.Value
                ?? user.FindFirst("sub")?.Value;

            var email = user.FindFirst(ClaimTypes.Email)?.Value
                ?? user.FindFirst("email")?.Value;

            var role = user.FindFirst(ClaimTypes.Role)?.Value
                ?? user.FindFirst("role")?.Value
                ?? user.FindFirst("user_type")?.Value
                ?? user.FindFirst("https://agroconnect.com/user_type")?.Value
                ?? user.FindFirst("https://agroconnect.com/roles")?.Value;

            var path = context.Request.Path.Value ?? string.Empty;
            bool isRegistration = path.StartsWith("/api/v1/identity/register", StringComparison.OrdinalIgnoreCase);

            var tenantClaim = user.FindFirst("tenant_id")?.Value
                ?? user.FindFirst("https://agroconnect.com/tenant_id")?.Value;

            Guid tenantId = Guid.Empty;
            bool hasTenant = !string.IsNullOrWhiteSpace(tenantClaim) && Guid.TryParse(tenantClaim, out tenantId);

            if (!hasTenant && !string.IsNullOrWhiteSpace(auth0UserId))
            {
                var producer = await producerRepository.GetByAuth0UserIdAsync(auth0UserId);
                if (producer != null)
                {
                    tenantId = producer.TenantId;
                    hasTenant = true;
                }
                else
                {
                    var professional = await professionalRepository.GetByAuth0UserIdAsync(auth0UserId);
                    if (professional != null)
                    {
                        tenantId = professional.TenantId;
                        hasTenant = true;
                    }
                }
            }

            if (!hasTenant && !isRegistration)
            {
                context.Response.StatusCode = StatusCodes.Status401Unauthorized;
                await context.Response.WriteAsJsonAsync(new { error = "tenant_claim_missing" });
                return;
            }

            if (hasTenant)
            {
                tenantContext.SetContext(tenantId, auth0UserId, role);
                currentUserService.SetUser(auth0UserId, email, tenantId, role);
                _logger.LogDebug("Resolved Tenant: {TenantId}, User: {Auth0UserId}, Role: {Role}", tenantId, auth0UserId, role);
            }
            else
            {
                currentUserService.SetUser(auth0UserId, email, null, role);
            }
        }

        await _next(context);
    }
}
