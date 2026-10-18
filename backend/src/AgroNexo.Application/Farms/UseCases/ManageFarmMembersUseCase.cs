using AgroNexo.Application.Farms.DTOs;
using AgroNexo.Application.Farms.Services;
using AgroNexo.Domain.Entities;
using AgroNexo.Domain.Enums;
using AgroNexo.Domain.Exceptions;
using AgroNexo.Domain.Interfaces;

namespace AgroNexo.Application.Farms.UseCases;

/// <summary>
/// Altas y bajas del equipo de un campo. Solo se entra con un match aceptado con el productor; el productor invita y
/// desvincula, y el profesional se puede ir cuando quiera.
/// </summary>
public class ManageFarmMembersUseCase : IManageFarmMembersUseCase
{
    private readonly IFarmAccessService _farmAccessService;
    private readonly IFarmMemberRepository _farmMemberRepository;
    private readonly IMatchRepository _matchRepository;
    private readonly IProfessionalRepository _professionalRepository;
    private readonly IUnitOfWork _unitOfWork;

    public ManageFarmMembersUseCase(
        IFarmAccessService farmAccessService,
        IFarmMemberRepository farmMemberRepository,
        IMatchRepository matchRepository,
        IProfessionalRepository professionalRepository,
        IUnitOfWork unitOfWork)
    {
        _farmAccessService = farmAccessService;
        _farmMemberRepository = farmMemberRepository;
        _matchRepository = matchRepository;
        _professionalRepository = professionalRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<FarmMemberResponse> AddAsync(
        Guid farmId,
        AddFarmMemberRequest request,
        string firebaseUid,
        CancellationToken cancellationToken = default)
    {
        if (request == null) throw new ArgumentNullException(nameof(request));
        if (request.ProfessionalId == Guid.Empty)
            throw new DomainValidationException(nameof(request.ProfessionalId), "El profesional es obligatorio.");

        var access = await _farmAccessService.GetOwnerAccessAsync(farmId, firebaseUid, cancellationToken);
        access.Farm.EnsureNotArchived();

        var professional = await _professionalRepository.GetByIdAcrossTenantsAsync(request.ProfessionalId, cancellationToken)
            ?? throw new EntityNotFoundException("Profesional", request.ProfessionalId);

        // Doble opt-in: nadie entra a un campo sin haber aceptado antes un match con ese productor.
        var activeMatch = (await _matchRepository.GetByFiltersAsync(
                access.Farm.ProducerId, professional.Id, MatchStatus.Active, 1, 1, cancellationToken))
            .FirstOrDefault()
            ?? throw new DomainException("Solo podés sumar a profesionales que aceptaron una solicitud tuya.");

        if (await _farmMemberRepository.GetActiveAsync(farmId, professional.Id, cancellationToken) != null)
            throw new DuplicateFarmMemberException(farmId, professional.Id);

        var member = new FarmMember(farmId, professional.Id, activeMatch.Id);
        await _farmMemberRepository.AddAsync(member, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return FarmMemberMapper.ToResponse(member, professional, includeContact: true);
    }

    public async Task RemoveAsync(Guid farmId, Guid memberId, string firebaseUid, CancellationToken cancellationToken = default)
    {
        var access = await _farmAccessService.GetOwnerAccessAsync(farmId, firebaseUid, cancellationToken);
        access.Farm.EnsureNotArchived();

        var member = await _farmMemberRepository.GetByIdAsync(memberId, cancellationToken);
        if (member == null || member.FarmId != farmId || !member.IsActive)
            throw new EntityNotFoundException("Miembro del equipo", memberId);

        member.Remove();
        await _farmMemberRepository.UpdateAsync(member, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }

    public async Task LeaveAsync(Guid farmId, string firebaseUid, CancellationToken cancellationToken = default)
    {
        var access = await _farmAccessService.GetMemberAccessAsync(farmId, firebaseUid, cancellationToken);
        var member = access.Membership!;

        member.Leave();
        await _farmMemberRepository.UpdateAsync(member, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}
