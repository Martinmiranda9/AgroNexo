using AgroNexo.Application.Farms.DTOs;
using AgroNexo.Domain.Entities;

namespace AgroNexo.Application.Farms.Services;

/// <summary>
/// Arma las respuestas de actividades con el nombre del lote, quién la registró y si quien mira la puede editar.
/// </summary>
public interface IFarmActivityResponseFactory
{
    Task<List<FarmActivityResponse>> BuildAsync(
        IReadOnlyCollection<FarmActivity> activities,
        FarmAccess access,
        CancellationToken cancellationToken = default);
}
