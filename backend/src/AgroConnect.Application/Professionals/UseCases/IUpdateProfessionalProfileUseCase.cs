using AgroConnect.Application.Professionals.DTOs;

namespace AgroConnect.Application.Professionals.UseCases;

/// <summary>
/// Use case contract for updating a professional's profile and coverage area.
/// </summary>
public interface IUpdateProfessionalProfileUseCase
{
    Task<ProfessionalProfileResponse> ExecuteAsync(string auth0UserId, UpdateProfessionalProfileRequest request, CancellationToken cancellationToken = default);
}
