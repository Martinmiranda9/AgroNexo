using AgroNexo.Application.Common.Models;
using AgroNexo.Application.Matching.DTOs;

namespace AgroNexo.Application.Matching.UseCases;

/// <summary>
/// Use case contract for listing cross-tenant matches with pagination and filters.
/// </summary>
public interface IGetMatchesUseCase
{
    Task<PagedResult<MatchResponse>> ExecuteAsync(MatchFilterRequest filter, string firebaseUid, CancellationToken cancellationToken = default);
    Task<PagedResult<MatchResponse>> ExecuteForUserAsync(string firebaseUid, MatchFilterRequest filter, CancellationToken cancellationToken = default);
}
