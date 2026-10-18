using AgroNexo.Application.Farms.DTOs;

namespace AgroNexo.Application.Farms.UseCases;

public interface IGetWorkspacesUseCase
{
    /// <summary>Productor: sus campos (también los archivados). Profesional: los campos donde está en el equipo.</summary>
    Task<IReadOnlyList<WorkspaceResponse>> ListAsync(string firebaseUid, CancellationToken cancellationToken = default);

    /// <summary>Un campo con su equipo y los contactos que corresponden a quien mira.</summary>
    Task<WorkspaceResponse> GetAsync(Guid farmId, string firebaseUid, CancellationToken cancellationToken = default);
}
