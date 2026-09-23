using System.ComponentModel.DataAnnotations;

namespace AgroConnect.Application.Common.DTOs;

/// <summary>
/// Data transfer object for geographic coordinates (Latitude, Longitude in WGS84 - SRID 4326).
/// </summary>
public class CoordinateDto
{
    [Required(ErrorMessage = "La latitud es obligatoria.")]
    [Range(-90.0, 90.0, ErrorMessage = "La latitud debe estar comprendida entre -90.0 y 90.0 grados.")]
    public double Latitude { get; set; }

    [Required(ErrorMessage = "La longitud es obligatoria.")]
    [Range(-180.0, 180.0, ErrorMessage = "La longitud debe estar comprendida entre -180.0 y 180.0 grados.")]
    public double Longitude { get; set; }

    public CoordinateDto()
    {
    }

    public CoordinateDto(double latitude, double longitude)
    {
        Latitude = latitude;
        Longitude = longitude;
    }
}
