using AgroNexo.Application.Common.Interfaces;
using AgroNexo.Domain.Entities;
using NetTopologySuite.Geometries;

namespace AgroNexo.Application.Farms.Services;

/// <summary>
/// Completa provincia, partido y localidad del campo a partir de su perímetro dibujado.
/// </summary>
public static class FarmPlaceResolver
{
    /// <summary>
    /// Busca el lugar de un punto que siempre cae adentro del perímetro (el centroide puede caer afuera en un campo con
    /// forma de L). Si el servicio no responde, el campo queda sin ubicación y se guarda igual.
    /// </summary>
    public static async Task ApplyAsync(Farm farm, IPlaceLookupService placeLookup, CancellationToken cancellationToken)
    {
        if (farm.Location is not Polygon perimeter)
            return;

        var point = perimeter.InteriorPoint;
        var place = await placeLookup.FindAsync(point.Y, point.X, cancellationToken);
        farm.SetPlace(place?.Province, place?.Department, place?.Locality);
    }
}
