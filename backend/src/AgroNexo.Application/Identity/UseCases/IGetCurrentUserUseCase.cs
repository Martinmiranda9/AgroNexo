using AgroNexo.Application.Identity.DTOs;

namespace AgroNexo.Application.Identity.UseCases;

public interface IGetCurrentUserUseCase
{
    Task<CurrentUserResponse> ExecuteAsync(string firebaseUid, CancellationToken cancellationToken = default);
}
