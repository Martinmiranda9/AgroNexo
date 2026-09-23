using AgroConnect.Application.Matching.DTOs;

namespace AgroConnect.Application.Matching.UseCases;

/// <summary>
/// Use case contract for initiating a match discovery request and producing ranked recommendations.
/// </summary>
public interface IGenerateMatchRecommendationsUseCase
{
    Task<MatchDiscoveryResponse> ExecuteAsync(CreateMatchDiscoveryRequest request, Guid producerId, CancellationToken cancellationToken = default);
    Task<MatchDiscoveryResponse> ExecuteByAuth0UserIdAsync(CreateMatchDiscoveryRequest request, string auth0UserId, CancellationToken cancellationToken = default);
}
