using AgroConnect.Domain.Exceptions;
using NetTopologySuite.Geometries;

namespace AgroConnect.Domain.ValueObjects;

/// <summary>
/// Value Object representing a Geographic Coordinate (Latitude and Longitude in WGS84 - SRID 4326).
/// </summary>
public sealed class Coordinate : IEquatable<Coordinate>
{
    public const int DefaultSrid = 4326;

    public double Latitude { get; }
    public double Longitude { get; }

    public Coordinate(double latitude, double longitude)
    {
        if (latitude < -90.0 || latitude > 90.0)
            throw new DomainValidationException(nameof(Latitude), "La latitud debe estar entre -90.0 y 90.0 grados.");

        if (longitude < -180.0 || longitude > 180.0)
            throw new DomainValidationException(nameof(Longitude), "La longitud debe estar entre -180.0 y 180.0 grados.");

        Latitude = latitude;
        Longitude = longitude;
    }

    /// <summary>
    /// Creates a NetTopologySuite Point geometry (X=Longitude, Y=Latitude, SRID=4326).
    /// </summary>
    public Point ToPoint()
    {
        var geometryFactory = NetTopologySuite.NtsGeometryServices.Instance.CreateGeometryFactory(DefaultSrid);
        return geometryFactory.CreatePoint(new NetTopologySuite.Geometries.Coordinate(Longitude, Latitude));
    }

    /// <summary>
    /// Creates a Coordinate instance from a NetTopologySuite Point geometry.
    /// </summary>
    public static Coordinate FromPoint(Point point)
    {
        if (point == null)
            throw new ArgumentNullException(nameof(point));

        return new Coordinate(point.Y, point.X);
    }

    public override bool Equals(object? obj) => obj is Coordinate other && Equals(other);

    public bool Equals(Coordinate? other)
    {
        if (other is null) return false;
        if (ReferenceEquals(this, other)) return true;
        return Math.Abs(Latitude - other.Latitude) < 0.000001 && Math.Abs(Longitude - other.Longitude) < 0.000001;
    }

    public override int GetHashCode() => HashCode.Combine(Latitude, Longitude);

    public override string ToString() => $"({Latitude:F6}, {Longitude:F6})";
}
