using System.Globalization;
using System.Net.Http.Json;
using System.Text.Json.Serialization;
using AgroNexo.Application.Common.Interfaces;
using Microsoft.Extensions.Logging;

namespace AgroNexo.Infrastructure.Services;

/// <summary>
/// Georreferencia inversa con la API Georef del Estado argentino (datos.gob.ar), gratuita y sin clave:
/// <c>GET /ubicacion?lat=&amp;lon=&amp;aplanar=true</c>. Cualquier falla devuelve <c>null</c>: el campo se guarda igual.
/// </summary>
public class GeorefPlaceLookupService : IPlaceLookupService
{
    public const string DefaultBaseUrl = "https://apis.datos.gob.ar/georef/api/v2.0/";

    private readonly HttpClient _httpClient;
    private readonly ILogger<GeorefPlaceLookupService> _logger;

    public GeorefPlaceLookupService(HttpClient httpClient, ILogger<GeorefPlaceLookupService> logger)
    {
        _httpClient = httpClient;
        _logger = logger;
    }

    public async Task<PlaceInfo?> FindAsync(double latitude, double longitude, CancellationToken cancellationToken = default)
    {
        var lat = latitude.ToString("0.00000", CultureInfo.InvariantCulture);
        var lon = longitude.ToString("0.00000", CultureInfo.InvariantCulture);

        try
        {
            var response = await _httpClient.GetFromJsonAsync<GeorefLocationResponse>(
                $"ubicacion?lat={lat}&lon={lon}&aplanar=true", cancellationToken);

            var location = response?.Location;
            if (location?.ProvinceName == null)
                return null;

            return new PlaceInfo(
                location.ProvinceName,
                location.DepartmentName,
                location.LocalGovernmentName ?? location.DepartmentName);
        }
        catch (Exception ex) when (ex is HttpRequestException or TaskCanceledException or System.Text.Json.JsonException)
        {
            _logger.LogWarning(ex, "Georef no respondió para ({Lat}, {Lon}); el campo queda sin ubicación.", lat, lon);
            return null;
        }
    }

    private sealed class GeorefLocationResponse
    {
        [JsonPropertyName("ubicacion")]
        public GeorefLocation? Location { get; set; }
    }

    private sealed class GeorefLocation
    {
        [JsonPropertyName("provincia_nombre")]
        public string? ProvinceName { get; set; }

        [JsonPropertyName("departamento_nombre")]
        public string? DepartmentName { get; set; }

        [JsonPropertyName("gobierno_local_nombre")]
        public string? LocalGovernmentName { get; set; }
    }
}
