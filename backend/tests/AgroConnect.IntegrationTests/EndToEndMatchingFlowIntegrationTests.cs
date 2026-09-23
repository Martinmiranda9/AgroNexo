using System.Net;
using System.Net.Http.Json;
using AgroConnect.Application.Common.DTOs;
using AgroConnect.Application.Common.Models;
using AgroConnect.Application.Identity.DTOs;
using AgroConnect.Application.Matching.DTOs;
using AgroConnect.Application.Professionals.DTOs;
using AgroConnect.Domain.Enums;
using AgroConnect.IntegrationTests.Infrastructure;
using FluentAssertions;
using Xunit;

namespace AgroConnect.IntegrationTests;

public class EndToEndMatchingFlowIntegrationTests : IntegrationTestBase
{
    public EndToEndMatchingFlowIntegrationTests(CustomWebApplicationFactory factory) : base(factory)
    {
    }

    [Fact]
    public async Task CompleteE2EFlow_FromRegistrationToMatchCompletion_Succeeds()
    {
        // -------------------------------------------------------------
        // Step 1: Register Producer
        // -------------------------------------------------------------
        var prodAuth0Id = "auth0|prod_e2e";
        var prodRegReq = new RegisterUserRequest
        {
            UserType = UserType.Producer,
            FirstName = "Gustavo",
            LastName = "Grobo",
            DocumentNumber = "20-11223344-5"
        };

        var prodClient = CreateClientWithAuth(prodAuth0Id, "Producer");
        var prodRegRes = await prodClient.PostAsJsonAsync("/api/v1/identity/register", prodRegReq, JsonOptions);
        prodRegRes.StatusCode.Should().Be(HttpStatusCode.Created);
        var prodReg = await prodRegRes.Content.ReadFromJsonAsync<RegisterUserResponse>(JsonOptions);

        prodReg.Should().NotBeNull();
        prodReg!.FirstName.Should().Be("Gustavo");
        prodReg.TenantName.Should().Be("Workspace de Gustavo Grobo");
        prodReg.TenantId.Should().NotBeEmpty();

        var authProdClient = CreateClientWithAuth(prodAuth0Id, "Producer", prodReg.TenantId);

        // -------------------------------------------------------------
        // Step 2: Register Professional
        // -------------------------------------------------------------
        var profAuth0Id = "auth0|prof_e2e";
        var profRegReq = new RegisterUserRequest
        {
            UserType = UserType.Professional,
            FirstName = "Florencia",
            LastName = "Rossi",
            DocumentNumber = "27-66778899-0",
            Role = ProfessionalRole.Agronomist,
            Specialty = "Nutrición de Suelos",
            YearsExperience = 12,
            MaxCapacity = 25
        };

        var profClient = CreateClientWithAuth(profAuth0Id, "Professional");
        var profRegRes = await profClient.PostAsJsonAsync("/api/v1/identity/register", profRegReq, JsonOptions);
        profRegRes.StatusCode.Should().Be(HttpStatusCode.Created);
        var profReg = await profRegRes.Content.ReadFromJsonAsync<RegisterUserResponse>(JsonOptions);

        profReg.Should().NotBeNull();
        profReg!.FirstName.Should().Be("Florencia");
        profReg.Specialty.Should().Be("Nutrición de Suelos");
        profReg.TenantId.Should().NotBeEmpty();

        var authProfClient = CreateClientWithAuth(profAuth0Id, "Professional", profReg.TenantId);

        // -------------------------------------------------------------
        // Step 3: Professional updates Profile & Coverage Area
        // -------------------------------------------------------------
        var updateProfReq = new UpdateProfessionalProfileRequest
        {
            FirstName = "Florencia",
            LastName = "Rossi",
            DocumentNumber = "27-66778899-0",
            Role = ProfessionalRole.Agronomist,
            Specialty = "Nutrición de Suelos",
            YearsExperience = 12,
            MaxCapacity = 25,
            CoverageAreaCoordinates = new List<CoordinateDto>
            {
                new(-31.5, -64.3),
                new(-31.2, -64.3),
                new(-31.2, -64.0),
                new(-31.5, -64.0),
                new(-31.5, -64.3)
            }
        };

        var updateProfRes = await authProfClient.PutAsJsonAsync("/api/v1/professionals/me", updateProfReq, JsonOptions);
        updateProfRes.StatusCode.Should().Be(HttpStatusCode.OK);
        var updatedProfile = await updateProfRes.Content.ReadFromJsonAsync<ProfessionalProfileResponse>(JsonOptions);
        updatedProfile!.Specialty.Should().Be("Nutrición de Suelos");

        // -------------------------------------------------------------
        // Step 4: Producer triggers Match Discovery
        // -------------------------------------------------------------
        var discoveryReq = new CreateMatchDiscoveryRequest
        {
            Latitude = -31.4167,
            Longitude = -64.1833,
            RequestedSpecialty = "Nutrición de Suelos",
            RequiresFieldPresence = true
        };

        var discoveryRes = await authProdClient.PostAsJsonAsync("/api/v1/match-discovery", discoveryReq, JsonOptions);
        discoveryRes.StatusCode.Should().Be(HttpStatusCode.Created);
        discoveryRes.Headers.Location.Should().NotBeNull();

        var discoveryResult = await discoveryRes.Content.ReadFromJsonAsync<MatchDiscoveryResponse>(JsonOptions);
        discoveryResult.Should().NotBeNull();
        discoveryResult!.ProducerId.Should().Be(prodReg.UserId);
        discoveryResult.Recommendations.Should().NotBeEmpty();

        // -------------------------------------------------------------
        // Step 5: Producer queries Recommendations endpoint
        // -------------------------------------------------------------
        var getRecsRes = await authProdClient.GetAsync($"/api/v1/match-discovery/{discoveryResult.Id}/recommendations");
        getRecsRes.StatusCode.Should().Be(HttpStatusCode.OK);
        var getRecs = await getRecsRes.Content.ReadFromJsonAsync<MatchDiscoveryResponse>(JsonOptions);
        getRecs.Should().NotBeNull();
        getRecs!.Recommendations.Should().Contain(r => r.ProfessionalId == profReg.UserId);

        // -------------------------------------------------------------
        // Step 6: Producer creates Match Invitation (POST /api/v1/matches)
        // -------------------------------------------------------------
        var createMatchReq = new CreateMatchRequest
        {
            ProfessionalId = profReg.UserId
        };

        var createMatchRes = await authProdClient.PostAsJsonAsync("/api/v1/matches", createMatchReq, JsonOptions);
        createMatchRes.StatusCode.Should().Be(HttpStatusCode.Created);
        var matchResponse = await createMatchRes.Content.ReadFromJsonAsync<MatchResponse>(JsonOptions);

        matchResponse.Should().NotBeNull();
        matchResponse!.ProducerId.Should().Be(prodReg.UserId);
        matchResponse.ProfessionalId.Should().Be(profReg.UserId);
        matchResponse.Status.Should().Be(MatchStatus.Pending);

        // -------------------------------------------------------------
        // Step 7: Professional accepts Match (PATCH /api/v1/matches/{id}/status -> Active)
        // -------------------------------------------------------------
        var acceptReq = new UpdateMatchStatusRequest { Status = MatchStatus.Active };
        var acceptRes = await authProfClient.PatchAsJsonAsync($"/api/v1/matches/{matchResponse.Id}/status", acceptReq, JsonOptions);
        acceptRes.StatusCode.Should().Be(HttpStatusCode.OK);

        var activeMatch = await acceptRes.Content.ReadFromJsonAsync<MatchResponse>(JsonOptions);
        activeMatch!.Status.Should().Be(MatchStatus.Active);
        activeMatch.RespondedAt.Should().NotBeNull();

        // -------------------------------------------------------------
        // Step 8: View Matches List (GET /api/v1/matches)
        // -------------------------------------------------------------
        var listMatchesRes = await authProdClient.GetAsync("/api/v1/matches?status=Active");
        listMatchesRes.StatusCode.Should().Be(HttpStatusCode.OK);
        var pagedMatches = await listMatchesRes.Content.ReadFromJsonAsync<PagedResult<MatchResponse>>(JsonOptions);
        pagedMatches!.TotalCount.Should().Be(1);
        pagedMatches.Items[0].Id.Should().Be(matchResponse.Id);
        pagedMatches.Items[0].Status.Should().Be(MatchStatus.Active);

        // -------------------------------------------------------------
        // Step 9: Complete Match (PATCH /api/v1/matches/{id}/status -> Completed)
        // -------------------------------------------------------------
        var completeReq = new UpdateMatchStatusRequest { Status = MatchStatus.Completed };
        var completeRes = await authProfClient.PatchAsJsonAsync($"/api/v1/matches/{matchResponse.Id}/status", completeReq, JsonOptions);
        completeRes.StatusCode.Should().Be(HttpStatusCode.OK);

        var completedMatch = await completeRes.Content.ReadFromJsonAsync<MatchResponse>(JsonOptions);
        completedMatch!.Status.Should().Be(MatchStatus.Completed);
    }
}
