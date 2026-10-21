using System.Collections.Concurrent;
using AgroNexo.Application.Common.Interfaces;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.TestHost;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;

namespace AgroNexo.IntegrationTests.Infrastructure;

/// <summary>
/// La misma API de prueba, pero sin salir a Georef: la ubicación de los campos la responde <see cref="FakePlaceLookup"/>.
/// </summary>
public class FakePlaceLookupWebApplicationFactory : CustomWebApplicationFactory
{
    public FakePlaceLookup PlaceLookup { get; } = new();

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        base.ConfigureWebHost(builder);

        builder.ConfigureTestServices(services =>
        {
            services.RemoveAll<IPlaceLookupService>();
            services.AddSingleton<IPlaceLookupService>(PlaceLookup);
        });
    }
}

/// <summary>Responde siempre Pergamino, Buenos Aires, y guarda los puntos consultados.</summary>
public class FakePlaceLookup : IPlaceLookupService
{
    public static readonly PlaceInfo Pergamino = new("Buenos Aires", "Pergamino", "Pergamino");

    public ConcurrentQueue<(double Latitude, double Longitude)> Queries { get; } = new();

    public Task<PlaceInfo?> FindAsync(double latitude, double longitude, CancellationToken cancellationToken = default)
    {
        Queries.Enqueue((latitude, longitude));
        return Task.FromResult<PlaceInfo?>(Pergamino);
    }
}
