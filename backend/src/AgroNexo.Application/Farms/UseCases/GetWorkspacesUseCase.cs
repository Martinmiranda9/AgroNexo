using AgroNexo.Application.Common.Helpers;
using AgroNexo.Application.Farms.DTOs;
using AgroNexo.Application.Farms.Services;
using AgroNexo.Domain.Entities;
using AgroNexo.Domain.Interfaces;

namespace AgroNexo.Application.Farms.UseCases;

/// <summary>
/// Los campos como espacios de trabajo, para el productor dueño y para los profesionales del equipo. La lista es liviana
/// (equipo sin contactos); el detalle suma los contactos que cada uno puede ver.
/// </summary>
public class GetWorkspacesUseCase : IGetWorkspacesUseCase
{
    private const string OwnerRole = "Owner";
    private const string MemberRole = "Member";

    private readonly IFarmAccessService _farmAccessService;
    private readonly IFarmRepository _farmRepository;
    private readonly IFarmMemberRepository _farmMemberRepository;
    private readonly IProducerRepository _producerRepository;
    private readonly IProfessionalRepository _professionalRepository;

    public GetWorkspacesUseCase(
        IFarmAccessService farmAccessService,
        IFarmRepository farmRepository,
        IFarmMemberRepository farmMemberRepository,
        IProducerRepository producerRepository,
        IProfessionalRepository professionalRepository)
    {
        _farmAccessService = farmAccessService;
        _farmRepository = farmRepository;
        _farmMemberRepository = farmMemberRepository;
        _producerRepository = producerRepository;
        _professionalRepository = professionalRepository;
    }

    public async Task<IReadOnlyList<WorkspaceResponse>> ListAsync(string firebaseUid, CancellationToken cancellationToken = default)
    {
        var producer = await _producerRepository.GetByFirebaseUidAsync(firebaseUid, cancellationToken);
        if (producer != null)
        {
            var farms = await _farmRepository.GetByProducerIdAsync(producer.Id, cancellationToken);
            var teams = await TeamsByFarmAsync(farms.Select(f => f.Id).ToList(), cancellationToken);

            return farms
                .OrderBy(f => f.IsArchived)
                .ThenBy(f => f.Name)
                .Select(f => Map(f, producer, OwnerRole, null, teams.GetValueOrDefault(f.Id) ?? new(), includeContacts: false))
                .ToList();
        }

        var professional = await _professionalRepository.GetByFirebaseUidAsync(firebaseUid, cancellationToken);
        if (professional == null)
            return Array.Empty<WorkspaceResponse>();

        var memberships = await _farmMemberRepository.GetActiveByProfessionalAsync(professional.Id, cancellationToken);
        var memberTeams = await TeamsByFarmAsync(memberships.Select(m => m.FarmId).ToList(), cancellationToken);

        var workspaces = new List<WorkspaceResponse>();
        foreach (var membership in memberships)
        {
            var owner = await _producerRepository.GetByIdAsync(membership.Farm!.ProducerId, cancellationToken);
            workspaces.Add(Map(membership.Farm, owner, MemberRole, membership,
                memberTeams.GetValueOrDefault(membership.FarmId) ?? new(), includeContacts: false));
        }

        return workspaces;
    }

    public async Task<WorkspaceResponse> GetAsync(Guid farmId, string firebaseUid, CancellationToken cancellationToken = default)
    {
        var access = await _farmAccessService.GetAccessAsync(farmId, firebaseUid, cancellationToken);
        var owner = access.Owner ?? await _producerRepository.GetByIdAsync(access.Farm.ProducerId, cancellationToken);
        var team = (await _farmMemberRepository.GetActiveByFarmAsync(farmId, cancellationToken)).ToList();

        return Map(access.Farm, owner, access.IsOwner ? OwnerRole : MemberRole, access.Membership, team, includeContacts: true);
    }

    private async Task<Dictionary<Guid, List<FarmMember>>> TeamsByFarmAsync(IReadOnlyCollection<Guid> farmIds, CancellationToken cancellationToken)
    {
        var members = await _farmMemberRepository.GetActiveByFarmsAsync(farmIds, cancellationToken);
        return members.GroupBy(m => m.FarmId).ToDictionary(g => g.Key, g => g.ToList());
    }

    private static WorkspaceResponse Map(
        Farm farm,
        Producer? owner,
        string viewerRole,
        FarmMember? membership,
        List<FarmMember> team,
        bool includeContacts)
    {
        var isOwner = viewerRole == OwnerRole;

        return new WorkspaceResponse
        {
            FarmId = farm.Id,
            PublicId = farm.PublicId,
            Name = farm.Name,
            Description = farm.Description,
            TotalHectares = farm.TotalHectares,
            CreatedAt = farm.CreatedAt,
            ArchivedAt = farm.ArchivedAt,
            LocationCoordinates = GeometryHelper.ToCoordinateDtos(farm.Location),
            Province = farm.Province,
            Department = farm.Department,
            Locality = farm.Locality,
            ProducerId = farm.ProducerId,
            ProducerName = owner != null ? $"{owner.FirstName} {owner.LastName}".Trim() : string.Empty,
            ViewerRole = viewerRole,
            MyMemberId = membership?.Id,
            // El profesional del equipo tiene un match aceptado con el productor: ve su contacto.
            ProducerContact = includeContacts && !isOwner && owner != null
                ? new FarmContactResponse { PhoneNumber = owner.PhoneNumber, Email = owner.Email }
                : null,
            Members = team
                .Where(m => m.Professional != null)
                .Select(m => FarmMemberMapper.ToResponse(m, m.Professional!, includeContact: includeContacts && isOwner))
                .ToList()
        };
    }
}
