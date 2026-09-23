using AgroConnect.Domain.Common;
using AgroConnect.Domain.Exceptions;

namespace AgroConnect.Domain.Entities;

/// <summary>
/// Individual scored recommendation generated for a MatchDiscoveryRequest.
/// </summary>
public class MatchRecommendation : BaseEntity
{
    public Guid MatchDiscoveryRequestId { get; private set; }
    public Guid ProfessionalId { get; private set; }
    public decimal Score { get; private set; }
    public int RankPosition { get; private set; }

    // Navigation properties
    public MatchDiscoveryRequest? MatchDiscoveryRequest { get; private set; }
    public Professional? Professional { get; private set; }

    // Parameterless constructor for EF Core
    protected MatchRecommendation()
    {
    }

    public MatchRecommendation(
        Guid matchDiscoveryRequestId,
        Guid professionalId,
        decimal score,
        int rankPosition)
    {
        if (matchDiscoveryRequestId == Guid.Empty)
            throw new DomainValidationException(nameof(MatchDiscoveryRequestId), "El MatchDiscoveryRequestId es obligatorio.");

        if (professionalId == Guid.Empty)
            throw new DomainValidationException(nameof(ProfessionalId), "El ProfessionalId es obligatorio.");

        if (score < 0 || score > 1.0m)
            throw new DomainValidationException(nameof(Score), "El Score debe estar en el rango de 0.00 a 1.00.");

        if (rankPosition <= 0)
            throw new DomainValidationException(nameof(RankPosition), "La posición en el ranking debe ser mayor a cero.");

        Id = Guid.NewGuid();
        MatchDiscoveryRequestId = matchDiscoveryRequestId;
        ProfessionalId = professionalId;
        Score = score;
        RankPosition = rankPosition;
        CreatedAt = DateTime.UtcNow;
    }
}
