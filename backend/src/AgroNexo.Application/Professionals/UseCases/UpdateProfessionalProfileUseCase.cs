using AgroNexo.Application.Common.Helpers;
using AgroNexo.Application.Identity.UseCases;
using AgroNexo.Application.Professionals.DTOs;
using AgroNexo.Domain.Exceptions;
using AgroNexo.Domain.Interfaces;

namespace AgroNexo.Application.Professionals.UseCases;

/// <summary>
/// Updates an authenticated professional's profile, coverage polygon, specialty, and workload capacity.
/// </summary>
public class UpdateProfessionalProfileUseCase : IUpdateProfessionalProfileUseCase
{
    private readonly IProfessionalRepository _professionalRepository;
    private readonly IUnitOfWork _unitOfWork;

    public UpdateProfessionalProfileUseCase(
        IProfessionalRepository professionalRepository,
        IUnitOfWork unitOfWork)
    {
        _professionalRepository = professionalRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<ProfessionalProfileResponse> ExecuteAsync(
        string auth0UserId,
        UpdateProfessionalProfileRequest request,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(auth0UserId))
            throw new DomainValidationException(nameof(auth0UserId), "El identificador de usuario es obligatorio.");

        if (request == null)
            throw new ArgumentNullException(nameof(request));

        var professional = await _professionalRepository.GetByAuth0UserIdAsync(auth0UserId, cancellationToken);
        if (professional == null)
            throw new EntityNotFoundException("Profesional", auth0UserId);

        RegisterUserUseCase.EnsurePhoneNumber(request.PhoneNumber);
        RegisterUserUseCase.EnsureLicenseNumber(request.Role, request.LicenseNumber);

        var coveragePolygon = request.CoverageAreaCoordinates != null
            ? GeometryHelper.CreatePolygon(request.CoverageAreaCoordinates)
            : professional.CoverageArea;

        professional.UpdateProfile(
            request.FirstName,
            request.LastName,
            request.DocumentNumber ?? string.Empty,
            request.Role,
            request.Specialty ?? string.Empty,
            request.YearsExperience,
            request.MaxCapacity,
            coveragePolygon,
            request.PhoneNumber,
            request.LicenseNumber);

        await _professionalRepository.UpdateAsync(professional, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return new ProfessionalProfileResponse
        {
            Id = professional.Id,
            TenantId = professional.TenantId,
            Auth0UserId = professional.Auth0UserId,
            FirstName = professional.FirstName,
            LastName = professional.LastName,
            DocumentNumber = professional.DocumentNumber,
            PhoneNumber = professional.PhoneNumber,
            LicenseNumber = professional.LicenseNumber,
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
