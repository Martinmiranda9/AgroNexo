using System.Security.Claims;
using System.Text.Encodings.Web;
using Microsoft.AspNetCore.Authentication;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace AgroConnect.IntegrationTests.Infrastructure;

public class TestAuthHandler : AuthenticationHandler<AuthenticationSchemeOptions>
{
    public const string SchemeName = "TestScheme";
    public const string HeaderUserId = "X-Test-UserId";
    public const string HeaderRole = "X-Test-Role";
    public const string HeaderTenantId = "X-Test-TenantId";
    public const string HeaderEmail = "X-Test-Email";

    public TestAuthHandler(
        IOptionsMonitor<AuthenticationSchemeOptions> options,
        ILoggerFactory logger,
        UrlEncoder encoder)
        : base(options, logger, encoder)
    {
    }

    protected override Task<AuthenticateResult> HandleAuthenticateAsync()
    {
        // 1. Check for explicit test authentication headers
        string? userId = null;
        string? role = null;
        string? tenantId = null;
        string? email = null;

        if (Request.Headers.TryGetValue(HeaderUserId, out var userIdHeader))
        {
            userId = userIdHeader.FirstOrDefault();
        }
        else if (Request.Headers.TryGetValue("Authorization", out var authHeader))
        {
            var headerValue = authHeader.FirstOrDefault();
            if (!string.IsNullOrWhiteSpace(headerValue) && headerValue.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
            {
                var token = headerValue.Substring("Bearer ".Length).Trim();
                if (!string.IsNullOrWhiteSpace(token) && token != "invalid" && token != "null")
                {
                    userId = token;
                }
            }
        }

        if (string.IsNullOrWhiteSpace(userId))
        {
            return Task.FromResult(AuthenticateResult.NoResult());
        }

        if (Request.Headers.TryGetValue(HeaderRole, out var roleHeader))
        {
            role = roleHeader.FirstOrDefault();
        }

        if (Request.Headers.TryGetValue(HeaderTenantId, out var tenantHeader))
        {
            tenantId = tenantHeader.FirstOrDefault();
        }

        string resolvedEmail = !string.IsNullOrWhiteSpace(email) ? email : $"{userId.Replace("|", "_")}@agroconnect.test";

        role ??= "Producer";

        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, userId),
            new("sub", userId),
            new("user_type", role),
            new(ClaimTypes.Role, role),
            new("role", role),
            new("https://agroconnect.com/user_type", role),
            new("https://agroconnect.com/roles", role),
            new(ClaimTypes.Email, resolvedEmail),
            new("email", resolvedEmail)
        };

        if (!string.IsNullOrWhiteSpace(tenantId))
        {
            claims.Add(new Claim("tenant_id", tenantId));
            claims.Add(new Claim("https://agroconnect.com/tenant_id", tenantId));
        }

        var identity = new ClaimsIdentity(claims, SchemeName);
        var principal = new ClaimsPrincipal(identity);
        var ticket = new AuthenticationTicket(principal, SchemeName);

        return Task.FromResult(AuthenticateResult.Success(ticket));
    }
}
