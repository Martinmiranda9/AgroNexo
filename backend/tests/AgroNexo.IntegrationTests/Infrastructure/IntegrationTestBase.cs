using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;
using AgroNexo.Application.Identity.DTOs;
using AgroNexo.Application.Matching.DTOs;
using AgroNexo.Application.Producers.DTOs;
using AgroNexo.Application.Professionals.DTOs;
using AgroNexo.Domain.Enums;
using Xunit;

namespace AgroNexo.IntegrationTests.Infrastructure;

public abstract class IntegrationTestBase : IClassFixture<CustomWebApplicationFactory>, IAsyncLifetime
{
    protected readonly CustomWebApplicationFactory Factory;
    protected readonly JsonSerializerOptions JsonOptions;

    protected IntegrationTestBase(CustomWebApplicationFactory factory)
    {
        Factory = factory;
        JsonOptions = new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true,
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        };
        JsonOptions.Converters.Add(new JsonStringEnumConverter());
    }

    public virtual async Task InitializeAsync()
    {
        await Factory.ResetDatabaseAsync();
    }

    public virtual Task DisposeAsync()
    {
        return Task.CompletedTask;
    }

    protected HttpClient CreateClientWithAuth(string auth0UserId, string role = "Producer", Guid? tenantId = null)
    {
        return Factory.CreateAuthenticatedClient(auth0UserId, role, tenantId);
    }

    protected async Task<RegisterUserResponse> RegisterProducerAsync(
        string auth0UserId,
        string firstName = "Juan",
        string lastName = "Perez",
        string docNumber = "20-12345678-9")
    {
        var client = CreateClientWithAuth(auth0UserId, "Producer");
        var request = new RegisterUserRequest
        {
            UserType = UserType.Producer,
            FirstName = firstName,
            LastName = lastName,
            DocumentNumber = docNumber,
            PhoneNumber = "+5493511234567"
        };

        var response = await client.PostAsJsonAsync("/api/v1/identity/register", request, JsonOptions);
        response.EnsureSuccessStatusCode();

        var result = await response.Content.ReadFromJsonAsync<RegisterUserResponse>(JsonOptions);
        return result!;
    }

    protected async Task<RegisterUserResponse> RegisterProfessionalAsync(
        string auth0UserId,
        string firstName = "Maria",
        string lastName = "Gomez",
        string docNumber = "27-87654321-4",
        ProfessionalRole role = ProfessionalRole.Agronomist,
        string specialty = "Nutrición de Suelos",
        int experience = 8,
        int maxCapacity = 20)
    {
        var client = CreateClientWithAuth(auth0UserId, "Professional");
        var request = new RegisterUserRequest
        {
            UserType = UserType.Professional,
            FirstName = firstName,
            LastName = lastName,
            DocumentNumber = docNumber,
            Role = role,
            Specialty = specialty,
            YearsExperience = experience,
            MaxCapacity = maxCapacity,
            PhoneNumber = "+5493511234567",
            LicenseNumber = "MP-12345"
        };

        var response = await client.PostAsJsonAsync("/api/v1/identity/register", request, JsonOptions);
        response.EnsureSuccessStatusCode();

        var result = await response.Content.ReadFromJsonAsync<RegisterUserResponse>(JsonOptions);
        return result!;
    }
}
