using AgroNexo.Application.Identity.DTOs;

namespace AgroNexo.Application.Identity.UseCases;

/// <summary>
/// Use case interface for public user registration with automatic tenant workspace generation.
/// </summary>
public interface IRegisterUserUseCase
{
    Task<RegisterUserResponse> ExecuteAsync(RegisterUserRequest request, string auth0UserId, CancellationToken cancellationToken = default);
}
