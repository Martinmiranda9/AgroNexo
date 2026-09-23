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
        Geometry? location = null)
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
        TotalHectares = totalHectares;
        Location = location;
        IsActive = true;
        CreatedAt = DateTime.UtcNow;
    }

    public void UpdateDetails(string name, decimal totalHectares, Geometry? location = null)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new DomainValidationException(nameof(Name), "El nombre del campo / establecimiento no puede estar vacío.");

        if (totalHectares < 0)
            throw new DomainValidationException(nameof(TotalHectares), "La cantidad total de hectáreas no puede ser negativa.");

        Name = name.Trim();
        TotalHectares = totalHectares;
        if (location != null)
        {
            Location = location;
        }

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
