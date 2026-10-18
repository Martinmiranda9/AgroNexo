using AgroNexo.Application.Professionals.DTOs;

namespace AgroNexo.Application.Professionals.UseCases;

/// <summary>
/// Use case contract for updating a professional's profile and coverage area.
/// </summary>
public interface IUpdateProfessionalProfileUseCase
{
    Task<ProfessionalProfileResponse> ExecuteAsync(string firebaseUid, UpdateProfessionalProfileRequest request, CancellationToken cancellationToken = default);
}
