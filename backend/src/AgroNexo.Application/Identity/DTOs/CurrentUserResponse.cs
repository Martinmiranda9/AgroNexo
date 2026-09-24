using AgroNexo.Domain.Enums;

namespace AgroNexo.Application.Identity.DTOs;

/// <summary>
/// Estado del usuario autenticado. Permite al frontend decidir si lo manda al registro
/// (primer ingreso con Google/Auth0) o directo a la aplicación.
/// </summary>
public class CurrentUserResponse
{
    /// <summary>true cuando ya existe un Producer o Professional asociado a la identidad de Auth0.</summary>
    public bool IsRegistered { get; set; }

    public UserType? UserType { get; set; }
    public long? PublicId { get; set; }
    public string? FirstName { get; set; }
}
