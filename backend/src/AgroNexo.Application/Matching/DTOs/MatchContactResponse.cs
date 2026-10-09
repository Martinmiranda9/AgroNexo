namespace AgroNexo.Application.Matching.DTOs;

/// <summary>
/// Datos de contacto de la contraparte. Solo se devuelven cuando el Match está activo y únicamente al profesional
/// invitado: antes de aceptar, el productor no comparte su teléfono ni su correo.
/// </summary>
public class MatchContactResponse
{
    public string PhoneNumber { get; set; } = string.Empty;
    public string? Email { get; set; }
}
