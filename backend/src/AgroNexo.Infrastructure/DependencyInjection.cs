using AgroNexo.Domain.Interfaces;
using AgroNexo.Infrastructure.Data;
using AgroNexo.Infrastructure.Repositories;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace AgroNexo.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("DefaultConnection")
            ?? configuration.GetConnectionString("PostgreSql")
            ?? configuration.GetConnectionString("AgroNexoDb")
            ?? configuration["Database:ConnectionString"];

        services.AddDbContext<AgroNexoDbContext>((serviceProvider, options) =>
        {
            if (!string.IsNullOrEmpty(connectionString))
            {
                options.UseNpgsql(connectionString, npgsqlOptions =>
                {
                    npgsqlOptions.UseNetTopologySuite();
                    npgsqlOptions.MigrationsAssembly(typeof(AgroNexoDbContext).Assembly.FullName);
                });
            }
        });

        // Register Repositories
        services.AddScoped<ITenantRepository, TenantRepository>();
        services.AddScoped<IProducerRepository, ProducerRepository>();
        services.AddScoped<IProfessionalRepository, ProfessionalRepository>();
        services.AddScoped<IMatchRepository, MatchRepository>();
        services.AddScoped<IMatchDiscoveryRepository, MatchDiscoveryRepository>();
        services.AddScoped<IFarmRepository, FarmRepository>();

        // Register Unit of Work
        services.AddScoped<IUnitOfWork, UnitOfWork>();

        return services;
    }
}
