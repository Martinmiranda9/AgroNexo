using AgroNexo.Domain.Common;
using AgroNexo.Domain.Enums;
using AgroNexo.Domain.Exceptions;

namespace AgroNexo.Domain.Entities;

/// <summary>
/// Agricultural producer entity representing a farmer or agricultural manager.
/// </summary>
public class Producer : BaseEntity, IAggregateRoot, ITenantScopedEntity, ISoftDeletable
{
    public Guid TenantId { get; private set; }
    public string Auth0UserId { get; private set; } = string.Empty;
    public string FirstName { get; private set; } = string.Empty;
    public string LastName { get; private set; } = string.Empty;
    public string DocumentNumber { get; private set; } = string.Empty;

    /// <summary>Correo del productor, informado por el frontend (sesión de Google u onboarding). Nullable por registros existentes.</summary>
    public string? Email { get; private set; }

    /// <summary>
    /// Ubicación geográfica del productor para el sistema de matching por zona.
    /// </summary>
    public string? Country { get; private set; }
    public string? Province { get; private set; }
    public string? City { get; private set; }

    /// <summary>WhatsApp en formato internacional (E.164), ej: +5493511234567.</summary>
    public string PhoneNumber { get; private set; } = string.Empty;

    /// <summary>Rango de hectáreas que maneja el productor.</summary>
    public HectaresRange? HectaresRange { get; private set; }

    /// <summary>Tipos de profesional que el productor está buscando (sin duplicados, nunca Other).</summary>
    public List<ProfessionalRole> LookingFor { get; private set; } = new();

    public bool IsActive { get; private set; } = true;

    /// <summary>
    /// Tipo de actividad productiva principal (Agrícola, Ganadero, Mixto). Nullable para compatibilidad con registros existentes.
    /// </summary>
    public ProducerType? ProducerType { get; private set; }

    /// <summary>
    /// Human-readable numeric public identifier shown to the user.
    /// Starts with prefix 10 (e.g. 100001). Assigned by the infrastructure layer on first save.
    /// </summary>
    public long PublicId { get; private set; }

    // Navigation properties
    public Tenant? Tenant { get; private set; }
    public ICollection<Farm> Farms { get; private set; } = new List<Farm>();
    public ICollection<Match> Matches { get; private set; } = new List<Match>();
    public ICollection<MatchDiscoveryRequest> DiscoveryRequests { get; private set; } = new List<MatchDiscoveryRequest>();

    // Parameterless constructor for EF Core
    protected Producer()
    {
    }

    public Producer(
        Guid tenantId,
        string auth0UserId,
        string firstName,
        string lastName,
        string documentNumber,
        ProducerType? producerType = null,
        string? country = null,
        string? province = null,
        string? city = null,
        string? phoneNumber = null,
        HectaresRange? hectaresRange = null,
        IEnumerable<ProfessionalRole>? lookingFor = null,
        string? email = null)
    {
        if (tenantId == Guid.Empty)
            throw new DomainValidationException(nameof(TenantId), "El TenantId es obligatorio.");

        if (string.IsNullOrWhiteSpace(auth0UserId))
            throw new DomainValidationException(nameof(Auth0UserId), "El identificador de Auth0 es obligatorio.");

        if (string.IsNullOrWhiteSpace(firstName))
            throw new DomainValidationException(nameof(FirstName), "El nombre del productor es obligatorio.");

        if (string.IsNullOrWhiteSpace(lastName))
            throw new DomainValidationException(nameof(LastName), "El apellido del productor es obligatorio.");

        Id = Guid.NewGuid();
        TenantId = tenantId;
        Auth0UserId = auth0UserId.Trim();
        FirstName = firstName.Trim();
        LastName = lastName.Trim();
        DocumentNumber = documentNumber?.Trim() ?? string.Empty;
        ProducerType = producerType;
        Country = string.IsNullOrWhiteSpace(country) ? null : country.Trim();
        Province = string.IsNullOrWhiteSpace(province) ? null : province.Trim();
        City = string.IsNullOrWhiteSpace(city) ? null : city.Trim();
        PhoneNumber = ValidatePhone(phoneNumber);
        HectaresRange = ValidateHectares(hectaresRange);
        LookingFor = NormalizeLookingFor(lookingFor);
        Email = string.IsNullOrWhiteSpace(email) ? null : email.Trim();
        IsActive = true;
        CreatedAt = DateTime.UtcNow;
    }

    public void UpdateProfile(string firstName, string lastName, string documentNumber, ProducerType? producerType = null, string? country = null, string? province = null, string? city = null, string? phoneNumber = null, HectaresRange? hectaresRange = null, IEnumerable<ProfessionalRole>? lookingFor = null, string? email = null)
    {
        if (string.IsNullOrWhiteSpace(firstName))
            throw new DomainValidationException(nameof(FirstName), "El nombre del productor no puede estar vacío.");

        if (string.IsNullOrWhiteSpace(lastName))
            throw new DomainValidationException(nameof(LastName), "El apellido del productor no puede estar vacío.");

        FirstName = firstName.Trim();
        LastName = lastName.Trim();
        DocumentNumber = documentNumber?.Trim() ?? string.Empty;
        ProducerType = producerType;
        Country = string.IsNullOrWhiteSpace(country) ? null : country.Trim();
        Province = string.IsNullOrWhiteSpace(province) ? null : province.Trim();
        City = string.IsNullOrWhiteSpace(city) ? null : city.Trim();
        PhoneNumber = ValidatePhone(phoneNumber);
        HectaresRange = ValidateHectares(hectaresRange);
        LookingFor = NormalizeLookingFor(lookingFor);
        Email = string.IsNullOrWhiteSpace(email) ? null : email.Trim();
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

    private static HectaresRange? ValidateHectares(HectaresRange? value)
    {
        if (value.HasValue && !Enum.IsDefined(value.Value))
            throw new DomainValidationException(nameof(HectaresRange), "El rango de hectáreas no es válido.");
        return value;
    }

    private static List<ProfessionalRole> NormalizeLookingFor(IEnumerable<ProfessionalRole>? roles)
    {
        var result = new List<ProfessionalRole>();
        if (roles == null)
            return result;

        foreach (var role in roles)
        {
            if (role is not (ProfessionalRole.Agronomist or ProfessionalRole.Accountant
                or ProfessionalRole.Lawyer or ProfessionalRole.Investor))
                throw new DomainValidationException(nameof(LookingFor),
                    "El tipo de profesional buscado debe ser Agrónomo, Contador, Abogado o Inversor.");

            if (!result.Contains(role))
                result.Add(role);
        }

        return result;
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
