using System.Text.RegularExpressions;
using AgroNexo.Domain.Enums;
using AgroNexo.Domain.Exceptions;

namespace AgroNexo.Domain.ValueObjects;

/// <summary>
/// Value Object con la "ficha de necesidad" que acompaña un pedido de Match: el contexto que el productor ya
/// describió (resumen, zona, hectáreas, urgencia, temas y cultivos) para que el profesional lo reciba completo.
/// Es una foto tomada al enviar el pedido y no cambia después. Nunca guarda coordenadas ni datos de contacto:
/// la zona viaja solo como texto.
/// </summary>
public sealed class NeedBrief
{
    public const int SummaryMinLength = 10;
    public const int SummaryMaxLength = 600;
    public const int PlaceMaxLength = 150;
    public const int MaxHectares = 1_000_000;
    public const int MaxItems = 5;
    public const int ItemMaxLength = 50;

    /// <summary>Ids estables del catálogo (kebab-case en inglés, ej: "farm-taxes", "soybean").</summary>
    private static readonly Regex ItemIdPattern = new("^[a-z0-9]+(-[a-z0-9]+)*$", RegexOptions.Compiled | RegexOptions.CultureInvariant);

    /// <summary>Texto descriptivo del pedido, redactado para que lo lea el profesional.</summary>
    public string Summary { get; private set; } = string.Empty;

    /// <summary>Zona en texto ("Berrotarán, Córdoba"). Nunca coordenadas exactas.</summary>
    public string? PlaceLabel { get; private set; }

    public int? Hectares { get; private set; }

    public MatchUrgency? Urgency { get; private set; }

    /// <summary>Ids de los temas a tratar (impuestos, arrendamientos, etc.).</summary>
    public List<string> Topics { get; private set; } = new();

    /// <summary>Ids de los cultivos involucrados (soja, maíz, etc.).</summary>
    public List<string> Crops { get; private set; } = new();

    // Parameterless constructor for EF Core
    private NeedBrief()
    {
    }

    public NeedBrief(
        string summary,
        string? placeLabel = null,
        int? hectares = null,
        MatchUrgency? urgency = null,
        IEnumerable<string>? topics = null,
        IEnumerable<string>? crops = null)
    {
        var normalizedSummary = summary?.Trim() ?? string.Empty;
        if (normalizedSummary.Length < SummaryMinLength || normalizedSummary.Length > SummaryMaxLength)
            throw new DomainValidationException(nameof(Summary), $"El resumen de la necesidad debe tener entre {SummaryMinLength} y {SummaryMaxLength} caracteres.");

        var normalizedPlace = string.IsNullOrWhiteSpace(placeLabel) ? null : placeLabel.Trim();
        if (normalizedPlace is { Length: > PlaceMaxLength })
            throw new DomainValidationException(nameof(PlaceLabel), $"La zona no puede superar los {PlaceMaxLength} caracteres.");

        if (hectares is < 1 or > MaxHectares)
            throw new DomainValidationException(nameof(Hectares), $"Las hectáreas deben estar entre 1 y {MaxHectares}.");

        if (urgency.HasValue && !Enum.IsDefined(urgency.Value))
            throw new DomainValidationException(nameof(Urgency), "La urgencia indicada no es válida.");

        Summary = normalizedSummary;
        PlaceLabel = normalizedPlace;
        Hectares = hectares;
        Urgency = urgency;
        Topics = NormalizeItems(topics, nameof(Topics), "temas");
        Crops = NormalizeItems(crops, nameof(Crops), "cultivos");
    }

    private static List<string> NormalizeItems(IEnumerable<string>? items, string propertyName, string label)
    {
        var normalized = (items ?? Enumerable.Empty<string>())
            .Where(item => !string.IsNullOrWhiteSpace(item))
            .Select(item => item.Trim().ToLowerInvariant())
            .Distinct()
            .ToList();

        if (normalized.Count > MaxItems)
            throw new DomainValidationException(propertyName, $"No se pueden indicar más de {MaxItems} {label}.");

        if (normalized.Any(item => item.Length > ItemMaxLength || !ItemIdPattern.IsMatch(item)))
            throw new DomainValidationException(propertyName, $"Los {label} tienen un identificador inválido.");

        return normalized;
    }
}
