using System.ComponentModel.DataAnnotations;

namespace AgroConnect.Application.Matching.DTOs;

/// <summary>
/// Request DTO to initiate a geospatial discovery search for professional recommendations.
/// </summary>
public class CreateMatchDiscoveryRequest
{
    [Required(ErrorMessage = "La latitud del campo o ubicación de búsqueda es obligatoria.")]
    [Range(-90.0, 90.0, ErrorMessage = "La latitud debe estar entre -90.0 y 90.0 grados.")]
    public double Latitude { get; set; }

    [Required(ErrorMessage = "La longitud del campo o ubicación de búsqueda es obligatoria.")]
    [Range(-180.0, 180.0, ErrorMessage = "La longitud debe estar entre -180.0 y 180.0 grados.")]
    public double Longitude { get; set; }

    [StringLength(150, ErrorMessage = "La especialidad solicitada no puede superar los 150 caracteres.")]
    public string? RequestedSpecialty { get; set; }

    public bool RequiresFieldPresence { get; set; } = true;
}
