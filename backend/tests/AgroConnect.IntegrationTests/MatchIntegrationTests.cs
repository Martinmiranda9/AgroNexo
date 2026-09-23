using System.Net;
using System.Net.Http.Json;
using AgroConnect.Application.Matching.DTOs;
using AgroConnect.Domain.Enums;
using AgroConnect.IntegrationTests.Infrastructure;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc;
using Xunit;

namespace AgroConnect.IntegrationTests;

public class MatchIntegrationTests : IntegrationTestBase
{
    public MatchIntegrationTests(CustomWebApplicationFactory factory) : base(factory)
    {
    }

    /// <summary>
    /// Crit-1: Test: Crear dos Match activos para el mismo productor con distinto profesional y misma especialidad retorna HTTP 201 en ambos.
    /// </summary>
    [Fact]
    public async Task CreateMatch_TwoActiveMatches_SameProducer_DifferentProfessionals_SameSpecialty_Returns201Both()
    {
        // Arrange
        const string specialty = "Nutrición de Suelos";
        var producerAuth0Id = "auth0|producer_crit1";
        var prof1Auth0Id = "auth0|prof1_crit1";
        var prof2Auth0Id = "auth0|prof2_crit1";

        var producerReg = await RegisterProducerAsync(producerAuth0Id, "Esteban", "Bauer", "20-33445566-7");
        var prof1Reg = await RegisterProfessionalAsync(prof1Auth0Id, "Maria", "Gomez", "27-11111111-1", ProfessionalRole.Agronomist, specialty, 10, 20);
        var prof2Reg = await RegisterProfessionalAsync(prof2Auth0Id, "Lucas", "Diaz", "20-22222222-2", ProfessionalRole.Agronomist, specialty, 6, 20);

        var producerClient = CreateClientWithAuth(producerAuth0Id, "Producer", producerReg.TenantId);
        var prof1Client = CreateClientWithAuth(prof1Auth0Id, "Professional", prof1Reg.TenantId);
        var prof2Client = CreateClientWithAuth(prof2Auth0Id, "Professional", prof2Reg.TenantId);

        // Act 1: Producer creates Match with Professional 1
        var createMatch1Req = new CreateMatchRequest { ProfessionalId = prof1Reg.UserId };
        var match1Response = await producerClient.PostAsJsonAsync("/api/v1/matches", createMatch1Req, JsonOptions);

        // Act 2: Producer creates Match with Professional 2 (same specialty)
        var createMatch2Req = new CreateMatchRequest { ProfessionalId = prof2Reg.UserId };
        var match2Response = await producerClient.PostAsJsonAsync("/api/v1/matches", createMatch2Req, JsonOptions);

        // Assert 1: Both Match creations return HTTP 201 Created
        match1Response.StatusCode.Should().Be(HttpStatusCode.Created);
        match2Response.StatusCode.Should().Be(HttpStatusCode.Created);

        var match1 = await match1Response.Content.ReadFromJsonAsync<MatchResponse>(JsonOptions);
        var match2 = await match2Response.Content.ReadFromJsonAsync<MatchResponse>(JsonOptions);

        match1.Should().NotBeNull();
        match1!.ProducerId.Should().Be(producerReg.UserId);
        match1.ProfessionalId.Should().Be(prof1Reg.UserId);
        match1.Specialty.Should().Be(specialty);
        match1.Status.Should().Be(MatchStatus.Pending);

        match2.Should().NotBeNull();
        match2!.ProducerId.Should().Be(producerReg.UserId);
        match2.ProfessionalId.Should().Be(prof2Reg.UserId);
        match2.Specialty.Should().Be(specialty);
        match2.Status.Should().Be(MatchStatus.Pending);

        // Act 3: Both professionals accept their respective matches to make them active
        var acceptReq = new UpdateMatchStatusRequest { Status = MatchStatus.Active };
        
        var accept1Res = await prof1Client.PatchAsJsonAsync($"/api/v1/matches/{match1.Id}/status", acceptReq, JsonOptions);
        var accept2Res = await prof2Client.PatchAsJsonAsync($"/api/v1/matches/{match2.Id}/status", acceptReq, JsonOptions);

        accept1Res.StatusCode.Should().Be(HttpStatusCode.OK);
        accept2Res.StatusCode.Should().Be(HttpStatusCode.OK);

        var updatedMatch1 = await accept1Res.Content.ReadFromJsonAsync<MatchResponse>(JsonOptions);
        var updatedMatch2 = await accept2Res.Content.ReadFromJsonAsync<MatchResponse>(JsonOptions);

        updatedMatch1!.Status.Should().Be(MatchStatus.Active);
        updatedMatch2!.Status.Should().Be(MatchStatus.Active);

        // Act 4: Producer queries matches
        var getMatchesRes = await producerClient.GetAsync("/api/v1/matches");
        getMatchesRes.StatusCode.Should().Be(HttpStatusCode.OK);
        var pagedMatches = await getMatchesRes.Content.ReadFromJsonAsync<AgroConnect.Application.Common.Models.PagedResult<MatchResponse>>(JsonOptions);

        pagedMatches.Should().NotBeNull();
        pagedMatches!.TotalCount.Should().Be(2);
        pagedMatches.Items.Should().Contain(m => m.ProfessionalId == prof1Reg.UserId && m.Status == MatchStatus.Active);
        pagedMatches.Items.Should().Contain(m => m.ProfessionalId == prof2Reg.UserId && m.Status == MatchStatus.Active);
    }

    /// <summary>
    /// Crit-2: Test: Intentar crear un Match duplicado contra el mismo par (ProducerId, ProfessionalId) en estado Pending/Active retorna HTTP 409 Conflict.
    /// </summary>
    [Fact]
    public async Task CreateMatch_DuplicateActiveOrPendingPair_Returns409Conflict()
    {
        // Arrange
        var producerAuth0Id = "auth0|producer_crit2";
        var profAuth0Id = "auth0|prof_crit2";

        var producerReg = await RegisterProducerAsync(producerAuth0Id, "Santiago", "Morales", "20-44556677-8");
        var profReg = await RegisterProfessionalAsync(profAuth0Id, "Valeria", "Rios", "27-99887766-3", ProfessionalRole.Agronomist, "Riego por Aspersión");

        var producerClient = CreateClientWithAuth(producerAuth0Id, "Producer", producerReg.TenantId);
        var profClient = CreateClientWithAuth(profAuth0Id, "Professional", profReg.TenantId);

        // Act 1: First Match creation -> Returns 201 Created (Pending)
        var createMatchReq = new CreateMatchRequest { ProfessionalId = profReg.UserId };
        var firstResponse = await producerClient.PostAsJsonAsync("/api/v1/matches", createMatchReq, JsonOptions);
        firstResponse.StatusCode.Should().Be(HttpStatusCode.Created);
        var firstMatch = await firstResponse.Content.ReadFromJsonAsync<MatchResponse>(JsonOptions);
        firstMatch!.Status.Should().Be(MatchStatus.Pending);

        // Act 2: Attempt duplicate Match creation while first match is in PENDING status
        var duplicatePendingResponse = await producerClient.PostAsJsonAsync("/api/v1/matches", createMatchReq, JsonOptions);

        // Assert 2: Returns HTTP 409 Conflict with RFC 7807 ProblemDetails
        duplicatePendingResponse.StatusCode.Should().Be(HttpStatusCode.Conflict);
        var problemDetails1 = await duplicatePendingResponse.Content.ReadFromJsonAsync<ProblemDetails>(JsonOptions);
        problemDetails1.Should().NotBeNull();
        problemDetails1!.Status.Should().Be((int)HttpStatusCode.Conflict);
        problemDetails1.Title.Should().Contain("Conflicto de duplicidad");
        problemDetails1.Detail.Should().Contain("Ya existe una solicitud o vínculo de Match pendiente o activo");

        // Act 3: Professional accepts match -> Status transitions to ACTIVE
        var acceptReq = new UpdateMatchStatusRequest { Status = MatchStatus.Active };
        var acceptRes = await profClient.PatchAsJsonAsync($"/api/v1/matches/{firstMatch.Id}/status", acceptReq, JsonOptions);
        acceptRes.StatusCode.Should().Be(HttpStatusCode.OK);

        // Act 4: Attempt duplicate Match creation while match is in ACTIVE status
        var duplicateActiveResponse = await producerClient.PostAsJsonAsync("/api/v1/matches", createMatchReq, JsonOptions);

        // Assert 4: Returns HTTP 409 Conflict with RFC 7807 ProblemDetails
        duplicateActiveResponse.StatusCode.Should().Be(HttpStatusCode.Conflict);
        var problemDetails2 = await duplicateActiveResponse.Content.ReadFromJsonAsync<ProblemDetails>(JsonOptions);
        problemDetails2.Should().NotBeNull();
        problemDetails2!.Status.Should().Be((int)HttpStatusCode.Conflict);
        problemDetails2.Title.Should().Contain("Conflicto de duplicidad");
    }
}
