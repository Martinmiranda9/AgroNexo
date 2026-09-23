using NetTopologySuite.Geometries;

namespace AgroConnect.Application.Common.Helpers;

/// <summary>
/// Geospatial helper for calculating real-world spherical distances (Haversine formula in kilometers).
/// </summary>
public static class GeoDistanceCalculator
{
    private const double EarthRadiusKm = 6371.0;

    /// <summary>
    /// Calculates the great-circle distance between two geographic coordinates in kilometers.
    /// </summary>
    /// <param name="lat1">Latitude of point 1 in degrees.</param>
    /// <param name="lon1">Longitude of point 1 in degrees.</param>
    /// <param name="lat2">Latitude of point 2 in degrees.</param>
    /// <param name="lon2">Longitude of point 2 in degrees.</param>
    /// <returns>Distance in kilometers.</returns>
    public static double CalculateDistanceKm(double lat1, double lon1, double lat2, double lon2)
    {
        if (Math.Abs(lat1 - lat2) < 1e-9 && Math.Abs(lon1 - lon2) < 1e-9)
            return 0.0;

        double dLat = ToRadians(lat2 - lat1);
        double dLon = ToRadians(lon2 - lon1);

        double radLat1 = ToRadians(lat1);
        double radLat2 = ToRadians(lat2);

        double a = Math.Sin(dLat / 2.0) * Math.Sin(dLat / 2.0) +
                   Math.Cos(radLat1) * Math.Cos(radLat2) *
                   Math.Sin(dLon / 2.0) * Math.Sin(dLon / 2.0);

        double c = 2.0 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1.0 - a));

        return EarthRadiusKm * c;
    }

    /// <summary>
    /// Calculates the distance in kilometers between a reference point and a NetTopologySuite geometry (Point or Centroid).
    /// </summary>
    public static double CalculateDistanceKm(Point referencePoint, Geometry? targetGeometry)
    {
        if (referencePoint == null || targetGeometry == null)
            return 0.0;

        Point targetPoint = targetGeometry is Point p ? p : targetGeometry.Centroid;
        // Point.Y is Latitude, Point.X is Longitude in standard SRID 4326 mapping
        return CalculateDistanceKm(referencePoint.Y, referencePoint.X, targetPoint.Y, targetPoint.X);
    }

    private static double ToRadians(double degrees) => degrees * Math.PI / 180.0;
}
