using AgroNexo.Application.Matching.DTOs;

namespace AgroNexo.Application.Matching.UseCases;

/// <summary>
/// Use case contract for updating the lifecycle state of a Match (Accept, Reject, Cancel, Complete).
/// </summary>
public interface IUpdateMatchStatusUseCase
{
    Task<MatchResponse> ExecuteAsync(Guid matchId, UpdateMatchStatusRequest request, string? auth0UserId = null, CancellationToken cancellationToken = default);
}
