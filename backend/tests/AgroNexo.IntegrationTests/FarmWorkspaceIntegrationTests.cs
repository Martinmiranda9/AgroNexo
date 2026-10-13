using System.Net;
using System.Net.Http.Json;
using AgroNexo.Application.Farms.DTOs;
using AgroNexo.Application.Identity.DTOs;
using AgroNexo.Application.Matching.DTOs;
using AgroNexo.Domain.Enums;
using AgroNexo.IntegrationTests.Infrastructure;
using FluentAssertions;
using Xunit;

namespace AgroNexo.IntegrationTests;

/// <summary>
/// Equipo del campo: solo se entra con un match aceptado, cada uno ve los contactos que le corresponden y quien no es
/// del equipo recibe 404, nunca el campo.
/// </summary>
public class FarmWorkspaceIntegrationTests : IntegrationTestBase
{
    public FarmWorkspaceIntegrationTests(CustomWebApplicationFactory factory) : base(factory)
    {
    }

    [Fact]
    public async Task AddMember_WithPendingMatch_Returns400()
    {
        var producer = await ProducerAsync("auth0|ws_pending_prod");
        var prof = await ProfessionalAsync("auth0|ws_pending_prof", ProfessionalRole.Lawyer);
        (await producer.Client.PostAsJsonAsync("/api/v1/matches", new CreateMatchRequest { ProfessionalId = prof.Id }, JsonOptions))
            .StatusCode.Should().Be(HttpStatusCode.Created);
        var farm = await CreateFarmAsync(producer.Client, "La Esperanza");

        var res = await producer.Client.PostAsJsonAsync($"/api/v1/farms/{farm.Id}/members", new AddFarmMemberRequest { ProfessionalId = prof.Id }, JsonOptions);

        res.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task AddMember_WithAcceptedMatch_ProfessionalOfAnotherTenantSeesTheFarmAndEachSideOnlyTheirContacts()
    {
        var producer = await ProducerAsync("auth0|ws_ok_prod");
        var prof = await ProfessionalAsync("auth0|ws_ok_prof", ProfessionalRole.Agronomist);
        await AcceptedMatchAsync(producer, prof);
        var farm = await CreateFarmAsync(producer.Client, "La Esperanza", "Campo de 350 ha en Berrotarán");

        var addRes = await producer.Client.PostAsJsonAsync($"/api/v1/farms/{farm.Id}/members", new AddFarmMemberRequest { ProfessionalId = prof.Id }, JsonOptions);
        addRes.StatusCode.Should().Be(HttpStatusCode.Created);

        // El profesional ve el campo en su lista, liviana y sin contactos
        var list = await prof.Client.GetFromJsonAsync<List<WorkspaceResponse>>("/api/v1/workspaces", JsonOptions);
        var listed = list.Should().ContainSingle().Subject;
        listed.FarmId.Should().Be(farm.Id);
        listed.Description.Should().Be("Campo de 350 ha en Berrotarán");
        listed.ViewerRole.Should().Be("Member");
        listed.ProducerContact.Should().BeNull();

        // En el detalle ve el contacto del productor, no el suyo propio
        var forProf = await prof.Client.GetFromJsonAsync<WorkspaceResponse>($"/api/v1/workspaces/{farm.Id}", JsonOptions);
        forProf!.ProducerContact.Should().NotBeNull();
        forProf.MyMemberId.Should().NotBeNull();
        forProf.Members.Should().ContainSingle().Which.Contact.Should().BeNull();

        // El productor ve el contacto del profesional
        var forProducer = await producer.Client.GetFromJsonAsync<WorkspaceResponse>($"/api/v1/workspaces/{farm.Id}", JsonOptions);
        forProducer!.ViewerRole.Should().Be("Owner");
        forProducer.ProducerContact.Should().BeNull();
        var member = forProducer.Members.Should().ContainSingle().Subject;
        member.Contact.Should().NotBeNull();
        member.LicenseNumber.Should().Be("MP-12345");
    }

    [Fact]
    public async Task Candidates_ListAcceptedMatchesNotInTheTeam_FilteredByRole()
    {
        var producer = await ProducerAsync("auth0|ws_cand_prod");
        var lawyer = await ProfessionalAsync("auth0|ws_cand_lawyer", ProfessionalRole.Lawyer);
        var accountant = await ProfessionalAsync("auth0|ws_cand_acc", ProfessionalRole.Accountant);
        await AcceptedMatchAsync(producer, lawyer);
        await AcceptedMatchAsync(producer, accountant);
        var farm = await CreateFarmAsync(producer.Client, "El Ombú");

        var lawyers = await producer.Client.GetFromJsonAsync<List<FarmCandidateResponse>>($"/api/v1/farms/{farm.Id}/candidates?role=Lawyer", JsonOptions);
        lawyers.Should().ContainSingle().Which.ProfessionalId.Should().Be(lawyer.Id);

        (await producer.Client.PostAsJsonAsync($"/api/v1/farms/{farm.Id}/members", new AddFarmMemberRequest { ProfessionalId = lawyer.Id }, JsonOptions))
            .StatusCode.Should().Be(HttpStatusCode.Created);

        var remaining = await producer.Client.GetFromJsonAsync<List<FarmCandidateResponse>>($"/api/v1/farms/{farm.Id}/candidates", JsonOptions);
        remaining.Should().ContainSingle().Which.ProfessionalId.Should().Be(accountant.Id);
    }

    [Fact]
    public async Task AddMember_Twice_Returns409()
    {
        var producer = await ProducerAsync("auth0|ws_dup_prod");
        var prof = await ProfessionalAsync("auth0|ws_dup_prof", ProfessionalRole.Accountant);
        await AcceptedMatchAsync(producer, prof);
        var farm = await CreateFarmAsync(producer.Client, "Santa Rosa");
        var body = new AddFarmMemberRequest { ProfessionalId = prof.Id };

        (await producer.Client.PostAsJsonAsync($"/api/v1/farms/{farm.Id}/members", body, JsonOptions)).StatusCode.Should().Be(HttpStatusCode.Created);
        var second = await producer.Client.PostAsJsonAsync($"/api/v1/farms/{farm.Id}/members", body, JsonOptions);

        second.StatusCode.Should().Be(HttpStatusCode.Conflict);
    }

    [Fact]
    public async Task GetWorkspace_OutsidersGet404()
    {
        var producer = await ProducerAsync("auth0|ws_out_prod");
        var farm = await CreateFarmAsync(producer.Client, "La Aurora");
        var otherProducer = await ProducerAsync("auth0|ws_out_other");
        var outsider = await ProfessionalAsync("auth0|ws_out_prof", ProfessionalRole.Agronomist);

        (await otherProducer.Client.GetAsync($"/api/v1/workspaces/{farm.Id}")).StatusCode.Should().Be(HttpStatusCode.NotFound);
        (await outsider.Client.GetAsync($"/api/v1/workspaces/{farm.Id}")).StatusCode.Should().Be(HttpStatusCode.NotFound);
        (await otherProducer.Client.GetAsync($"/api/v1/farms/{farm.Id}/candidates")).StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task Leave_And_Remove_EndTheProfessionalsAccess()
    {
        var producer = await ProducerAsync("auth0|ws_end_prod");
        var leaving = await ProfessionalAsync("auth0|ws_end_leave", ProfessionalRole.Agronomist);
        var removed = await ProfessionalAsync("auth0|ws_end_removed", ProfessionalRole.Lawyer);
        await AcceptedMatchAsync(producer, leaving);
        await AcceptedMatchAsync(producer, removed);
        var farm = await CreateFarmAsync(producer.Client, "Don Pedro");
        await AddMemberAsync(producer, farm.Id, leaving.Id);
        var removedMember = await AddMemberAsync(producer, farm.Id, removed.Id);

        (await leaving.Client.DeleteAsync($"/api/v1/farms/{farm.Id}/members/me")).StatusCode.Should().Be(HttpStatusCode.NoContent);
        (await producer.Client.DeleteAsync($"/api/v1/farms/{farm.Id}/members/{removedMember.Id}")).StatusCode.Should().Be(HttpStatusCode.NoContent);

        (await leaving.Client.GetAsync($"/api/v1/workspaces/{farm.Id}")).StatusCode.Should().Be(HttpStatusCode.NotFound);
        (await removed.Client.GetAsync($"/api/v1/workspaces/{farm.Id}")).StatusCode.Should().Be(HttpStatusCode.NotFound);
        var forProducer = await producer.Client.GetFromJsonAsync<WorkspaceResponse>($"/api/v1/workspaces/{farm.Id}", JsonOptions);
        forProducer!.Members.Should().BeEmpty();

        // Quien se fue puede volver a ser invitado
        (await producer.Client.PostAsJsonAsync($"/api/v1/farms/{farm.Id}/members", new AddFarmMemberRequest { ProfessionalId = leaving.Id }, JsonOptions))
            .StatusCode.Should().Be(HttpStatusCode.Created);
    }

    [Fact]
    public async Task Archive_ReleasesTheTeamAndBlocksNewInvitations()
    {
        var producer = await ProducerAsync("auth0|ws_arch_prod");
        var prof = await ProfessionalAsync("auth0|ws_arch_prof", ProfessionalRole.Accountant);
        var other = await ProfessionalAsync("auth0|ws_arch_other", ProfessionalRole.Lawyer);
        await AcceptedMatchAsync(producer, prof);
        await AcceptedMatchAsync(producer, other);
        var farm = await CreateFarmAsync(producer.Client, "Los Álamos");
        await AddMemberAsync(producer, farm.Id, prof.Id);

        var archiveRes = await producer.Client.PatchAsJsonAsync($"/api/v1/farms/{farm.Id}/status", new UpdateFarmStatusRequest { Archived = true }, JsonOptions);
        archiveRes.StatusCode.Should().Be(HttpStatusCode.OK);

        (await prof.Client.GetAsync($"/api/v1/workspaces/{farm.Id}")).StatusCode.Should().Be(HttpStatusCode.NotFound);
        (await producer.Client.PostAsJsonAsync($"/api/v1/farms/{farm.Id}/members", new AddFarmMemberRequest { ProfessionalId = other.Id }, JsonOptions))
            .StatusCode.Should().Be(HttpStatusCode.BadRequest);

        var list = await producer.Client.GetFromJsonAsync<List<WorkspaceResponse>>("/api/v1/workspaces", JsonOptions);
        list.Should().ContainSingle().Which.ArchivedAt.Should().NotBeNull();
    }

    // -- Helpers ---------------------------------------------------------------

    private sealed record Actor(Guid Id, HttpClient Client);

    private async Task<Actor> ProducerAsync(string auth0UserId)
    {
        RegisterUserResponse reg = await RegisterProducerAsync(auth0UserId);
        return new Actor(reg.UserId, CreateClientWithAuth(auth0UserId, "Producer", reg.TenantId));
    }

    private async Task<Actor> ProfessionalAsync(string auth0UserId, ProfessionalRole role)
    {
        RegisterUserResponse reg = await RegisterProfessionalAsync(auth0UserId, role: role, specialty: "Asesoramiento");
        return new Actor(reg.UserId, CreateClientWithAuth(auth0UserId, "Professional", reg.TenantId));
    }

    private async Task AcceptedMatchAsync(Actor producer, Actor professional)
    {
        var createRes = await producer.Client.PostAsJsonAsync("/api/v1/matches", new CreateMatchRequest { ProfessionalId = professional.Id }, JsonOptions);
        createRes.StatusCode.Should().Be(HttpStatusCode.Created);
        var match = await createRes.Content.ReadFromJsonAsync<MatchResponse>(JsonOptions);

        var acceptRes = await professional.Client.PatchAsJsonAsync($"/api/v1/matches/{match!.Id}/status", new UpdateMatchStatusRequest { Status = MatchStatus.Active }, JsonOptions);
        acceptRes.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    private async Task<FarmResponse> CreateFarmAsync(HttpClient producerClient, string name, string? description = null)
    {
        var res = await producerClient.PostAsJsonAsync("/api/v1/farms", new CreateFarmRequest { Name = name, TotalHectares = 350, Description = description }, JsonOptions);
        res.StatusCode.Should().Be(HttpStatusCode.Created);
        return (await res.Content.ReadFromJsonAsync<FarmResponse>(JsonOptions))!;
    }

    private async Task<FarmMemberResponse> AddMemberAsync(Actor producer, Guid farmId, Guid professionalId)
    {
        var res = await producer.Client.PostAsJsonAsync($"/api/v1/farms/{farmId}/members", new AddFarmMemberRequest { ProfessionalId = professionalId }, JsonOptions);
        res.StatusCode.Should().Be(HttpStatusCode.Created);
        return (await res.Content.ReadFromJsonAsync<FarmMemberResponse>(JsonOptions))!;
    }
}
