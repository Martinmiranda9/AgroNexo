using AgroNexo.Application.Professionals.DTOs;

namespace AgroNexo.Application.Professionals.UseCases;

/// <summary>
/// Use case contract for retrieving a professional's profile.
/// </summary>
public interface IGetProfessionalProfileUseCase
{
    Task<ProfessionalProfileResponse?> GetByAuth0UserIdAsync(string auth0UserId, CancellationToken cancellationToken = default);
    Task<ProfessionalProfileResponse?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
}
