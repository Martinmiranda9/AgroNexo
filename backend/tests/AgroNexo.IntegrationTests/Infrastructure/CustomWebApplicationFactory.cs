using AgroNexo.API.Middlewares;
using AgroNexo.Domain.Entities;
using AgroNexo.Infrastructure.Data;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace AgroNexo.IntegrationTests.Infrastructure;

public class CustomWebApplicationFactory : WebApplicationFactory<Program>
{
    private readonly string _databaseName = "AgroNexoTestDb_" + Guid.NewGuid().ToString("N");

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Testing");

        builder.ConfigureServices(services =>
        {
            // 1. Remove existing DbContext registration
            var dbContextDescriptor = services.SingleOrDefault(
                d => d.ServiceType == typeof(DbContextOptions<AgroNexoDbContext>));
            if (dbContextDescriptor != null)
            {
                services.Remove(dbContextDescriptor);
            }

            var dbContextService = services.SingleOrDefault(
                d => d.ServiceType == typeof(AgroNexoDbContext));
            if (dbContextService != null)
            {
                services.Remove(dbContextService);
            }

            // 2. Register In-Memory DbContext for deterministic integration test execution
            services.AddDbContext<AgroNexoDbContext>((sp, options) =>
            {
                options.UseInMemoryDatabase(_databaseName);
                options.EnableSensitiveDataLogging();
            });

            // 3. Configure Test Authentication Scheme
            services.AddAuthentication(options =>
            {
                options.DefaultAuthenticateScheme = TestAuthHandler.SchemeName;
                options.DefaultChallengeScheme = TestAuthHandler.SchemeName;
            })
            .AddScheme<AuthenticationSchemeOptions, TestAuthHandler>(TestAuthHandler.SchemeName, options => { });
        });
    }

    public HttpClient CreateAuthenticatedClient(string auth0UserId, string role = "Producer", Guid? tenantId = null)
    {
        var client = CreateClient();
        client.DefaultRequestHeaders.Add(TestAuthHandler.HeaderUserId, auth0UserId);
        client.DefaultRequestHeaders.Add(TestAuthHandler.HeaderRole, role);
        client.DefaultRequestHeaders.Add("Authorization", $"Bearer {auth0UserId}");

        if (tenantId.HasValue && tenantId.Value != Guid.Empty)
        {
            client.DefaultRequestHeaders.Add(TestAuthHandler.HeaderTenantId, tenantId.Value.ToString());
            client.DefaultRequestHeaders.Add("X-Tenant-ID", tenantId.Value.ToString());
        }

        return client;
    }

    public async Task ResetDatabaseAsync()
    {
        using var scope = Services.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<AgroNexoDbContext>();
        
        context.Matches.RemoveRange(context.Matches);
        context.MatchRecommendations.RemoveRange(context.MatchRecommendations);
        context.MatchDiscoveryRequests.RemoveRange(context.MatchDiscoveryRequests);
        context.Farms.RemoveRange(context.Farms);
        context.Producers.RemoveRange(context.Producers);
        context.Professionals.RemoveRange(context.Professionals);
        context.Tenants.RemoveRange(context.Tenants);

        await context.SaveChangesAsync();
    }
}
