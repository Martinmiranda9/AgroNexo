namespace AgroNexo.Application.Farms.Services;

/// <summary>
/// Punto único de autorización de los campos compartidos. Sin acceso, responde 404 (no 403) para no revelar que el
/// campo existe.
/// </summary>
public interface IFarmAccessService
{
    /// <summary>Dueño o profesional activo del equipo.</summary>
    Task<FarmAccess> GetAccessAsync(Guid farmId, string firebaseUid, CancellationToken cancellationToken = default);

    /// <summary>Solo el productor dueño.</summary>
    Task<FarmAccess> GetOwnerAccessAsync(Guid farmId, string firebaseUid, CancellationToken cancellationToken = default);

    /// <summary>Solo un profesional activo del equipo.</summary>
    Task<FarmAccess> GetMemberAccessAsync(Guid farmId, string firebaseUid, CancellationToken cancellationToken = default);
}
