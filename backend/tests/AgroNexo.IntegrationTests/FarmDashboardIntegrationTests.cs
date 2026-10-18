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
/// Tablero compartido del campo: el productor arma campañas, lotes y cultivos; todo el equipo registra actividades y ve el
/// mismo tablero; quien no es del equipo recibe 404.
/// </summary>
public class FarmDashboardIntegrationTests : IntegrationTestBase
{
    private static readonly DateOnly Today = DateOnly.FromDateTime(DateTimeOffset.UtcNow.ToOffset(TimeSpan.FromHours(-3)).DateTime);

    public FarmDashboardIntegrationTests(CustomWebApplicationFactory factory) : base(factory)
    {
    }

    [Fact]
    public async Task Dashboard_FullFlow_TeamMemberSeesCampaignLotsCropsActivitiesAndWeeklySummary()
    {
        var producer = await ProducerAsync("auth0|dash_ok_prod");
        var agronomist = await ProfessionalAsync("auth0|dash_ok_agro", ProfessionalRole.Agronomist);
        var farm = await FarmWithMemberAsync(producer, agronomist, "La Esperanza");

        var campaign = await CreateCampaignAsync(producer, farm.Id);
        var lot1 = await CreateLotAsync(producer, farm.Id, "Lote 1", 200);
        var lot2 = await CreateLotAsync(producer, farm.Id, "Lote 2", 100);
        await AddCropAsync(producer, farm.Id, lot1.Id, campaign.Id, CropType.Soybean, Today.AddDays(-30), Today.AddDays(90));
        await AddCropAsync(producer, farm.Id, lot1.Id, campaign.Id, CropType.Wheat, Today.AddDays(-50), Today.AddDays(20));
        await AddCropAsync(producer, farm.Id, lot2.Id, campaign.Id, CropType.Corn, Today.AddDays(10), null);

        // El agrónomo registra una recorrida en proceso; el productor, una siembra terminada (sin campaña: toma la de la fecha).
        var visit = await CreateActivityAsync(agronomist, farm.Id, new FarmActivityRequest
        {
            Type = FarmActivityType.Monitoring,
            Title = "Recorrida de lote por chinches",
            Date = Today,
            Status = FarmActivityStatus.InProgress,
            LotId = lot1.Id
        });
        visit.Author.Role.Should().Be(ProfessionalRole.Agronomist);
        visit.CampaignId.Should().Be(campaign.Id);
        visit.Lot!.Name.Should().Be("Lote 1");

        var sowing = await CreateActivityAsync(producer, farm.Id, new FarmActivityRequest
        {
            Type = FarmActivityType.Sowing,
            Title = "Siembra de soja",
            Date = Today.AddDays(-1),
            Status = FarmActivityStatus.Completed,
            LotId = lot1.Id
        });
        sowing.CompletedAt.Should().NotBeNull();

        var dashboard = await agronomist.Client.GetFromJsonAsync<FarmDashboardResponse>($"/api/v1/farms/{farm.Id}/dashboard", JsonOptions);

        dashboard!.SelectedCampaignId.Should().Be(campaign.Id);
        dashboard.Workspace.ViewerRole.Should().Be("Member");
        dashboard.Workspace.Members.Should().ContainSingle().Which.Contact.Should().BeNull();

        dashboard.Kpis.TotalHectares.Should().Be(350);
        dashboard.Kpis.TeamSize.Should().Be(1);
        dashboard.Kpis.TeamRoleCount.Should().Be(1);
        dashboard.Kpis.LotCount.Should().Be(2);
        dashboard.Kpis.LotHectares.Should().Be(300);
        dashboard.Kpis.CropCount.Should().Be(3);
        dashboard.Kpis.OpenActivities.Should().Be(1);

        dashboard.CropSurfaces.Should().HaveCount(3);
        dashboard.CropSurfaces.Single(s => s.Crop == CropType.Corn).Hectares.Should().Be(100);
        dashboard.CropSurfaces.Single(s => s.Crop == CropType.Soybean).Hectares.Should().Be(200);

        dashboard.Lots.Single(l => l.Id == lot1.Id).Crops.Should().HaveCount(2);

        var timeline = dashboard.Timeline!;
        timeline.Progress.Should().BeGreaterThan(0).And.BeLessThan(1);
        timeline.Plantings.Single(p => p.Crop == CropType.Soybean).Phase.Should().Be(CropPhase.Growing);
        timeline.Plantings.Single(p => p.Crop == CropType.Corn).Phase.Should().Be(CropPhase.Sowing);
        timeline.NextHarvest!.Crop.Should().Be(CropType.Wheat);
        timeline.NextHarvest.DaysLeft.Should().Be(20);

        dashboard.RecentActivities.Should().HaveCount(2);
        dashboard.RecentActivities.Single(a => a.Id == visit.Id).CanEdit.Should().BeTrue();
        dashboard.RecentActivities.Single(a => a.Id == sowing.Id).CanEdit.Should().BeFalse();

        dashboard.WeeklySummary.ActivitiesCreated.Should().Be(2);
        dashboard.WeeklySummary.ActivitiesCompleted.Should().Be(1);
        dashboard.WeeklySummary.NewMembers.Should().Be(1);
        dashboard.WeeklySummary.Highlights.Should().ContainSingle().Which.Id.Should().Be(sowing.Id);
    }

    [Fact]
    public async Task LaborProgress_CountsCompletedLotsAndPartialHectaresInProgress()
    {
        var producer = await ProducerAsync("auth0|dash_labor_prod");
        var agronomist = await ProfessionalAsync("auth0|dash_labor_agro", ProfessionalRole.Agronomist);
        var farm = await FarmWithMemberAsync(producer, agronomist, "El Ombú");
        var campaign = await CreateCampaignAsync(producer, farm.Id);
        var lot1 = await CreateLotAsync(producer, farm.Id, "Lote 1", 200);
        var lot2 = await CreateLotAsync(producer, farm.Id, "Lote 2", 100);
        await CreateLotAsync(producer, farm.Id, "Bajo sin cultivo", 50);
        await AddCropAsync(producer, farm.Id, lot1.Id, campaign.Id, CropType.Soybean, Today.AddDays(-20), null);
        await AddCropAsync(producer, farm.Id, lot2.Id, campaign.Id, CropType.Corn, Today.AddDays(-10), null);

        // Lote 1 sembrado entero (sin hectáreas: cuenta el lote); Lote 2 con la siembra en proceso, 40 ha hechas.
        await CreateActivityAsync(producer, farm.Id, new FarmActivityRequest
        {
            Type = FarmActivityType.Sowing, Title = "Siembra soja", Date = Today.AddDays(-2),
            Status = FarmActivityStatus.Completed, LotId = lot1.Id
        });
        var partial = await CreateActivityAsync(agronomist, farm.Id, new FarmActivityRequest
        {
            Type = FarmActivityType.Sowing, Title = "Siembra maíz", Date = Today,
            Status = FarmActivityStatus.InProgress, LotId = lot2.Id, HectaresWorked = 40
        });
        partial.HectaresWorked.Should().Be(40);
        // Una recorrida no es labor sobre la superficie.
        await CreateActivityAsync(agronomist, farm.Id, new FarmActivityRequest
        {
            Type = FarmActivityType.Monitoring, Title = "Recorrida", Date = Today, LotId = lot2.Id
        });

        var dashboard = await producer.Client.GetFromJsonAsync<FarmDashboardResponse>($"/api/v1/farms/{farm.Id}/dashboard", JsonOptions);

        // Se mide sobre los lotes con cultivo (300 ha), no sobre el bajo sin sembrar.
        var sowing = dashboard!.LaborProgress.Single(l => l.Type == FarmActivityType.Sowing);
        sowing.HectaresPlanned.Should().Be(300);
        sowing.HectaresWorked.Should().Be(240);
        sowing.Progress.Should().Be(0.8m);
        dashboard.LaborProgress.Single(l => l.Type == FarmActivityType.Harvest).HectaresWorked.Should().Be(0);
        dashboard.LaborProgress.Should().NotContain(l => l.Type == FarmActivityType.Spraying);

        var lastLabor = dashboard.Lots.Single(l => l.Id == lot2.Id).LastLabor!;
        lastLabor.Type.Should().Be(FarmActivityType.Sowing);
        lastLabor.Status.Should().Be(FarmActivityStatus.InProgress);

        // Al terminar la siembra con las 100 ha, el lote 2 queda completo.
        (await agronomist.Client.PatchAsJsonAsync($"/api/v1/farms/{farm.Id}/activities/{partial.Id}/status",
            new UpdateFarmActivityStatusRequest { Status = FarmActivityStatus.Completed, HectaresWorked = 100 }, JsonOptions))
            .StatusCode.Should().Be(HttpStatusCode.OK);
        var after = await producer.Client.GetFromJsonAsync<FarmDashboardResponse>($"/api/v1/farms/{farm.Id}/dashboard", JsonOptions);
        after!.LaborProgress.Single(l => l.Type == FarmActivityType.Sowing).Progress.Should().Be(1m);
    }

    [Fact]
    public async Task Activities_OnlyOwnerOrAuthorChangeThem_AndStatusFlowsToCompleted()
    {
        var producer = await ProducerAsync("auth0|dash_act_prod");
        var agronomist = await ProfessionalAsync("auth0|dash_act_agro", ProfessionalRole.Agronomist);
        var accountant = await ProfessionalAsync("auth0|dash_act_acc", ProfessionalRole.Accountant);
        var farm = await FarmWithMemberAsync(producer, agronomist, "Santa Rosa");
        await AcceptedMatchAsync(producer, accountant);
        await AddMemberAsync(producer, farm.Id, accountant.Id);

        var visit = await CreateActivityAsync(agronomist, farm.Id, new FarmActivityRequest
        {
            Type = FarmActivityType.Visit,
            Title = "Visita técnica",
            Date = Today
        });
        visit.Status.Should().Be(FarmActivityStatus.Started);

        // Otro profesional del equipo no edita lo que cargó el agrónomo.
        var byAccountant = await accountant.Client.PatchAsJsonAsync(
            $"/api/v1/farms/{farm.Id}/activities/{visit.Id}/status",
            new UpdateFarmActivityStatusRequest { Status = FarmActivityStatus.Completed }, JsonOptions);
        byAccountant.StatusCode.Should().Be(HttpStatusCode.Forbidden);

        var byAuthor = await agronomist.Client.PatchAsJsonAsync(
            $"/api/v1/farms/{farm.Id}/activities/{visit.Id}/status",
            new UpdateFarmActivityStatusRequest { Status = FarmActivityStatus.InProgress }, JsonOptions);
        byAuthor.StatusCode.Should().Be(HttpStatusCode.OK);

        var byOwner = await producer.Client.PatchAsJsonAsync(
            $"/api/v1/farms/{farm.Id}/activities/{visit.Id}/status",
            new UpdateFarmActivityStatusRequest { Status = FarmActivityStatus.Completed }, JsonOptions);
        byOwner.StatusCode.Should().Be(HttpStatusCode.OK);
        (await byOwner.Content.ReadFromJsonAsync<FarmActivityResponse>(JsonOptions))!.Status.Should().Be(FarmActivityStatus.Completed);

        var page = await accountant.Client.GetFromJsonAsync<PagedActivities>($"/api/v1/farms/{farm.Id}/activities?status=Completed", JsonOptions);
        page!.TotalCount.Should().Be(1);
        page.Items.Should().ContainSingle().Which.CanEdit.Should().BeFalse();

        (await accountant.Client.DeleteAsync($"/api/v1/farms/{farm.Id}/activities/{visit.Id}")).StatusCode.Should().Be(HttpStatusCode.Forbidden);
        (await agronomist.Client.DeleteAsync($"/api/v1/farms/{farm.Id}/activities/{visit.Id}")).StatusCode.Should().Be(HttpStatusCode.NoContent);
    }

    [Fact]
    public async Task Planning_RulesForLotsCropsAndCampaigns()
    {
        var producer = await ProducerAsync("auth0|dash_rules_prod");
        var agronomist = await ProfessionalAsync("auth0|dash_rules_agro", ProfessionalRole.Agronomist);
        var farm = await FarmWithMemberAsync(producer, agronomist, "Don Pedro");
        var campaign = await CreateCampaignAsync(producer, farm.Id);

        // Formato de campaña y nombre repetido
        (await producer.Client.PostAsJsonAsync($"/api/v1/farms/{farm.Id}/campaigns",
            new CampaignRequest { Name = "2026/28", StartsOn = Today, EndsOn = Today.AddDays(300) }, JsonOptions))
            .StatusCode.Should().Be(HttpStatusCode.BadRequest);
        (await producer.Client.PostAsJsonAsync($"/api/v1/farms/{farm.Id}/campaigns",
            new CampaignRequest { Name = campaign.Name, StartsOn = Today, EndsOn = Today.AddDays(300) }, JsonOptions))
            .StatusCode.Should().Be(HttpStatusCode.Conflict);

        // Los lotes no superan las hectáreas del campo (350) y no repiten nombre
        var lot = await CreateLotAsync(producer, farm.Id, "Lote Norte", 300);
        (await producer.Client.PostAsJsonAsync($"/api/v1/farms/{farm.Id}/lots", new LotRequest { Name = "Lote Sur", Hectares = 60 }, JsonOptions))
            .StatusCode.Should().Be(HttpStatusCode.BadRequest);
        (await producer.Client.PostAsJsonAsync($"/api/v1/farms/{farm.Id}/lots", new LotRequest { Name = "lote norte", Hectares = 10 }, JsonOptions))
            .StatusCode.Should().Be(HttpStatusCode.Conflict);

        // El mismo cultivo dos veces en el lote y campaña: 409
        await AddCropAsync(producer, farm.Id, lot.Id, campaign.Id, CropType.Soybean, null, null);
        (await producer.Client.PostAsJsonAsync($"/api/v1/farms/{farm.Id}/lots/{lot.Id}/crops",
            new LotCropRequest { CampaignId = campaign.Id, Crop = CropType.Soybean }, JsonOptions))
            .StatusCode.Should().Be(HttpStatusCode.Conflict);

        // Una campaña con cultivos no se borra
        (await producer.Client.DeleteAsync($"/api/v1/farms/{farm.Id}/campaigns/{campaign.Id}")).StatusCode.Should().Be(HttpStatusCode.BadRequest);

        // Un profesional del equipo ve los lotes pero no los administra
        var lots = await agronomist.Client.GetFromJsonAsync<List<LotResponse>>($"/api/v1/farms/{farm.Id}/lots", JsonOptions);
        lots.Should().ContainSingle().Which.Crops.Should().ContainSingle();
        (await agronomist.Client.PostAsJsonAsync($"/api/v1/farms/{farm.Id}/lots", new LotRequest { Name = "Lote X", Hectares = 5 }, JsonOptions))
            .StatusCode.Should().Be(HttpStatusCode.Forbidden);

        // Un lote dado de baja sale de la lista
        (await producer.Client.DeleteAsync($"/api/v1/farms/{farm.Id}/lots/{lot.Id}")).StatusCode.Should().Be(HttpStatusCode.NoContent);
        (await producer.Client.GetFromJsonAsync<List<LotResponse>>($"/api/v1/farms/{farm.Id}/lots", JsonOptions)).Should().BeEmpty();
    }

    [Fact]
    public async Task Dashboard_OutsidersGet404_AndEmptyFarmHasNoTimeline()
    {
        var producer = await ProducerAsync("auth0|dash_out_prod");
        var farm = await CreateFarmAsync(producer.Client, "La Aurora");
        var otherProducer = await ProducerAsync("auth0|dash_out_other");
        var outsider = await ProfessionalAsync("auth0|dash_out_prof", ProfessionalRole.Lawyer);

        (await otherProducer.Client.GetAsync($"/api/v1/farms/{farm.Id}/dashboard")).StatusCode.Should().Be(HttpStatusCode.NotFound);
        (await outsider.Client.GetAsync($"/api/v1/farms/{farm.Id}/dashboard")).StatusCode.Should().Be(HttpStatusCode.NotFound);
        (await outsider.Client.PostAsJsonAsync($"/api/v1/farms/{farm.Id}/activities",
            new FarmActivityRequest { Type = FarmActivityType.Visit, Title = "Intrusa", Date = Today }, JsonOptions))
            .StatusCode.Should().Be(HttpStatusCode.NotFound);

        var empty = await producer.Client.GetFromJsonAsync<FarmDashboardResponse>($"/api/v1/farms/{farm.Id}/dashboard", JsonOptions);
        empty!.SelectedCampaignId.Should().BeNull();
        empty.Timeline.Should().BeNull();
        empty.Kpis.LotCount.Should().Be(0);
        empty.RecentActivities.Should().BeEmpty();
    }

    private sealed record Actor(Guid Id, HttpClient Client);

    private sealed class PagedActivities
    {
        public List<FarmActivityResponse> Items { get; set; } = new();
        public int TotalCount { get; set; }
    }

    private static string CampaignNameFor(DateOnly startsOn) => $"{startsOn.Year}/{(startsOn.Year + 1) % 100:00}";

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

    private async Task<FarmResponse> CreateFarmAsync(HttpClient producerClient, string name)
    {
        var res = await producerClient.PostAsJsonAsync("/api/v1/farms", new CreateFarmRequest { Name = name, TotalHectares = 350 }, JsonOptions);
        res.StatusCode.Should().Be(HttpStatusCode.Created);
        return (await res.Content.ReadFromJsonAsync<FarmResponse>(JsonOptions))!;
    }

    private async Task AddMemberAsync(Actor producer, Guid farmId, Guid professionalId)
    {
        var res = await producer.Client.PostAsJsonAsync($"/api/v1/farms/{farmId}/members", new AddFarmMemberRequest { ProfessionalId = professionalId }, JsonOptions);
        res.StatusCode.Should().Be(HttpStatusCode.Created);
    }

    private async Task<FarmResponse> FarmWithMemberAsync(Actor producer, Actor professional, string name)
    {
        await AcceptedMatchAsync(producer, professional);
        var farm = await CreateFarmAsync(producer.Client, name);
        await AddMemberAsync(producer, farm.Id, professional.Id);
        return farm;
    }

    /// <summary>Campaña que contiene hoy: arrancó hace 60 días y dura 360.</summary>
    private async Task<CampaignResponse> CreateCampaignAsync(Actor producer, Guid farmId)
    {
        var startsOn = Today.AddDays(-60);
        var res = await producer.Client.PostAsJsonAsync($"/api/v1/farms/{farmId}/campaigns",
            new CampaignRequest { Name = CampaignNameFor(startsOn), StartsOn = startsOn, EndsOn = startsOn.AddDays(360) }, JsonOptions);
        res.StatusCode.Should().Be(HttpStatusCode.Created);
        return (await res.Content.ReadFromJsonAsync<CampaignResponse>(JsonOptions))!;
    }

    private async Task<LotResponse> CreateLotAsync(Actor producer, Guid farmId, string name, decimal hectares)
    {
        var res = await producer.Client.PostAsJsonAsync($"/api/v1/farms/{farmId}/lots", new LotRequest { Name = name, Hectares = hectares }, JsonOptions);
        res.StatusCode.Should().Be(HttpStatusCode.Created);
        return (await res.Content.ReadFromJsonAsync<LotResponse>(JsonOptions))!;
    }

    private async Task AddCropAsync(Actor producer, Guid farmId, Guid lotId, Guid campaignId, CropType crop, DateOnly? sowing, DateOnly? harvest)
    {
        var res = await producer.Client.PostAsJsonAsync($"/api/v1/farms/{farmId}/lots/{lotId}/crops",
            new LotCropRequest { CampaignId = campaignId, Crop = crop, SowingDate = sowing, ExpectedHarvestDate = harvest }, JsonOptions);
        res.StatusCode.Should().Be(HttpStatusCode.Created);
    }

    private async Task<FarmActivityResponse> CreateActivityAsync(Actor actor, Guid farmId, FarmActivityRequest request)
    {
        var res = await actor.Client.PostAsJsonAsync($"/api/v1/farms/{farmId}/activities", request, JsonOptions);
        res.StatusCode.Should().Be(HttpStatusCode.Created);
        return (await res.Content.ReadFromJsonAsync<FarmActivityResponse>(JsonOptions))!;
    }
}
