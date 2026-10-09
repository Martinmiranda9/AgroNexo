using AgroNexo.Domain.Enums;
using AgroNexo.Domain.ValueObjects;

namespace AgroNexo.Application.Matching.DTOs;

/// <summary>
/// Ficha de necesidad tal como la ve quien consulta el Match (productor o profesional).
/// </summary>
public class NeedBriefResponse
{
    public string Summary { get; set; } = string.Empty;
    public string? PlaceLabel { get; set; }
    public int? Hectares { get; set; }
    public MatchUrgency? Urgency { get; set; }
    public List<string> Topics { get; set; } = new();
    public List<string> Crops { get; set; } = new();

    /// <summary>Convierte la ficha del dominio; devuelve null si el match se creó sin ella.</summary>
    public static NeedBriefResponse? From(NeedBrief? brief)
    {
        if (brief == null)
            return null;

        return new NeedBriefResponse
        {
            Summary = brief.Summary,
            PlaceLabel = brief.PlaceLabel,
            Hectares = brief.Hectares,
            Urgency = brief.Urgency,
            Topics = brief.Topics.ToList(),
            Crops = brief.Crops.ToList()
        };
    }
}
