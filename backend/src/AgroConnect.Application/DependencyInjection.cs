using AgroConnect.Application.Common.Interfaces;
using AgroConnect.Application.Common.Validators;
using AgroConnect.Application.Identity.UseCases;
using AgroConnect.Application.Farms.UseCases;
using AgroConnect.Application.Matching.ScoringEngine;
using AgroConnect.Application.Matching.UseCases;
using AgroConnect.Application.Producers.UseCases;
using AgroConnect.Application.Professionals.UseCases;
using Microsoft.Extensions.DependencyInjection;

namespace AgroConnect.Application;

/// <summary>
/// Service collection extension methods for configuring Application layer dependencies.
/// </summary>
public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        // Ownership Validator
        services.AddScoped<IOwnershipValidator, OwnershipValidator>();

        // Scoring Engine
        services.AddSingleton<IScoringEngine, ScoringEngine>();

        // Identity Use Cases
        services.AddScoped<IRegisterUserUseCase, RegisterUserUseCase>();

        // Producer Use Cases
        services.AddScoped<IGetProducerProfileUseCase, GetProducerProfileUseCase>();
        services.AddScoped<IUpdateProducerProfileUseCase, UpdateProducerProfileUseCase>();

        // Professional Use Cases
        services.AddScoped<IGetProfessionalProfileUseCase, GetProfessionalProfileUseCase>();
        services.AddScoped<IUpdateProfessionalProfileUseCase, UpdateProfessionalProfileUseCase>();

        // Farm Use Cases
        services.AddScoped<ICreateFarmUseCase, CreateFarmUseCase>();
        services.AddScoped<IGetFarmsUseCase, GetFarmsUseCase>();
        services.AddScoped<IUpdateFarmUseCase, UpdateFarmUseCase>();
        services.AddScoped<IDeleteFarmUseCase, DeleteFarmUseCase>();

        // Matching Use Cases
        services.AddScoped<IGenerateMatchRecommendationsUseCase, GenerateMatchRecommendationsUseCase>();
        services.AddScoped<IGetMatchRecommendationsUseCase, GetMatchRecommendationsUseCase>();
        services.AddScoped<ICreateMatchUseCase, CreateMatchUseCase>();
        services.AddScoped<IGetMatchesUseCase, GetMatchesUseCase>();
        services.AddScoped<IUpdateMatchStatusUseCase, UpdateMatchStatusUseCase>();

        return services;
    }
}
