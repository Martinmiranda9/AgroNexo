using AgroNexo.Application.Matching.DTOs;

namespace AgroNexo.Application.Matching.UseCases;

/// <summary>
/// Use case contract for retrieving generated recommendations for an existing match discovery request.
/// </summary>
public interface IGetMatchRecommendationsUseCase
{
    Task<MatchDiscoveryResponse?> ExecuteAsync(Guid discoveryRequestId, string firebaseUid, CancellationToken cancellationToken = default);
}
