using System.Net;
using System.Net.Http.Json;
using AgroNexo.Application.Common.DTOs;
using AgroNexo.Application.Farms.DTOs;
using AgroNexo.Application.Identity.DTOs;
using AgroNexo.Application.Matching.DTOs;
using AgroNexo.Domain.Enums;
using AgroNexo.IntegrationTests.Infrastructure;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc;
using Xunit;

namespace AgroNexo.IntegrationTests;

/// <summary>
/// Quién dibuja y corrige lotes: el productor dueño o el ingeniero agrónomo del equipo. Los demás profesionales los ven
/// pero no los editan (403); quien dejó el equipo no ve el campo (404); la baja y los cultivos siguen siendo del productor.
/// </summary>
public class LotTeamEditingIntegrationTests : IntegrationTestBase, IClassFixture<FakePlaceLookupWebApplicationFactory>
{
    private static readonly List<CoordinateDto> Perimeter = Rectangle(-33.890, -33.880, -60.600, -60.580);
    private static readonly List<CoordinateDto> NorthLot = Rectangle(-33.885, -33.881, -60.599, -60.581);
    private static readonly List<CoordinateDto> NorthLotCorrected = Rectangle(-33.886, -33.881, -60.599, -60.581);
    private static readonly List<CoordinateDto> SouthLot = Rectangle(-33.889, -33.886, -60.599, -60.581);

    public LotTeamEditingIntegrationTests(FakePlaceLookupWebApplicationFactory factory) : base(factory)
    {
    }

    [Fact]
    public async Task Agronomist_DrawsAndCorrectsLots_ButCannotRemoveThemOrManageCrops()
    {
        var producer = await ProducerAsync("auth0|lotteam_agro_prod");
        var agronomist = await ProfessionalAsync("auth0|lotteam_agro_agro", ProfessionalRole.Agronomist, "Ana", "Pérez");
        var farm = await FarmWithMembersAsync(producer, "La Esperanza", agronomist);

        // El agrónomo dibuja un lote: queda firmado con su nombre y rol
        var created = await agronomist.Client.PostAsJsonAsync($"/api/v1/farms/{farm.Id}/lots",
            new LotRequest { Name = "Lote Norte", Hectares = 40, BoundaryCoordinates = NorthLot }, JsonOptions);
        created.StatusCode.Should().Be(HttpStatusCode.Created);
        var lot = (await created.Content.ReadFromJsonAsync<LotResponse>(JsonOptions))!;
        lot.CreatedBy.Name.Should().Be("Ana Pérez");
        lot.CreatedBy.Role.Should().Be(ProfessionalRole.Agronomist);
        lot.BoundaryEditedBy!.Name.Should().Be("Ana Pérez");

        // Corrige los bordes: las hectáreas siguen siendo las declaradas y queda como último editor
        var producerLot = await CreateLotAsync(producer, farm.Id, new LotRequest { Name = "Lote Sur", Hectares = 40, BoundaryCoordinates = SouthLot });
        producerLot.CreatedBy.Role.Should().BeNull();
        var corrected = await agronomist.Client.PutAsJsonAsync($"/api/v1/farms/{farm.Id}/lots/{lot.Id}",
            new LotRequest { Name = "Lote Norte", Hectares = 40, BoundaryCoordinates = NorthLotCorrected }, JsonOptions);
        corrected.StatusCode.Should().Be(HttpStatusCode.OK);
        var correctedLot = (await corrected.Content.ReadFromJsonAsync<LotResponse>(JsonOptions))!;
        correctedLot.Hectares.Should().Be(40m, "corregir el dibujo no cambia las hectáreas declaradas");
        correctedLot.BoundaryEditedBy!.Name.Should().Be("Ana Pérez");

        var fixedByAgronomist = await agronomist.Client.PutAsJsonAsync($"/api/v1/farms/{farm.Id}/lots/{producerLot.Id}",
            new LotRequest { Name = "Lote Sur", Hectares = 40, BoundaryCoordinates = Rectangle(-33.889, -33.8865, -60.599, -60.581) }, JsonOptions);
        fixedByAgronomist.StatusCode.Should().Be(HttpStatusCode.OK);
        var southLot = (await fixedByAgronomist.Content.ReadFromJsonAsync<LotResponse>(JsonOptions))!;
        southLot.CreatedBy.Role.Should().BeNull("lo creó el productor");
        southLot.BoundaryEditedBy!.Name.Should().Be("Ana Pérez");

        // El tablero le habilita editar lotes
        var dashboard = await agronomist.Client.GetFromJsonAsync<FarmDashboardResponse>($"/api/v1/farms/{farm.Id}/dashboard", JsonOptions);
        dashboard!.CanEditLots.Should().BeTrue();

        // No da de baja lotes ni carga cultivos: eso sigue siendo del productor
        (await agronomist.Client.DeleteAsync($"/api/v1/farms/{farm.Id}/lots/{lot.Id}"))
            .StatusCode.Should().Be(HttpStatusCode.Forbidden);
        (await agronomist.Client.PostAsJsonAsync($"/api/v1/farms/{farm.Id}/lots/{lot.Id}/crops",
            new LotCropRequest { CampaignId = Guid.NewGuid(), Crop = CropType.Soybean }, JsonOptions))
            .StatusCode.Should().Be(HttpStatusCode.Forbidden);
    }

    [Fact]
    public async Task OtherProfessionals_SeeLotsButCannotDrawOrCorrectThem()
    {
        var producer = await ProducerAsync("auth0|lotteam_acc_prod");
        var accountant = await ProfessionalAsync("auth0|lotteam_acc_acc", ProfessionalRole.Accountant, "Luis", "Gómez");
        var farm = await FarmWithMembersAsync(producer, "Don Pedro", accountant);
        var lot = await CreateLotAsync(producer, farm.Id, new LotRequest { Name = "Lote Norte", Hectares = 40, BoundaryCoordinates = NorthLot });

        var lots = await accountant.Client.GetFromJsonAsync<List<LotResponse>>($"/api/v1/farms/{farm.Id}/lots", JsonOptions);
        lots.Should().ContainSingle().Which.BoundaryCoordinates.Should().HaveCount(5);

        var dashboard = await accountant.Client.GetFromJsonAsync<FarmDashboardResponse>($"/api/v1/farms/{farm.Id}/dashboard", JsonOptions);
        dashboard!.CanEditLots.Should().BeFalse();

        var create = await accountant.Client.PostAsJsonAsync($"/api/v1/farms/{farm.Id}/lots",
            new LotRequest { Name = "Lote Sur", Hectares = 40, BoundaryCoordinates = SouthLot }, JsonOptions);
        create.StatusCode.Should().Be(HttpStatusCode.Forbidden);
        (await create.Content.ReadFromJsonAsync<ProblemDetails>(JsonOptions))!.Detail.Should().Contain("ingeniero agrónomo");

        (await accountant.Client.PutAsJsonAsync($"/api/v1/farms/{farm.Id}/lots/{lot.Id}",
            new LotRequest { Name = "Lote Norte", Hectares = 40, BoundaryCoordinates = NorthLotCorrected }, JsonOptions))
            .StatusCode.Should().Be(HttpStatusCode.Forbidden);
    }

    [Fact]
    public async Task AgronomistWhoLeftTheTeam_CannotEditLots_AndNobodyEditsAnArchivedFarm()
    {
        var producer = await ProducerAsync("auth0|lotteam_end_prod");
        var agronomist = await ProfessionalAsync("auth0|lotteam_end_agro", ProfessionalRole.Agronomist, "Ana", "Pérez");
        var farm = await FarmWithMembersAsync(producer, "Santa Rosa", agronomist);

        (await agronomist.Client.DeleteAsync($"/api/v1/farms/{farm.Id}/members/me")).StatusCode.Should().Be(HttpStatusCode.NoContent);
        (await agronomist.Client.PostAsJsonAsync($"/api/v1/farms/{farm.Id}/lots",
            new LotRequest { Name = "Lote Norte", Hectares = 40, BoundaryCoordinates = NorthLot }, JsonOptions))
            .StatusCode.Should().Be(HttpStatusCode.NotFound);

        (await producer.Client.PatchAsJsonAsync($"/api/v1/farms/{farm.Id}/status", new UpdateFarmStatusRequest { Archived = true }, JsonOptions))
            .StatusCode.Should().Be(HttpStatusCode.OK);
        (await producer.Client.PostAsJsonAsync($"/api/v1/farms/{farm.Id}/lots",
            new LotRequest { Name = "Lote Norte", Hectares = 40, BoundaryCoordinates = NorthLot }, JsonOptions))
            .StatusCode.Should().Be(HttpStatusCode.BadRequest);

        var dashboard = await producer.Client.GetFromJsonAsync<FarmDashboardResponse>($"/api/v1/farms/{farm.Id}/dashboard", JsonOptions);
        dashboard!.CanEditLots.Should().BeFalse();
    }

    private sealed record Actor(Guid Id, HttpClient Client);

    private async Task<Actor> ProducerAsync(string auth0UserId)
    {
        RegisterUserResponse reg = await RegisterProducerAsync(auth0UserId);
        return new Actor(reg.UserId, CreateClientWithAuth(auth0UserId, "Producer", reg.TenantId));
    }

    private async Task<Actor> ProfessionalAsync(string auth0UserId, ProfessionalRole role, string firstName, string lastName)
    {
        RegisterUserResponse reg = await RegisterProfessionalAsync(auth0UserId, firstName, lastName, role: role, specialty: "Asesoramiento");
        return new Actor(reg.UserId, CreateClientWithAuth(auth0UserId, "Professional", reg.TenantId));
    }

    /// <summary>Campo con perímetro y cada profesional en el equipo (match aceptado e invitación).</summary>
    private async Task<FarmResponse> FarmWithMembersAsync(Actor producer, string name, params Actor[] professionals)
    {
        var farmRes = await producer.Client.PostAsJsonAsync("/api/v1/farms",
            new CreateFarmRequest { Name = name, LocationCoordinates = Perimeter }, JsonOptions);
        farmRes.StatusCode.Should().Be(HttpStatusCode.Created);
        var farm = (await farmRes.Content.ReadFromJsonAsync<FarmResponse>(JsonOptions))!;

        foreach (var professional in professionals)
        {
            var matchRes = await producer.Client.PostAsJsonAsync("/api/v1/matches", new CreateMatchRequest { ProfessionalId = professional.Id }, JsonOptions);
            matchRes.StatusCode.Should().Be(HttpStatusCode.Created);
            var match = await matchRes.Content.ReadFromJsonAsync<MatchResponse>(JsonOptions);

            (await professional.Client.PatchAsJsonAsync($"/api/v1/matches/{match!.Id}/status",
                new UpdateMatchStatusRequest { Status = MatchStatus.Active }, JsonOptions))
                .StatusCode.Should().Be(HttpStatusCode.OK);

            (await producer.Client.PostAsJsonAsync($"/api/v1/farms/{farm.Id}/members",
                new AddFarmMemberRequest { ProfessionalId = professional.Id }, JsonOptions))
                .StatusCode.Should().Be(HttpStatusCode.Created);
        }

        return farm;
    }

    private async Task<LotResponse> CreateLotAsync(Actor actor, Guid farmId, LotRequest request)
    {
        var res = await actor.Client.PostAsJsonAsync($"/api/v1/farms/{farmId}/lots", request, JsonOptions);
        res.StatusCode.Should().Be(HttpStatusCode.Created);
        return (await res.Content.ReadFromJsonAsync<LotResponse>(JsonOptions))!;
    }

    private static List<CoordinateDto> Rectangle(double south, double north, double west, double east) => new()
    {
        new CoordinateDto(north, west),
        new CoordinateDto(north, east),
        new CoordinateDto(south, east),
        new CoordinateDto(south, west)
    };
}
