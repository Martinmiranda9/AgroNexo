using AgroNexo.Application.Common.DTOs;
using AgroNexo.Domain.Exceptions;
using NetTopologySuite;
using NetTopologySuite.Geometries;

namespace AgroNexo.Application.Common.Helpers;

/// <summary>
/// Helper utilities for converting between DTO coordinates and NetTopologySuite Geometry objects (SRID 4326).
/// </summary>
public static class GeometryHelper
{
    public const int DefaultSrid = 4326;
    private static readonly GeometryFactory Factory = NtsGeometryServices.Instance.CreateGeometryFactory(DefaultSrid);

    /// <summary>
    /// Converts latitude and longitude values to a NetTopologySuite Point.
    /// </summary>
    public static Point CreatePoint(double latitude, double longitude)
    {
        return Factory.CreatePoint(new NetTopologySuite.Geometries.Coordinate(longitude, latitude));
    }

    /// <summary>
    /// Converts a list of CoordinateDto points to a NetTopologySuite Polygon.
    /// </summary>
    public static Polygon? CreatePolygon(IReadOnlyList<CoordinateDto>? coordinates)
    {
        if (coordinates == null || coordinates.Count == 0)
            return null;

        if (coordinates.Count < 3)
            throw new DomainValidationException(nameof(coordinates), "Un polígono debe contener al menos 3 vértices.");

        var ntsCoordinates = new List<NetTopologySuite.Geometries.Coordinate>(coordinates.Count + 1);
        foreach (var coord in coordinates)
        {
            ntsCoordinates.Add(new NetTopologySuite.Geometries.Coordinate(coord.Longitude, coord.Latitude));
        }

        // Ensure the polygon ring is closed (first and last points must match)
        var first = ntsCoordinates[0];
        var last = ntsCoordinates[ntsCoordinates.Count - 1];
        if (Math.Abs(first.X - last.X) > 1e-7 || Math.Abs(first.Y - last.Y) > 1e-7)
        {
            ntsCoordinates.Add(new NetTopologySuite.Geometries.Coordinate(first.X, first.Y));
        }

        if (ntsCoordinates.Count < 4)
            throw new DomainValidationException(nameof(coordinates), "Un polígono cerrado debe contener al menos 4 puntos (incluyendo el de cierre).");

        var linearRing = Factory.CreateLinearRing(ntsCoordinates.ToArray());
        return Factory.CreatePolygon(linearRing);
    }

    /// <summary>
    /// Converts a NetTopologySuite Geometry into a list of CoordinateDto.
    /// </summary>
    public static List<CoordinateDto> ToCoordinateDtos(Geometry? geometry)
    {
        if (geometry == null)
            return new List<CoordinateDto>();

        var result = new List<CoordinateDto>();
        foreach (var c in geometry.Coordinates)
        {
            result.Add(new CoordinateDto(c.Y, c.X));
        }

        return result;
    }
}
