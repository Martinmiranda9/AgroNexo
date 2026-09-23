using AgroConnect.Domain.Common;
using AgroConnect.Domain.Enums;
using AgroConnect.Domain.Exceptions;
using NetTopologySuite.Geometries;

namespace AgroConnect.Domain.Entities;

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
    public Geometry? CoverageArea { get; private set; }
    public int YearsExperience { get; private set; }
    public int MaxCapacity { get; private set; } = 20;
    public bool IsVerified { get; private set; }
    public bool IsActive { get; private set; } = true;

    /// <summary>
    /// Human-readable numeric public identifier shown to the user.
    /// Prefix depends on Role: 12 = Agronomist, 14 = Accountant, 16 = Investor, 19 = Other.
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
        bool isVerified = false)
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
        Geometry? coverageArea = null)
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

        MarkUpdated();
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
