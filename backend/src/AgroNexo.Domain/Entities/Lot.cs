using AgroNexo.Domain.Common;
using AgroNexo.Domain.Enums;
using AgroNexo.Domain.Exceptions;

namespace AgroNexo.Domain.Entities;

/// <summary>
/// Parte de un campo que se trabaja por separado (por ejemplo "Lote 3 · 20 ha"). En cada campaña tiene sus cultivos.
/// Lo administra el productor dueño del campo.
/// </summary>
public class Lot : BaseEntity, IAggregateRoot, ISoftDeletable
{
    public const int NameMaxLength = 100;
    public const decimal HectaresMax = 1_000_000m;

    private readonly List<LotCrop> _crops = new();

    public Guid FarmId { get; private set; }
    public string Name { get; private set; } = string.Empty;
    public decimal Hectares { get; private set; }
    public bool IsActive { get; private set; } = true;

    public IReadOnlyCollection<LotCrop> Crops => _crops.AsReadOnly();

    // Parameterless constructor for EF Core
    protected Lot()
    {
    }

    public Lot(Guid farmId, string name, decimal hectares)
    {
        if (farmId == Guid.Empty)
            throw new DomainValidationException(nameof(FarmId), "El FarmId es obligatorio.");

        Id = Guid.NewGuid();
        FarmId = farmId;
        Apply(name, hectares);
        IsActive = true;
        CreatedAt = DateTime.UtcNow;
    }

    public void Update(string name, decimal hectares)
    {
        Apply(name, hectares);
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

    private void Apply(string name, decimal hectares)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new DomainValidationException(nameof(Name), "El nombre del lote es obligatorio.");

        var trimmed = name.Trim();
        if (trimmed.Length > NameMaxLength)
            throw new DomainValidationException(nameof(Name), $"El nombre del lote no puede superar los {NameMaxLength} caracteres.");

        if (hectares <= 0 || hectares > HectaresMax)
            throw new DomainValidationException(nameof(Hectares), "Las hectáreas del lote tienen que ser mayores a cero.");

        Name = trimmed;
        Hectares = hectares;
    }
}
