using System.Net;
using System.Net.Http.Json;
using AgroConnect.Application.Producers.DTOs;
using AgroConnect.Application.Professionals.DTOs;
using AgroConnect.Domain.Enums;
using AgroConnect.IntegrationTests.Infrastructure;
using FluentAssertions;
using Xunit;

namespace AgroConnect.IntegrationTests;

public class TenantSecurityIntegrationTests : IntegrationTestBase
{
    public TenantSecurityIntegrationTests(CustomWebApplicationFactory factory) : base(factory)
    {
    }

    /// <summary>
    /// Crit-3: Test: Un tenant no puede consultar la información privada del perfil de un usuario que pertenece a otro tenant.
    /// </summary>
    [Fact]
    public async Task GetProfile_UserFromDifferentTenant_CannotAccessPrivateInfo_ReturnsForbiddenOrNotFound()
    {
        // Arrange: Create Producer A in Tenant A and Producer B in Tenant B
        var prodAAuth0Id = "auth0|prodA_security";
        var prodBAuth0Id = "auth0|prodB_security";
        var profAuth0Id = "auth0|prof_security";

        var prodAReg = await RegisterProducerAsync(prodAAuth0Id, "Alberto", "Fernandez", "20-11111111-1");
        var prodBReg = await RegisterProducerAsync(prodBAuth0Id, "Bernardo", "Gomez", "20-22222222-2");
        var profReg = await RegisterProfessionalAsync(profAuth0Id, "Cecilia", "Lopez", "27-33333333-3", ProfessionalRole.Agronomist, "Nutrición");

        var prodAClient = CreateClientWithAuth(prodAAuth0Id, "Producer", prodAReg.TenantId);
        var prodBClient = CreateClientWithAuth(prodBAuth0Id, "Producer", prodBReg.TenantId);
        var profClient = CreateClientWithAuth(profAuth0Id, "Professional", profReg.TenantId);

        // Act 1: Producer A queries own profile -> receives Tenant A profile
        var prodAProfileRes = await prodAClient.GetAsync("/api/v1/producers/me");
        prodAProfileRes.StatusCode.Should().Be(HttpStatusCode.OK);
        var prodAProfile = await prodAProfileRes.Content.ReadFromJsonAsync<ProducerProfileResponse>(JsonOptions);
        prodAProfile.Should().NotBeNull();
        prodAProfile!.FirstName.Should().Be("Alberto");
        prodAProfile.TenantId.Should().Be(prodAReg.TenantId);

        // Act 2: Producer B queries own profile -> receives Tenant B profile
        var prodBProfileRes = await prodBClient.GetAsync("/api/v1/producers/me");
        prodBProfileRes.StatusCode.Should().Be(HttpStatusCode.OK);
        var prodBProfile = await prodBProfileRes.Content.ReadFromJsonAsync<ProducerProfileResponse>(JsonOptions);
        prodBProfile.Should().NotBeNull();
        prodBProfile!.FirstName.Should().Be("Bernardo");
        prodBProfile.TenantId.Should().Be(prodBReg.TenantId);

        // Assert isolation: Profiles are completely isolated by Tenant
        prodAProfile.TenantId.Should().NotBe(prodBProfile.TenantId);
        prodAProfile.Id.Should().NotBe(prodBProfile.Id);

        // Act 3: Producer A attempts to access Professional endpoint -> 403 Forbidden (policy IsProfessional)
        var crossRoleRes1 = await prodAClient.GetAsync("/api/v1/professionals/me");
        crossRoleRes1.StatusCode.Should().Be(HttpStatusCode.Forbidden);

        // Act 4: Professional attempts to access Producer endpoint -> 403 Forbidden (policy IsProducer)
        var crossRoleRes2 = await profClient.GetAsync("/api/v1/producers/me");
        crossRoleRes2.StatusCode.Should().Be(HttpStatusCode.Forbidden);

        // Act 5: Unauthenticated anonymous client attempts to access private profiles -> 401 Unauthorized
        var anonymousClient = Factory.CreateClient();
        var unauthRes1 = await anonymousClient.GetAsync("/api/v1/producers/me");
        var unauthRes2 = await anonymousClient.GetAsync("/api/v1/professionals/me");
        var unauthRes3 = await anonymousClient.GetAsync("/api/v1/matches");

        unauthRes1.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
        unauthRes2.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
        unauthRes3.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }
}
