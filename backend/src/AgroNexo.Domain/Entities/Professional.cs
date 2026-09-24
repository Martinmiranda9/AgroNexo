using AgroNexo.Domain.Common;
using AgroNexo.Domain.Enums;
using AgroNexo.Domain.Exceptions;
using NetTopologySuite.Geometries;

namespace AgroNexo.Domain.Entities;

/// <summary>
/// Professional entity representing agronomists, accountants, investors or other specialists.
/// </summary>
public class Professional : BaseEntity, IAggregateRoot, ITenantScopedEntity, ISoftDeletable
{
    public Guid TenantId { get; private set; }
    public string Auth0UserId { get; private set; } = string.Empty;
    public string FirstName { get; private set; } = string.Empty;
    public string LastName { get; private set; } = string.Empty;
    public string DocumentNumber { get; private set; } = string.Empty;
    public ProfessionalRole Role { get; private set; } = ProfessionalRole.Agronomist;
    public string Specialty { get; private set; } = string.Empty;

    /// <summary>WhatsApp en formato internacional (E.164), ej: +5493511234567.</summary>
    public string PhoneNumber { get; private set; } = string.Empty;

    /// <summary>Número de matrícula profesional (solo el número). Opcional según el rol.</summary>
    public string? LicenseNumber { get; private set; }
    public Geometry? CoverageArea { get; private set; }
    public int YearsExperience { get; private set; }
    public int MaxCapacity { get; private set; } = 20;
    public bool IsVerified { get; private set; }
    public bool IsActive { get; private set; } = true;

    /// <summary>
    /// Human-readable numeric public identifier shown to the user.
    /// Prefix depends on Role: 12 = Agronomist, 14 = Accountant, 16 = Investor, 18 = Lawyer, 19 = Other.
    /// Assigned by the infrastructure layer on first save.
    /// </summary>
    public long PublicId { get; private set; }

    // Navigation properties
    public Tenant? Tenant { get; private set; }
    public ICollection<Match> Matches { get; private set; } = new List<Match>();
    public ICollection<MatchRecommendation> Recommendations { get; private set; } = new List<MatchRecommendation>();

    // Parameterless constructor for EF Core
    protected Professional()
    {
    }

    public Professional(
        Guid tenantId,
        string auth0UserId,
        string firstName,
        string lastName,
        string documentNumber,
        ProfessionalRole role,
        string specialty,
        int yearsExperience = 0,
        int maxCapacity = 20,
        Geometry? coverageArea = null,
        bool isVerified = false,
        string? phoneNumber = null,
        string? licenseNumber = null)
    {
        if (tenantId == Guid.Empty)
            throw new DomainValidationException(nameof(TenantId), "El TenantId es obligatorio.");

        if (string.IsNullOrWhiteSpace(auth0UserId))
            throw new DomainValidationException(nameof(Auth0UserId), "El identificador de Auth0 es obligatorio.");

        if (string.IsNullOrWhiteSpace(firstName))
            throw new DomainValidationException(nameof(FirstName), "El nombre del profesional es obligatorio.");

        if (string.IsNullOrWhiteSpace(lastName))
            throw new DomainValidationException(nameof(LastName), "El apellido del profesional es obligatorio.");

        if (yearsExperience < 0)
            throw new DomainValidationException(nameof(YearsExperience), "Los años de experiencia no pueden ser negativos.");

        if (maxCapacity <= 0)
            throw new DomainValidationException(nameof(MaxCapacity), "La capacidad máxima debe ser mayor a cero.");

        Id = Guid.NewGuid();
        TenantId = tenantId;
        Auth0UserId = auth0UserId.Trim();
        FirstName = firstName.Trim();
        LastName = lastName.Trim();
        DocumentNumber = documentNumber?.Trim() ?? string.Empty;
        Role = role;
        Specialty = specialty?.Trim() ?? string.Empty;
        YearsExperience = yearsExperience;
        MaxCapacity = maxCapacity;
        CoverageArea = coverageArea;
        IsVerified = isVerified;
        PhoneNumber = ValidatePhone(phoneNumber);
        LicenseNumber = NormalizeLicense(licenseNumber);
        IsActive = true;
        CreatedAt = DateTime.UtcNow;
    }

    public void UpdateProfile(
        string firstName,
        string lastName,
        string documentNumber,
        ProfessionalRole role,
        string specialty,
        int yearsExperience,
        int maxCapacity,
        Geometry? coverageArea = null,
        string? phoneNumber = null,
        string? licenseNumber = null)
    {
        if (string.IsNullOrWhiteSpace(firstName))
            throw new DomainValidationException(nameof(FirstName), "El nombre del profesional no puede estar vacío.");

        if (string.IsNullOrWhiteSpace(lastName))
            throw new DomainValidationException(nameof(LastName), "El apellido del profesional no puede estar vacío.");

        if (yearsExperience < 0)
            throw new DomainValidationException(nameof(YearsExperience), "Los años de experiencia no pueden ser negativos.");

        if (maxCapacity <= 0)
            throw new DomainValidationException(nameof(MaxCapacity), "La capacidad máxima debe ser mayor a cero.");

        FirstName = firstName.Trim();
        LastName = lastName.Trim();
        DocumentNumber = documentNumber?.Trim() ?? string.Empty;
        Role = role;
        Specialty = specialty?.Trim() ?? string.Empty;
        YearsExperience = yearsExperience;
        MaxCapacity = maxCapacity;
        if (coverageArea != null)
        {
            CoverageArea = coverageArea;
        }

        PhoneNumber = ValidatePhone(phoneNumber);
        LicenseNumber = NormalizeLicense(licenseNumber);
        MarkUpdated();
    }

    /// <summary>
    /// Null conserva el valor actual (registros legacy sin teléfono); un valor informado debe respetar el formato E.164.
    /// La obligatoriedad se exige en la capa Application.
    /// </summary>
    private string ValidatePhone(string? phoneNumber)
    {
        if (phoneNumber == null)
            return PhoneNumber;

        if (!PhoneNumberRules.IsValid(phoneNumber))
            throw new DomainValidationException(nameof(PhoneNumber), PhoneNumberRules.ErrorMessage);
        return phoneNumber.Trim();
    }

    private static string? NormalizeLicense(string? licenseNumber)
    {
        if (string.IsNullOrWhiteSpace(licenseNumber))
            return null;

        var value = licenseNumber.Trim();
        if (value.Length > 50)
            throw new DomainValidationException(nameof(LicenseNumber), "La matrícula no puede superar los 50 caracteres.");
        return value;
    }

    public void SetCoverageArea(Geometry coverageArea)
    {
        CoverageArea = coverageArea ?? throw new ArgumentNullException(nameof(coverageArea));
        MarkUpdated();
    }

    public void Verify()
    {
        IsVerified = true;
        MarkUpdated();
    }

    public void Unverify()
    {
        IsVerified = false;
        MarkUpdated();
    }

    public void Deactivate()
    {
        IsActive = false;
        MarkUpdated();
    }

    public void Activate()
    {
        IsActive = true;
        MarkUpdated();
    }
}
