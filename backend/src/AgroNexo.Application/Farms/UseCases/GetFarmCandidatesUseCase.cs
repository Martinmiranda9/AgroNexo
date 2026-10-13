using AgroNexo.Application.Farms.DTOs;
using AgroNexo.Application.Farms.Services;
using AgroNexo.Domain.Enums;
using AgroNexo.Domain.Interfaces;

namespace AgroNexo.Application.Farms.UseCases;

/// <summary>
/// Profesionales que el productor puede sumar a un campo: los de sus matches aceptados que todavía no están en el equipo.
/// </summary>
public class GetFarmCandidatesUseCase : IGetFarmCandidatesUseCase
{
    // Un productor no llega a tener cientos de matches activos; si pasa, se pagina.
    private const int MaxActiveMatches = 200;

    private readonly IFarmAccessService _farmAccessService;
    private readonly IMatchRepository _matchRepository;
    private readonly IFarmMemberRepository _farmMemberRepository;
    private readonly IProfessionalRepository _professionalRepository;

    public GetFarmCandidatesUseCase(
        IFarmAccessService farmAccessService,
        IMatchRepository matchRepository,
        IFarmMemberRepository farmMemberRepository,
        IProfessionalRepository professionalRepository)
    {
        _farmAccessService = farmAccessService;
        _matchRepository = matchRepository;
        _farmMemberRepository = farmMemberRepository;
        _professionalRepository = professionalRepository;
    }

    public async Task<IReadOnlyList<FarmCandidateResponse>> ExecuteAsync(
        Guid farmId,
        ProfessionalRole? role,
        string auth0UserId,
        CancellationToken cancellationToken = default)
    {
        var access = await _farmAccessService.GetOwnerAccessAsync(farmId, auth0UserId, cancellationToken);
        if (access.Farm.IsArchived)
            return Array.Empty<FarmCandidateResponse>();

        var activeMatches = await _matchRepository.GetByFiltersAsync(
            access.Farm.ProducerId, null, MatchStatus.Active, 1, MaxActiveMatches, cancellationToken);

        var members = await _farmMemberRepository.GetActiveByFarmAsync(farmId, cancellationToken);
        var memberIds = members.Select(m => m.ProfessionalId).ToHashSet();

        var candidates = new List<FarmCandidateResponse>();
        foreach (var match in activeMatches.Where(m => !memberIds.Contains(m.ProfessionalId)))
        {
            var professional = match.Professional
                ?? await _professionalRepository.GetByIdAcrossTenantsAsync(match.ProfessionalId, cancellationToken);
            if (professional == null || !professional.IsActive)
                continue;
            if (role.HasValue && professional.Role != role.Value)
                continue;

            candidates.Add(new FarmCandidateResponse
            {
                ProfessionalId = professional.Id,
                PublicId = professional.PublicId,
                FirstName = professional.FirstName,
                LastName = professional.LastName,
                Role = professional.Role,
                Specialty = professional.Specialty,
                LicenseNumber = professional.LicenseNumber,
                IsVerified = professional.IsVerified,
                YearsExperience = professional.YearsExperience,
                MatchedAt = match.RespondedAt
            });
        }

        return candidates
            .OrderBy(c => c.Role)
            .ThenBy(c => c.LastName)
            .ThenBy(c => c.FirstName)
            .ToList();
    }
}
