using AgroNexo.Application.Farms.DTOs;
using AgroNexo.Domain.Entities;
using AgroNexo.Domain.Interfaces;

namespace AgroNexo.Application.Farms.Services;

public class FarmActivityResponseFactory : IFarmActivityResponseFactory
{
    private readonly ILotRepository _lotRepository;
    private readonly IProducerRepository _producerRepository;
    private readonly IProfessionalRepository _professionalRepository;

    public FarmActivityResponseFactory(
        ILotRepository lotRepository,
        IProducerRepository producerRepository,
        IProfessionalRepository professionalRepository)
    {
        _lotRepository = lotRepository;
        _producerRepository = producerRepository;
        _professionalRepository = professionalRepository;
    }

    public async Task<List<FarmActivityResponse>> BuildAsync(
        IReadOnlyCollection<FarmActivity> activities,
        FarmAccess access,
        CancellationToken cancellationToken = default)
    {
        if (activities.Count == 0)
            return new List<FarmActivityResponse>();

        var lotIds = activities.Where(a => a.LotId.HasValue).Select(a => a.LotId!.Value).Distinct().ToList();
        var lotNames = await _lotRepository.GetNamesAsync(lotIds, cancellationToken);

        var owner = access.Owner ?? await _producerRepository.GetByIdAsync(access.Farm.ProducerId, cancellationToken);
        var ownerName = owner != null ? $"{owner.FirstName} {owner.LastName}".Trim() : "Productor";

        // Los autores pueden haber dejado el equipo: se buscan por id, aunque sean de otro tenant. Todos en una query.
        var authorIds = activities.Where(a => a.AuthorProfessionalId.HasValue).Select(a => a.AuthorProfessionalId!.Value).Distinct().ToList();
        var authors = await _professionalRepository.GetByIdsAcrossTenantsAsync(authorIds, cancellationToken);

        var viewerProfessionalId = access.Professional?.Id;

        return activities.Select(a =>
        {
            var author = a.AuthorProfessionalId.HasValue ? authors.GetValueOrDefault(a.AuthorProfessionalId.Value) : null;

            return new FarmActivityResponse
            {
                Id = a.Id,
                Date = a.Date,
                Type = a.Type,
                Title = a.Title,
                Notes = a.Notes,
                Status = a.Status,
                CompletedAt = a.CompletedAt,
                HectaresWorked = a.HectaresWorked,
                CreatedAt = a.CreatedAt,
                CampaignId = a.CampaignId,
                Lot = a.LotId.HasValue && lotNames.TryGetValue(a.LotId.Value, out var lotName)
                    ? new FarmActivityLotResponse { Id = a.LotId.Value, Name = lotName }
                    : null,
                Author = a.AuthorProfessionalId == null
                    ? new FarmActivityAuthorResponse { Name = ownerName }
                    : new FarmActivityAuthorResponse
                    {
                        Name = author != null ? $"{author.FirstName} {author.LastName}".Trim() : "Profesional",
                        Role = author?.Role
                    },
                CanEdit = access.IsOwner || (viewerProfessionalId.HasValue && a.IsAuthoredBy(viewerProfessionalId))
            };
        }).ToList();
    }
}
