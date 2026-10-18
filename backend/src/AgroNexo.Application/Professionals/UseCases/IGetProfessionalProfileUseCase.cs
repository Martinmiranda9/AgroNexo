using AgroNexo.Application.Professionals.DTOs;

namespace AgroNexo.Application.Professionals.UseCases;

/// <summary>
/// Use case contract for retrieving a professional's profile.
/// </summary>
public interface IGetProfessionalProfileUseCase
{
    Task<ProfessionalProfileResponse?> GetByFirebaseUidAsync(string firebaseUid, CancellationToken cancellationToken = default);
    Task<ProfessionalProfileResponse?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
}
