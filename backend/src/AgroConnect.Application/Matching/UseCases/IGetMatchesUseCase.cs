using AgroConnect.Application.Common.Models;
using AgroConnect.Application.Matching.DTOs;

namespace AgroConnect.Application.Matching.UseCases;

/// <summary>
/// Use case contract for listing cross-tenant matches with pagination and filters.
/// </summary>
public interface IGetMatchesUseCase
{
    Task<PagedResult<MatchResponse>> ExecuteAsync(MatchFilterRequest filter, string auth0UserId, CancellationToken cancellationToken = default);
    Task<PagedResult<MatchResponse>> ExecuteForUserAsync(string auth0UserId, MatchFilterRequest filter, CancellationToken cancellationToken = default);
}
