using AgroNexo.Application.Common.Helpers;
using AgroNexo.Domain.Common;
using AgroNexo.Application.Identity.DTOs;
using AgroNexo.Domain.Entities;
using AgroNexo.Domain.Enums;
using AgroNexo.Domain.Exceptions;
using AgroNexo.Domain.Interfaces;

namespace AgroNexo.Application.Identity.UseCases;

/// <summary>
/// Handles user registration, automatically provisions a dedicated Tenant workspace,
/// and creates the corresponding Producer or Professional entity.
/// </summary>
public class RegisterUserUseCase : IRegisterUserUseCase
{
    private readonly ITenantRepository _tenantRepository;
    private readonly IProducerRepository _producerRepository;
    private readonly IProfessionalRepository _professionalRepository;
    private readonly IUnitOfWork _unitOfWork;

    public RegisterUserUseCase(
        ITenantRepository tenantRepository,
        IProducerRepository producerRepository,
        IProfessionalRepository professionalRepository,
        IUnitOfWork unitOfWork)
    {
        _tenantRepository = tenantRepository;
        _producerRepository = producerRepository;
        _professionalRepository = professionalRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<RegisterUserResponse> ExecuteAsync(
        RegisterUserRequest request,
        string auth0UserId,
        CancellationToken cancellationToken = default)
    {
        if (request == null)
            throw new ArgumentNullException(nameof(request));

        if (string.IsNullOrWhiteSpace(auth0UserId))
            throw new DomainValidationException(nameof(auth0UserId), "El identificador de autenticación Auth0 es obligatorio.");

        EnsurePhoneNumber(request.PhoneNumber);

        // Check if user already exists
        var existingProducer = await _producerRepository.GetByAuth0UserIdAsync(auth0UserId, cancellationToken);
        if (existingProducer != null)
            throw new DomainException("El usuario ya se encuentra registrado como productor.");

        var existingProfessional = await _professionalRepository.GetByAuth0UserIdAsync(auth0UserId, cancellationToken);
        if (existingProfessional != null)
            throw new DomainException("El usuario ya se encuentra registrado como profesional.");

        // 1. Auto-generate Tenant workspace
        string tenantName = $"Workspace de {request.FirstName.Trim()} {request.LastName.Trim()}";
        var tenant = new Tenant(tenantName);
        await _tenantRepository.AddAsync(tenant, cancellationToken);

        Guid userId;
        Func<long> getPublicId;
        string? roleStr = null;
        string? specialtyStr = null;
        Producer? createdProducer = null;
        Professional? createdProfessional = null;

        // 2. Create the entity according to selected UserType
        if (request.UserType == UserType.Producer)
        {
            var producer = new Producer(
                tenant.Id,
                auth0UserId,
                request.FirstName,
                request.LastName,
                request.DocumentNumber ?? string.Empty,
                request.ProducerType,
                request.Country,
                request.Province,
                request.City,
                request.PhoneNumber,
                request.HectaresRange,
                request.LookingFor);

            await _producerRepository.AddAsync(producer, cancellationToken);
            userId = producer.Id;
            createdProducer = producer;
            getPublicId = () => producer.PublicId;
        }
        else if (request.UserType == UserType.Professional)
        {
            var role = request.Role ?? ProfessionalRole.Agronomist;
            EnsureLicenseNumber(role, request.LicenseNumber);
            var coveragePolygon = GeometryHelper.CreatePolygon(request.CoverageAreaCoordinates);

            var professional = new Professional(
                tenant.Id,
                auth0UserId,
                request.FirstName,
                request.LastName,
                request.DocumentNumber ?? string.Empty,
                role,
                request.Specialty ?? string.Empty,
                request.YearsExperience,
                request.MaxCapacity,
                coveragePolygon,
                phoneNumber: request.PhoneNumber,
                licenseNumber: request.LicenseNumber);

            await _professionalRepository.AddAsync(professional, cancellationToken);
            userId = professional.Id;
            createdProfessional = professional;
            getPublicId = () => professional.PublicId;
            roleStr = role.ToString();
            specialtyStr = professional.Specialty;
        }
        else
        {
            throw new DomainValidationException(nameof(request.UserType), "Tipo de usuario no reconocido.");
        }

        // 3. Persist transaction
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        // El PublicId lo asigna la capa de infraestructura al guardar y queda en la entidad rastreada.
        long publicId = getPublicId();

        return new RegisterUserResponse
        {
            UserId = userId,
            PublicId = publicId,
            TenantId = tenant.Id,
            TenantName = tenant.Name,
            Auth0UserId = auth0UserId,
            UserType = request.UserType,
            FirstName = request.FirstName.Trim(),
            LastName = request.LastName.Trim(),
            DocumentNumber = request.DocumentNumber?.Trim() ?? string.Empty,
            PhoneNumber = (createdProducer?.PhoneNumber ?? createdProfessional?.PhoneNumber) ?? string.Empty,
            LicenseNumber = createdProfessional?.LicenseNumber,
            ProducerType = request.ProducerType?.ToString(),
            HectaresRange = createdProducer?.HectaresRange,
            LookingFor = createdProducer?.LookingFor.ToList() ?? new List<ProfessionalRole>(),
            Country = request.Country?.Trim(),
            Province = request.Province?.Trim(),
            City = request.City?.Trim(),
            Role = roleStr,
            Specialty = specialtyStr,
            CreatedAt = DateTime.UtcNow
        };
    }

    /// <summary>
    /// Regla de negocio: el WhatsApp es obligatorio y debe estar en formato internacional.
    /// </summary>
    public static void EnsurePhoneNumber(string? phoneNumber)
    {
        if (!PhoneNumberRules.IsValid(phoneNumber))
            throw new DomainValidationException("PhoneNumber", PhoneNumberRules.ErrorMessage);
    }

    /// <summary>
    /// Regla de negocio: la matrícula es obligatoria para Agronomist, Accountant y Lawyer.
    /// </summary>
    public static void EnsureLicenseNumber(ProfessionalRole role, string? licenseNumber)
    {
        bool requiresLicense = role is ProfessionalRole.Agronomist
            or ProfessionalRole.Accountant
            or ProfessionalRole.Lawyer;

        if (requiresLicense && string.IsNullOrWhiteSpace(licenseNumber))
            throw new DomainValidationException("LicenseNumber", "La matrícula es obligatoria para este tipo de profesional.");
    }
}
