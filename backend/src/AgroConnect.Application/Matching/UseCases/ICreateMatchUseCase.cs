using AgroConnect.Application.Matching.DTOs;

namespace AgroConnect.Application.Matching.UseCases;

/// <summary>
/// Use case contract for creating a match link / invitation between a producer and a professional.
/// </summary>
public interface ICreateMatchUseCase
{
    Task<MatchResponse> ExecuteAsync(CreateMatchRequest request, Guid producerId, string auth0UserId, CancellationToken cancellationToken = default);
    Task<MatchResponse> ExecuteByAuth0UserIdAsync(CreateMatchRequest request, string auth0UserId, CancellationToken cancellationToken = default);
}
