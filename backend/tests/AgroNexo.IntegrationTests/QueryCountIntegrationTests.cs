using System.Net;
using System.Net.Http.Json;
using AgroNexo.Application.Farms.DTOs;
using AgroNexo.Application.Matching.DTOs;
using AgroNexo.Domain.Enums;
using AgroNexo.IntegrationTests.Infrastructure;
using FluentAssertions;
using Xunit;
using Xunit.Abstractions;

namespace AgroNexo.IntegrationTests;

/// <summary>
/// Queries por request sobre PostgreSQL real: la búsqueda asistida y el tablero del campo hacen la misma cantidad de
/// queries con pocos o muchos profesionales. Si crece con las filas, volvió un N+1.
/// </summary>
public class QueryCountIntegrationTests : IntegrationTestBase, IClassFixture<PostgresWebApplicationFactory>
{
    private static readonly DateOnly Today = DateOnly.FromDateTime(DateTimeOffset.UtcNow.ToOffset(TimeSpan.FromHours(-3)).DateTime);

    private readonly PostgresWebApplicationFactory _postgres;
    private readonly ITestOutputHelper _output;

    public QueryCountIntegrationTests(PostgresWebApplicationFactory factory, ITestOutputHelper output) : base(factory)
    {
        _postgres = factory;
        _output = output;
    }

    // La base es compartida por toda la clase y cada test usa sus propios usuarios: no hace falta vaciarla.
    public override Task InitializeAsync() => Task.CompletedTask;

    [Fact]
    public async Task MatchDiscovery_QueryCount_DoesNotGrowWithCandidates()
    {
        var few = await DiscoveryQueriesAsync("few", candidates: 2);
        var many = await DiscoveryQueriesAsync("many", candidates: 8);

        _output.WriteLine($"POST /match-discovery: {few} queries con 2 candidatos, {many} con 8");
        many.Should().Be(few);
    }

    [Fact]
    public async Task FarmDashboard_QueryCount_DoesNotGrowWithActivityAuthors()
    {
        var few = await DashboardQueriesAsync("few", authors: 1);
        var many = await DashboardQueriesAsync("many", authors: 4);

        _output.WriteLine($"GET /farms/{{id}}/dashboard: {few} queries con 1 autor, {many} con 4");
        many.Should().Be(few);
    }

    private async Task<int> DiscoveryQueriesAsync(string label, int candidates)
    {
        var run = Guid.NewGuid().ToString("N")[..8];
        var specialty = $"Especialidad {run}";
        var producer = await ProducerAsync($"qc_disc_{label}_{run}_prod");

        for (var i = 0; i < candidates; i++)
            await RegisterProfessionalAsync($"qc_disc_{label}_{run}_pro{i}", specialty: specialty);

        return await CountQueriesAsync(async () =>
        {
            var res = await producer.Client.PostAsJsonAsync("/api/v1/match-discovery", new CreateMatchDiscoveryRequest
            {
                Latitude = -33.89,
                Longitude = -60.57,
                RequestedSpecialty = specialty,
                RequiresFieldPresence = false
            }, JsonOptions);
            res.StatusCode.Should().Be(HttpStatusCode.Created);
        });
    }

    private async Task<int> DashboardQueriesAsync(string label, int authors)
    {
        var run = Guid.NewGuid().ToString("N")[..8];
        var producer = await ProducerAsync($"qc_dash_{label}_{run}_prod");
        var farm = await CreateFarmAsync(producer);

        // Cada profesional del equipo registra una actividad: el tablero tiene que mostrar a todos los autores.
        for (var i = 0; i < authors; i++)
        {
            var professional = await ProfessionalAsync($"qc_dash_{label}_{run}_pro{i}");
            await AcceptedMatchAsync(producer, professional);
            (await producer.Client.PostAsJsonAsync($"/api/v1/farms/{farm.Id}/members",
                new AddFarmMemberRequest { ProfessionalId = professional.Id }, JsonOptions)).StatusCode.Should().Be(HttpStatusCode.Created);
            (await professional.Client.PostAsJsonAsync($"/api/v1/farms/{farm.Id}/activities", new FarmActivityRequest
            {
                Type = FarmActivityType.Monitoring,
                Title = $"Recorrida {i}",
                Date = Today,
                Status = FarmActivityStatus.Completed
            }, JsonOptions)).StatusCode.Should().Be(HttpStatusCode.Created);
        }

        FarmDashboardResponse? dashboard = null;
        var queries = await CountQueriesAsync(async () =>
            dashboard = await producer.Client.GetFromJsonAsync<FarmDashboardResponse>($"/api/v1/farms/{farm.Id}/dashboard", JsonOptions));

        dashboard!.RecentActivities.Should().HaveCount(authors);
        dashboard.RecentActivities.Select(a => a.Author.Name).Should().OnlyContain(name => name != "Profesional");
        return queries;
    }

    private async Task<int> CountQueriesAsync(Func<Task> request)
    {
        _postgres.SqlCommands.Reset();
        await request();
        return _postgres.SqlCommands.Count;
    }

    private sealed record Actor(Guid Id, HttpClient Client);

    private async Task<Actor> ProducerAsync(string uid)
    {
        var reg = await RegisterProducerAsync(uid);
        return new Actor(reg.UserId, CreateClientWithAuth(uid, "Producer", reg.TenantId));
    }

    private async Task<Actor> ProfessionalAsync(string uid)
    {
        var reg = await RegisterProfessionalAsync(uid, specialty: "Asesoramiento");
        return new Actor(reg.UserId, CreateClientWithAuth(uid, "Professional", reg.TenantId));
    }

    private async Task AcceptedMatchAsync(Actor producer, Actor professional)
    {
        var created = await producer.Client.PostAsJsonAsync("/api/v1/matches", new CreateMatchRequest { ProfessionalId = professional.Id }, JsonOptions);
        created.StatusCode.Should().Be(HttpStatusCode.Created);
        var match = await created.Content.ReadFromJsonAsync<MatchResponse>(JsonOptions);

        (await professional.Client.PatchAsJsonAsync($"/api/v1/matches/{match!.Id}/status",
            new UpdateMatchStatusRequest { Status = MatchStatus.Active }, JsonOptions)).StatusCode.Should().Be(HttpStatusCode.OK);
    }

    private async Task<FarmResponse> CreateFarmAsync(Actor producer)
    {
        var res = await producer.Client.PostAsJsonAsync("/api/v1/farms", new CreateFarmRequest { Name = "La Medición", TotalHectares = 300 }, JsonOptions);
        res.StatusCode.Should().Be(HttpStatusCode.Created);
        return (await res.Content.ReadFromJsonAsync<FarmResponse>(JsonOptions))!;
    }
}
