using AgroNexo.Application.Farms.DTOs;
using AgroNexo.Domain.Enums;

namespace AgroNexo.Application.Farms.UseCases;

public interface IGetFarmCandidatesUseCase
{
    Task<IReadOnlyList<FarmCandidateResponse>> ExecuteAsync(Guid farmId, ProfessionalRole? role, string auth0UserId, CancellationToken cancellationToken = default);
}
