using AgroNexo.Domain.Exceptions;
using AgroNexo.Domain.Interfaces;

namespace AgroNexo.Application.Farms.Services;

public class FarmAccessService : IFarmAccessService
{
    private readonly IFarmRepository _farmRepository;
    private readonly IFarmMemberRepository _farmMemberRepository;
    private readonly IProducerRepository _producerRepository;
    private readonly IProfessionalRepository _professionalRepository;

    public FarmAccessService(
        IFarmRepository farmRepository,
        IFarmMemberRepository farmMemberRepository,
        IProducerRepository producerRepository,
        IProfessionalRepository professionalRepository)
    {
        _farmRepository = farmRepository;
        _farmMemberRepository = farmMemberRepository;
        _producerRepository = producerRepository;
        _professionalRepository = professionalRepository;
    }

    public async Task<FarmAccess> GetAccessAsync(Guid farmId, string firebaseUid, CancellationToken cancellationToken = default)
    {
        var access = await ResolveAsync(farmId, firebaseUid, cancellationToken);
        return access ?? throw NotFound(farmId);
    }

    public async Task<FarmAccess> GetOwnerAccessAsync(Guid farmId, string firebaseUid, CancellationToken cancellationToken = default)
    {
        var access = await ResolveAsync(farmId, firebaseUid, cancellationToken);
        return access is { IsOwner: true } ? access : throw NotFound(farmId);
    }

    public async Task<FarmAccess> GetMemberAccessAsync(Guid farmId, string firebaseUid, CancellationToken cancellationToken = default)
    {
        var access = await ResolveAsync(farmId, firebaseUid, cancellationToken);
        return access is { Membership: not null } ? access : throw NotFound(farmId);
    }

    private async Task<FarmAccess?> ResolveAsync(Guid farmId, string firebaseUid, CancellationToken cancellationToken)
    {
        if (farmId == Guid.Empty || string.IsNullOrWhiteSpace(firebaseUid))
            return null;

        var farm = await _farmRepository.GetByIdAcrossTenantsAsync(farmId, cancellationToken);
        if (farm == null)
            return null;

        var producer = await _producerRepository.GetByFirebaseUidAsync(firebaseUid, cancellationToken);
        if (producer != null)
            return producer.Id == farm.ProducerId ? new FarmAccess(farm, producer, null, null) : null;

        var professional = await _professionalRepository.GetByFirebaseUidAsync(firebaseUid, cancellationToken);
        if (professional == null)
            return null;

        var membership = await _farmMemberRepository.GetActiveAsync(farm.Id, professional.Id, cancellationToken);
        return membership != null ? new FarmAccess(farm, null, professional, membership) : null;
    }

    private static EntityNotFoundException NotFound(Guid farmId) => new("Campo", farmId);
}
