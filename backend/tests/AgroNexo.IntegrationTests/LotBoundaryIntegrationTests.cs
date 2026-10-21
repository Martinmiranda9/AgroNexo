using System.Net;
using System.Net.Http.Json;
using AgroNexo.Application.Common.DTOs;
using AgroNexo.Application.Farms.DTOs;
using AgroNexo.Application.Identity.DTOs;
using AgroNexo.IntegrationTests.Infrastructure;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc;
using Xunit;

namespace AgroNexo.IntegrationTests;

/// <summary>
/// Lotes y campos dibujados en el mapa: el dibujo solo los ubica. Las hectáreas son siempre las declaradas, no se
/// comparan con las del campo y un lote puede quedar afuera del perímetro o encima de otro (el frontend avisa). Lo
/// único que se rechaza es un borde que se cruza consigo mismo. El campo con perímetro toma su ubicación de Georef.
/// </summary>
public class LotBoundaryIntegrationTests : IntegrationTestBase, IClassFixture<FakePlaceLookupWebApplicationFactory>
{
    // Campo de unos 1,1 km (norte-sur) por 1,85 km (este-oeste) cerca de Pergamino: unas 205 ha dibujadas.
    private static readonly List<CoordinateDto> Perimeter = Rectangle(-33.890, -33.880, -60.600, -60.580);
    private static readonly List<CoordinateDto> WestLot = Rectangle(-33.889, -33.881, -60.599, -60.591);
    private static readonly List<CoordinateDto> OutsideLot = Rectangle(-33.889, -33.881, -60.570, -60.560);
    private static readonly List<CoordinateDto> OverlappingLot = Rectangle(-33.888, -33.882, -60.595, -60.587);

    private readonly FakePlaceLookupWebApplicationFactory _factory;

    public LotBoundaryIntegrationTests(FakePlaceLookupWebApplicationFactory factory) : base(factory)
    {
        _factory = factory;
    }

    [Fact]
    public async Task Farm_WithDrawnPerimeter_KeepsTheDeclaredHectaresAndTakesThePlaceFromGeoref()
    {
        var producer = await ProducerAsync("auth0|lotmap_farm_prod");

        var farm = await CreateFarmAsync(producer, "La Esperanza", 11, Perimeter);

        farm.TotalHectares.Should().Be(11m, "el dibujo mide unas 205 ha, pero manda lo declarado");
        farm.LocationCoordinates.Should().HaveCount(5, "el anillo vuelve al primer punto");
        farm.Province.Should().Be("Buenos Aires");
        farm.Department.Should().Be("Pergamino");
        farm.Locality.Should().Be("Pergamino");

        var (lat, lon) = _factory.PlaceLookup.Queries.Last();
        lat.Should().BeInRange(-33.890, -33.880);
        lon.Should().BeInRange(-60.600, -60.580);
    }

    [Fact]
    public async Task DrawnLots_KeepTheDeclaredHectares_AndOnlyACrossedBorderIsRejected()
    {
        var producer = await ProducerAsync("auth0|lotmap_lots_prod");
        var farm = await CreateFarmAsync(producer, "El Ombú", 11, Perimeter);

        // Dibujado: guarda la forma y las hectáreas declaradas, aunque el dibujo mida 66 ha y el campo diga 11
        var west = await PostLotAsync(producer, farm.Id, new LotRequest { Name = "Lote Oeste", Hectares = 60, BoundaryCoordinates = WestLot });
        west.StatusCode.Should().Be(HttpStatusCode.Created);
        var westLot = (await west.Content.ReadFromJsonAsync<LotResponse>(JsonOptions))!;
        westLot.Hectares.Should().Be(60m);
        westLot.BoundaryCoordinates.Should().HaveCount(5);
        westLot.CreatedBy.Name.Should().Be("Juan Perez");
        westLot.CreatedBy.Role.Should().BeNull();
        westLot.BoundaryEditedBy!.Name.Should().Be("Juan Perez");
        westLot.BoundaryEditedAt.Should().NotBeNull();

        // Afuera del perímetro o encima de otro lote: el dibujo es solo referencia, se guarda igual
        (await PostLotAsync(producer, farm.Id, new LotRequest { Name = "Lote Afuera", Hectares = 40, BoundaryCoordinates = OutsideLot }))
            .StatusCode.Should().Be(HttpStatusCode.Created);
        (await PostLotAsync(producer, farm.Id, new LotRequest { Name = "Lote Encimado", Hectares = 30, BoundaryCoordinates = OverlappingLot }))
            .StatusCode.Should().Be(HttpStatusCode.Created);

        // Lo único que se rechaza es un borde cruzado consigo mismo
        var crossed = await PostLotAsync(producer, farm.Id, new LotRequest { Name = "Lote Cruzado", Hectares = 10, BoundaryCoordinates = Bowtie() });
        crossed.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        (await crossed.Content.ReadFromJsonAsync<ProblemDetails>(JsonOptions))!.Detail.Should().Contain("cruza");

        // Las hectáreas son obligatorias, haya dibujo o no
        (await PostLotAsync(producer, farm.Id, new LotRequest { Name = "Lote Sin Hectáreas", BoundaryCoordinates = WestLot }))
            .StatusCode.Should().Be(HttpStatusCode.BadRequest);

        // El tablero devuelve el perímetro, la ubicación y la forma de cada lote dibujado
        var dashboard = await producer.Client.GetFromJsonAsync<FarmDashboardResponse>($"/api/v1/farms/{farm.Id}/dashboard", JsonOptions);
        dashboard!.CanEditLots.Should().BeTrue();
        dashboard.Workspace.LocationCoordinates.Should().HaveCount(5);
        dashboard.Workspace.Province.Should().Be("Buenos Aires");
        dashboard.Lots.Should().HaveCount(3).And.OnlyContain(l => l.BoundaryCoordinates.Count == 5);
        dashboard.Kpis.LotHectares.Should().Be(130m, "suman lo declarado: 60 + 40 + 30, más que las 11 ha del campo");

        // Editar sin mandar la forma la saca y deja las hectáreas nuevas
        var updated = await producer.Client.PutAsJsonAsync($"/api/v1/farms/{farm.Id}/lots/{westLot.Id}",
            new LotRequest { Name = "Lote Oeste", Hectares = 50 }, JsonOptions);
        updated.StatusCode.Should().Be(HttpStatusCode.OK);
        var manual = (await updated.Content.ReadFromJsonAsync<LotResponse>(JsonOptions))!;
        manual.Hectares.Should().Be(50m);
        manual.BoundaryCoordinates.Should().BeEmpty();
        manual.BoundaryEditedBy.Should().BeNull();
    }

    private sealed record Actor(Guid Id, HttpClient Client);

    private async Task<Actor> ProducerAsync(string auth0UserId)
    {
        RegisterUserResponse reg = await RegisterProducerAsync(auth0UserId);
        return new Actor(reg.UserId, CreateClientWithAuth(auth0UserId, "Producer", reg.TenantId));
    }

    private async Task<FarmResponse> CreateFarmAsync(Actor producer, string name, decimal hectares, List<CoordinateDto> perimeter)
    {
        var res = await producer.Client.PostAsJsonAsync("/api/v1/farms",
            new CreateFarmRequest { Name = name, TotalHectares = hectares, LocationCoordinates = perimeter }, JsonOptions);
        res.StatusCode.Should().Be(HttpStatusCode.Created);
        return (await res.Content.ReadFromJsonAsync<FarmResponse>(JsonOptions))!;
    }

    private Task<HttpResponseMessage> PostLotAsync(Actor actor, Guid farmId, LotRequest request) =>
        actor.Client.PostAsJsonAsync($"/api/v1/farms/{farmId}/lots", request, JsonOptions);

    /// <summary>Esquinas en sentido horario desde el noroeste.</summary>
    private static List<CoordinateDto> Rectangle(double south, double north, double west, double east) => new()
    {
        new CoordinateDto(north, west),
        new CoordinateDto(north, east),
        new CoordinateDto(south, east),
        new CoordinateDto(south, west)
    };

    /// <summary>Un "moño": las esquinas en orden cruzado, el borde se corta a sí mismo.</summary>
    private static List<CoordinateDto> Bowtie() => new()
    {
        new CoordinateDto(-33.882, -60.598),
        new CoordinateDto(-33.888, -60.592),
        new CoordinateDto(-33.882, -60.592),
        new CoordinateDto(-33.888, -60.598)
    };
}
