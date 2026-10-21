using AgroNexo.Domain.Common;
using AgroNexo.Domain.Exceptions;
using NetTopologySuite.Geometries;

namespace AgroNexo.Domain.Entities;

/// <summary>
/// Agricultural farm / establishment owned by a Producer within a Tenant workspace.
/// </summary>
public class Farm : BaseEntity, IAggregateRoot, ITenantScopedEntity, ISoftDeletable
{
    public Guid TenantId { get; private set; }
    public Guid ProducerId { get; private set; }
    public string Name { get; private set; } = string.Empty;
    public Geometry? Location { get; private set; }
    public decimal TotalHectares { get; private set; }
    public bool IsActive { get; private set; } = true;

    /// <summary>Breve descripción que el productor escribe al crear el campo (opcional).</summary>
    public string? Description { get; private set; }

    /// <summary>Fecha en que el productor archivó el campo. Un campo archivado queda en solo lectura y sin equipo.</summary>
    public DateTime? ArchivedAt { get; private set; }

    public bool IsArchived => ArchivedAt.HasValue;

    /// <summary>Provincia donde está el campo, sacada del mapa (por ejemplo "Buenos Aires").</summary>
    public string? Province { get; private set; }

    /// <summary>Partido o departamento (por ejemplo "Pergamino").</summary>
    public string? Department { get; private set; }

    /// <summary>Localidad o gobierno local; si no hay, el partido.</summary>
    public string? Locality { get; private set; }

    public const int DescriptionMaxLength = 500;
    public const int PlaceNameMaxLength = 100;

    /// <summary>
    /// Human-readable numeric public identifier for the farm/lot (prefix 20, e.g. 200001).
    /// Visible to the producer and their team. Assigned by infrastructure on first save.
    /// </summary>
    public long PublicId { get; private set; }

    // Navigation properties
    public Tenant? Tenant { get; private set; }
    public Producer? Producer { get; private set; }

    // Parameterless constructor for EF Core
    protected Farm()
    {
    }

    public Farm(
        Guid tenantId,
        Guid producerId,
        string name,
        decimal totalHectares,
        Geometry? location = null,
        string? description = null)
    {
        if (tenantId == Guid.Empty)
            throw new DomainValidationException(nameof(TenantId), "El TenantId es obligatorio.");

        if (producerId == Guid.Empty)
            throw new DomainValidationException(nameof(ProducerId), "El ProducerId es obligatorio.");

        if (string.IsNullOrWhiteSpace(name))
            throw new DomainValidationException(nameof(Name), "El nombre del campo / establecimiento es obligatorio.");

        if (totalHectares < 0)
            throw new DomainValidationException(nameof(TotalHectares), "La cantidad total de hectáreas no puede ser negativa.");

        Id = Guid.NewGuid();
        TenantId = tenantId;
        ProducerId = producerId;
        Name = name.Trim();
        Location = ValidateLocation(location);
        TotalHectares = totalHectares;
        Description = NormalizeDescription(description);
        IsActive = true;
        CreatedAt = DateTime.UtcNow;
    }

    public void UpdateDetails(string name, decimal totalHectares, Geometry? location = null, string? description = null)
    {
        EnsureNotArchived();

        if (string.IsNullOrWhiteSpace(name))
            throw new DomainValidationException(nameof(Name), "El nombre del campo / establecimiento no puede estar vacío.");

        if (totalHectares < 0)
            throw new DomainValidationException(nameof(TotalHectares), "La cantidad total de hectáreas no puede ser negativa.");

        Name = name.Trim();
        Description = NormalizeDescription(description);
        if (location != null)
        {
            Location = ValidateLocation(location);
        }

        TotalHectares = totalHectares;
        MarkUpdated();
    }

    /// <summary>Provincia, partido y localidad del campo. Vacíos o en blanco quedan en <c>null</c>.</summary>
    public void SetPlace(string? province, string? department, string? locality)
    {
        Province = NormalizePlaceName(province, nameof(Province));
        Department = NormalizePlaceName(department, nameof(Department));
        Locality = NormalizePlaceName(locality, nameof(Locality));
        MarkUpdated();
    }

    private static Geometry? ValidateLocation(Geometry? location)
    {
        if (location is Polygon && !location.IsValid)
            throw new DomainValidationException(nameof(Location), "El perímetro del campo se cruza consigo mismo. Revisá el orden de las esquinas.");

        return location;
    }

    private static string? NormalizePlaceName(string? value, string propertyName)
    {
        if (string.IsNullOrWhiteSpace(value))
            return null;

        var trimmed = value.Trim();
        if (trimmed.Length > PlaceNameMaxLength)
            throw new DomainValidationException(propertyName, $"El nombre no puede superar los {PlaceNameMaxLength} caracteres.");

        return trimmed;
    }

    /// <summary>Solo el productor archiva el campo; la baja del equipo la hace el caso de uso.</summary>
    public void Archive()
    {
        EnsureNotArchived();
        ArchivedAt = DateTime.UtcNow;
        MarkUpdated();
    }

    public void EnsureNotArchived()
    {
        if (IsArchived)
            throw new DomainException("El campo está archivado: no admite cambios.");
    }

    private static string? NormalizeDescription(string? description)
    {
        if (string.IsNullOrWhiteSpace(description))
            return null;

        var trimmed = description.Trim();
        if (trimmed.Length > DescriptionMaxLength)
            throw new DomainValidationException(nameof(Description), $"La descripción no puede superar los {DescriptionMaxLength} caracteres.");

        return trimmed;
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
