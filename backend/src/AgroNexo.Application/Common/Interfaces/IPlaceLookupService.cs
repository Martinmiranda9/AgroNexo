namespace AgroNexo.Application.Common.Interfaces;

/// <summary>
/// Georreferencia inversa: de un punto del mapa a provincia, partido y localidad.
/// </summary>
public interface IPlaceLookupService
{
    /// <summary>Lugar del punto, o <c>null</c> si no se encontró o el servicio no respondió a tiempo.</summary>
    Task<PlaceInfo?> FindAsync(double latitude, double longitude, CancellationToken cancellationToken = default);
}

/// <param name="Province">Provincia, por ejemplo "Buenos Aires".</param>
/// <param name="Department">Partido o departamento, por ejemplo "Pergamino".</param>
/// <param name="Locality">Localidad o gobierno local.</param>
public sealed record PlaceInfo(string? Province, string? Department, string? Locality);
