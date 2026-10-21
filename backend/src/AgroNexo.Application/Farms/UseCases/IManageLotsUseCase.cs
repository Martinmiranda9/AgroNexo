using AgroNexo.Application.Farms.DTOs;

namespace AgroNexo.Application.Farms.UseCases;

public interface IManageLotsUseCase
{
    /// <summary>Lotes del campo con sus cultivos, para el dueño o un profesional del equipo.</summary>
    Task<IReadOnlyList<LotResponse>> ListAsync(Guid farmId, string firebaseUid, CancellationToken cancellationToken = default);

    /// <summary>El productor dueño o el agrónomo del equipo crean un lote, dibujado en el mapa o con sus hectáreas.</summary>
    Task<LotResponse> CreateAsync(Guid farmId, LotRequest request, string firebaseUid, CancellationToken cancellationToken = default);

    /// <summary>El productor dueño o el agrónomo del equipo corrigen el nombre, las hectáreas o la forma de un lote.</summary>
    Task<LotResponse> UpdateAsync(Guid farmId, Guid lotId, LotRequest request, string firebaseUid, CancellationToken cancellationToken = default);

    /// <summary>El productor dueño da de baja un lote; sus actividades lo siguen nombrando.</summary>
    Task DeleteAsync(Guid farmId, Guid lotId, string firebaseUid, CancellationToken cancellationToken = default);

    /// <summary>El productor dueño carga un cultivo en un lote para una campaña.</summary>
    Task<LotResponse> AddCropAsync(Guid farmId, Guid lotId, LotCropRequest request, string firebaseUid, CancellationToken cancellationToken = default);

    /// <summary>El productor dueño saca un cultivo de un lote.</summary>
    Task RemoveCropAsync(Guid farmId, Guid lotId, Guid lotCropId, string firebaseUid, CancellationToken cancellationToken = default);
}
