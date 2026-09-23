using AgroConnect.Domain.Common;
using AgroConnect.Domain.Exceptions;
using NetTopologySuite.Geometries;

namespace AgroConnect.Domain.Entities;

/// <summary>
/// Match discovery search initiated by a Producer, specifying location and specialty needs.
/// </summary>
public class MatchDiscoveryRequest : BaseEntity, IAggregateRoot
{
    public Guid ProducerId { get; private set; }
    public Point LocationPoint { get; private set; } = null!;
    public string RequestedSpecialty { get; private set; } = string.Empty;
    public bool RequiresFieldPresence { get; private set; }
    
    // Navigation properties
    public Producer? Producer { get; private set; }
    public ICollection<MatchRecommendation> Recommendations { get; private set; } = new List<MatchRecommendation>();

    // Parameterless constructor for EF Core
    protected MatchDiscoveryRequest()
    {
    }

    public MatchDiscoveryRequest(
        Guid producerId,
        Point locationPoint,
        string requestedSpecialty,
        bool requiresFieldPresence)
    {
        if (producerId == Guid.Empty)
            throw new DomainValidationException(nameof(ProducerId), "El ProducerId es obligatorio.");

        if (locationPoint == null)
            throw new DomainValidationException(nameof(LocationPoint), "El punto geográfico (LocationPoint) es obligatorio.");

        Id = Guid.NewGuid();
        ProducerId = producerId;
        LocationPoint = locationPoint;
        RequestedSpecialty = requestedSpecialty?.Trim() ?? string.Empty;
        RequiresFieldPresence = requiresFieldPresence;
        CreatedAt = DateTime.UtcNow;
    }

    public MatchRecommendation AddRecommendation(Guid professionalId, decimal score, int rankPosition)
    {
        if (professionalId == Guid.Empty)
            throw new DomainValidationException(nameof(professionalId), "El ProfessionalId es obligatorio.");

        if (score < 0 || score > 1.0m)
            throw new DomainValidationException(nameof(score), "El Score de recomendación debe estar entre 0.00 y 1.00.");

        if (rankPosition <= 0)
            throw new DomainValidationException(nameof(rankPosition), "La posición en el ranking debe ser mayor a cero.");

        var recommendation = new MatchRecommendation(Id, professionalId, score, rankPosition);
        Recommendations.Add(recommendation);
        return recommendation;
    }
}
