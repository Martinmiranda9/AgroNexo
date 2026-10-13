namespace AgroNexo.Application.Farms.DTOs;

/// <summary>
/// Datos de contacto de alguien del campo. Solo se devuelven a quien ya tiene un match aceptado con esa persona: el
/// productor ve el de cada profesional del equipo y cada profesional ve el del productor.
/// </summary>
public class FarmContactResponse
{
    public string PhoneNumber { get; set; } = string.Empty;
    public string? Email { get; set; }
}
