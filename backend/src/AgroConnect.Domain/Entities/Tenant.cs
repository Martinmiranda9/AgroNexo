using AgroConnect.Domain.Common;
using AgroConnect.Domain.Exceptions;

namespace AgroConnect.Domain.Entities;

/// <summary>
/// Tenant representing an isolated team / organization workspace.
/// Every user belongs to a Tenant workspace.
/// </summary>
public class Tenant : BaseEntity, IAggregateRoot, ISoftDeletable
{
    public string Name { get; private set; } = string.Empty;
    public bool IsActive { get; private set; } = true;

    // Navigation collections
    public ICollection<Producer> Producers { get; private set; } = new List<Producer>();
    public ICollection<Professional> Professionals { get; private set; } = new List<Professional>();
    public ICollection<Farm> Farms { get; private set; } = new List<Farm>();

    // Parameterless constructor for EF Core
    protected Tenant()
    {
    }

    public Tenant(string name)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new DomainValidationException(nameof(Name), "El nombre del tenant es obligatorio.");

        Id = Guid.NewGuid();
        Name = name.Trim();
        IsActive = true;
        CreatedAt = DateTime.UtcNow;
    }

    public void UpdateName(string name)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new DomainValidationException(nameof(Name), "El nombre del tenant no puede estar vacío.");

        Name = name.Trim();
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
