using AgroNexo.Application.Identity.DTOs;

namespace AgroNexo.Application.Identity.UseCases;

public interface IGetCurrentUserUseCase
{
    Task<CurrentUserResponse> ExecuteAsync(string auth0UserId, CancellationToken cancellationToken = default);
}
