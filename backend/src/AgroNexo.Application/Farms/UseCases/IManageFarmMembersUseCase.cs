using AgroNexo.Application.Farms.DTOs;

namespace AgroNexo.Application.Farms.UseCases;

public interface IManageFarmMembersUseCase
{
    /// <summary>El productor suma al equipo a un profesional con match aceptado.</summary>
    Task<FarmMemberResponse> AddAsync(Guid farmId, AddFarmMemberRequest request, string auth0UserId, CancellationToken cancellationToken = default);

    /// <summary>El productor desvincula a un profesional del equipo.</summary>
    Task RemoveAsync(Guid farmId, Guid memberId, string auth0UserId, CancellationToken cancellationToken = default);

    /// <summary>El profesional deja el campo.</summary>
    Task LeaveAsync(Guid farmId, string auth0UserId, CancellationToken cancellationToken = default);
}
