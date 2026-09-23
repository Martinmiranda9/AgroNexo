using AgroConnect.Domain.Interfaces;
using AgroConnect.Infrastructure.Data;
using AgroConnect.Infrastructure.Repositories;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace AgroConnect.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("DefaultConnection")
            ?? configuration.GetConnectionString("PostgreSql")
            ?? configuration.GetConnectionString("AgroConnectDb")
            ?? configuration["Database:ConnectionString"];

        services.AddDbContext<AgroConnectDbContext>((serviceProvider, options) =>
        {
            if (!string.IsNullOrEmpty(connectionString))
            {
                options.UseNpgsql(connectionString, npgsqlOptions =>
                {
                    npgsqlOptions.UseNetTopologySuite();
                    npgsqlOptions.MigrationsAssembly(typeof(AgroConnectDbContext).Assembly.FullName);
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
