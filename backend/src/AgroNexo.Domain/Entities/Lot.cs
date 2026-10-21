using AgroNexo.Domain.Common;
using AgroNexo.Domain.Enums;
using AgroNexo.Domain.Exceptions;
using NetTopologySuite.Geometries;

namespace AgroNexo.Domain.Entities;

/// <summary>
/// Parte de un campo que se trabaja por separado (por ejemplo "Lote 3 · 20 ha"). En cada campaña tiene sus cultivos.
/// Las hectáreas son siempre las que declara quien lo carga; la forma dibujada en el mapa es opcional y solo lo ubica.
/// Lo crean y corrigen el productor dueño o el ingeniero agrónomo del equipo; los cultivos y la baja son solo del
/// productor.
/// </summary>
public class Lot : BaseEntity, IAggregateRoot, ISoftDeletable
{
    public const int NameMaxLength = 100;
    public const decimal HectaresMax = 1_000_000m;
    public const int BoundarySrid = 4326;

    private readonly List<LotCrop> _crops = new();

    public Guid FarmId { get; private set; }
    public string Name { get; private set; } = string.Empty;
    public decimal Hectares { get; private set; }
    public bool IsActive { get; private set; } = true;

    /// <summary>Forma del lote dibujada en el mapa (SRID 4326), solo para ubicarlo; <c>null</c> si no se dibujó.</summary>
    public Polygon? Boundary { get; private set; }

    /// <summary>Profesional que creó el lote; <c>null</c> si lo creó el productor.</summary>
    public Guid? CreatedByProfessionalId { get; private set; }

    /// <summary>Profesional que dibujó o corrigió la forma por última vez; <c>null</c> si fue el productor.</summary>
    public Guid? BoundaryEditedByProfessionalId { get; private set; }

    /// <summary>Cuándo se dibujó o corrigió la forma por última vez; <c>null</c> si el lote no tiene forma.</summary>
    public DateTime? BoundaryEditedAt { get; private set; }

    public IReadOnlyCollection<LotCrop> Crops => _crops.AsReadOnly();

    // Parameterless constructor for EF Core
    protected Lot()
    {
    }

    /// <summary>Lote con sus hectáreas declaradas y, si se dibujó, su ubicación en el mapa.</summary>
    public Lot(Guid farmId, string name, decimal hectares, Polygon? boundary = null, Guid? createdByProfessionalId = null)
    {
        if (farmId == Guid.Empty)
            throw new DomainValidationException(nameof(FarmId), "El FarmId es obligatorio.");

        Id = Guid.NewGuid();
        FarmId = farmId;
        ApplyName(name);
        ApplyHectares(hectares);
        CreatedByProfessionalId = createdByProfessionalId;
        IsActive = true;
        CreatedAt = DateTime.UtcNow;

        if (boundary != null)
            ApplyBoundary(boundary, createdByProfessionalId);
    }

    /// <summary>
    /// Corrige nombre, hectáreas y ubicación. Sin forma, el lote queda sin dibujo; si la forma cambió, se registra quién
    /// la corrigió.
    /// </summary>
    public void Update(string name, decimal hectares, Polygon? boundary = null, Guid? editedByProfessionalId = null)
    {
        ApplyName(name);
        ApplyHectares(hectares);

        if (boundary == null)
        {
            Boundary = null;
            BoundaryEditedByProfessionalId = null;
            BoundaryEditedAt = null;
        }
        else if (Boundary == null || !Boundary.EqualsExact(boundary))
        {
            ApplyBoundary(boundary, editedByProfessionalId);
        }

        MarkUpdated();
    }

    /// <summary>Siembra un cultivo en el lote para una campaña. Quien llama persiste el cultivo devuelto.</summary>
    public LotCrop AddCrop(Guid campaignId, CropType crop, DateOnly? sowingDate, DateOnly? expectedHarvestDate)
    {
        if (_crops.Any(c => c.CampaignId == campaignId && c.Crop == crop))
            throw new DuplicateFarmRecordException("Ese cultivo ya está cargado en este lote para la campaña.");

        var lotCrop = new LotCrop(Id, campaignId, crop, sowingDate, expectedHarvestDate);
        _crops.Add(lotCrop);
        MarkUpdated();
        return lotCrop;
    }

    /// <summary>Saca un cultivo del lote. Quien llama borra el cultivo devuelto.</summary>
    public LotCrop RemoveCrop(Guid lotCropId)
    {
        var lotCrop = _crops.FirstOrDefault(c => c.Id == lotCropId)
            ?? throw new EntityNotFoundException("Cultivo del lote", lotCropId);

        _crops.Remove(lotCrop);
        MarkUpdated();
        return lotCrop;
    }

    public IEnumerable<LotCrop> CropsIn(Guid campaignId) => _crops.Where(c => c.CampaignId == campaignId);

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

    private void ApplyName(string name)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new DomainValidationException(nameof(Name), "El nombre del lote es obligatorio.");

        var trimmed = name.Trim();
        if (trimmed.Length > NameMaxLength)
            throw new DomainValidationException(nameof(Name), $"El nombre del lote no puede superar los {NameMaxLength} caracteres.");

        Name = trimmed;
    }

    private void ApplyHectares(decimal hectares)
    {
        if (hectares <= 0 || hectares > HectaresMax)
            throw new DomainValidationException(nameof(Hectares), "Las hectáreas del lote tienen que ser mayores a cero.");

        Hectares = hectares;
    }

    private void ApplyBoundary(Polygon boundary, Guid? editedByProfessionalId)
    {
        ArgumentNullException.ThrowIfNull(boundary);

        if (boundary.SRID != BoundarySrid)
            throw new DomainValidationException(nameof(Boundary), $"La forma del lote tiene que estar en coordenadas geográficas (SRID {BoundarySrid}).");

        if (!boundary.IsValid)
            throw new DomainValidationException(nameof(Boundary), "El borde del lote se cruza consigo mismo. Revisá el orden de las esquinas.");

        Boundary = boundary;
        BoundaryEditedByProfessionalId = editedByProfessionalId;
        BoundaryEditedAt = DateTime.UtcNow;
    }
}
