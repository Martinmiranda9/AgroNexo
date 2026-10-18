using AgroNexo.Application.Matching.DTOs;

namespace AgroNexo.Application.Matching.UseCases;

/// <summary>
/// Use case contract for initiating a match discovery request and producing ranked recommendations.
/// </summary>
public interface IGenerateMatchRecommendationsUseCase
{
    Task<MatchDiscoveryResponse> ExecuteAsync(CreateMatchDiscoveryRequest request, Guid producerId, CancellationToken cancellationToken = default);
    Task<MatchDiscoveryResponse> ExecuteByFirebaseUidAsync(CreateMatchDiscoveryRequest request, string firebaseUid, CancellationToken cancellationToken = default);
}
