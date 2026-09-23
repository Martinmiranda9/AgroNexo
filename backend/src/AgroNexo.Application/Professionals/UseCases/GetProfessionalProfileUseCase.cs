using AgroNexo.Application.Common.Helpers;
using AgroNexo.Application.Professionals.DTOs;
using AgroNexo.Domain.Entities;
using AgroNexo.Domain.Interfaces;

namespace AgroNexo.Application.Professionals.UseCases;

/// <summary>
/// Retrieves professional profile and capacity metrics by Auth0 identifier or Professional ID.
/// </summary>
public class GetProfessionalProfileUseCase : IGetProfessionalProfileUseCase
{
    private readonly IProfessionalRepository _professionalRepository;

    public GetProfessionalProfileUseCase(IProfessionalRepository professionalRepository)
    {
        _professionalRepository = professionalRepository;
    }

    public async Task<ProfessionalProfileResponse?> GetByAuth0UserIdAsync(string auth0UserId, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(auth0UserId))
            return null;

        var professional = await _professionalRepository.GetByAuth0UserIdAsync(auth0UserId, cancellationToken);
        return professional == null ? null : MapToResponse(professional);
    }

    public async Task<ProfessionalProfileResponse?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        if (id == Guid.Empty)
            return null;

        var professional = await _professionalRepository.GetByIdAsync(id, cancellationToken);
        return professional == null ? null : MapToResponse(professional);
    }

    private static ProfessionalProfileResponse MapToResponse(Professional professional)
    {
        return new ProfessionalProfileResponse
        {
            Id = professional.Id,
            PublicId = professional.PublicId,
            TenantId = professional.TenantId,
            Auth0UserId = professional.Auth0UserId,
            FirstName = professional.FirstName,
            LastName = professional.LastName,
            DocumentNumber = professional.DocumentNumber,
            Role = professional.Role,
            Specialty = professional.Specialty,
            YearsExperience = professional.YearsExperience,
            MaxCapacity = professional.MaxCapacity,
            IsVerified = professional.IsVerified,
            IsActive = professional.IsActive,
            CoverageAreaCoordinates = GeometryHelper.ToCoordinateDtos(professional.CoverageArea),
            CreatedAt = professional.CreatedAt,
            UpdatedAt = professional.UpdatedAt
        };
    }
}
