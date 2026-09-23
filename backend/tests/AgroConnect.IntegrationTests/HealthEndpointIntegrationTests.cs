using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using AgroConnect.IntegrationTests.Infrastructure;
using FluentAssertions;
using Xunit;

namespace AgroConnect.IntegrationTests;

public class HealthEndpointIntegrationTests : IntegrationTestBase
{
    public HealthEndpointIntegrationTests(CustomWebApplicationFactory factory) : base(factory)
    {
    }

    [Fact]
    public async Task GetHealth_ReturnsOk_WithHealthyStatus()
    {
        // Arrange
        var client = Factory.CreateClient();

        // Act
        var response = await client.GetAsync("/health");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var content = await response.Content.ReadFromJsonAsync<JsonElement>(JsonOptions);
        content.GetProperty("status").GetString().Should().Be("Healthy");
    }

    [Fact]
    public async Task GetApiV1Health_ReturnsOk_WithHealthyStatus()
    {
        // Arrange
        var client = Factory.CreateClient();

        // Act
        var response = await client.GetAsync("/api/v1/health");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var content = await response.Content.ReadFromJsonAsync<JsonElement>(JsonOptions);
        content.GetProperty("status").GetString().Should().Be("Healthy");
    }
}
