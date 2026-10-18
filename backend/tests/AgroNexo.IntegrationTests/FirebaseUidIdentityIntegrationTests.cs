using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using AgroNexo.Application.Identity.DTOs;
using AgroNexo.Domain.Enums;
using AgroNexo.IntegrationTests.Infrastructure;
using FluentAssertions;
using Xunit;

namespace AgroNexo.IntegrationTests;

/// <summary>
/// Flujo completo por HTTP de la identidad guardada en <c>FirebaseUid</c>: registro con el <c>sub</c>
/// del token y lectura de <c>identity/me</c> y del perfil con ese mismo <c>sub</c>.
/// </summary>
public class FirebaseUidIdentityIntegrationTests : IntegrationTestBase
{
    public FirebaseUidIdentityIntegrationTests(CustomWebApplicationFactory factory) : base(factory)
    {
    }

    [Fact]
    public async Task RegistrarProductor_YLeerIdentityMe_ConElSubDelToken_LoReconoceComoRegistrado()
    {
        var firebaseUid = $"firebase_{Guid.NewGuid():N}";

        // Antes del registro, identity/me responde sin tenant y marca al usuario como no registrado.
        var anonymousClient = CreateClientWithAuth(firebaseUid, "Producer");
        var beforeRes = await anonymousClient.GetAsync("/api/v1/identity/me");
        beforeRes.StatusCode.Should().Be(HttpStatusCode.OK);
        var before = await beforeRes.Content.ReadFromJsonAsync<CurrentUserResponse>(JsonOptions);
        before!.IsRegistered.Should().BeFalse();

        var registration = await RegisterProducerAsync(firebaseUid, "Lucía", "Paz", "27-40111222-3");
        registration.FirebaseUid.Should().Be(firebaseUid);

        // El tenant lo resuelve TenantMiddleware desde la base con el sub: el cliente no manda tenant.
        var meRes = await anonymousClient.GetAsync("/api/v1/identity/me");
        meRes.StatusCode.Should().Be(HttpStatusCode.OK);
        var me = await meRes.Content.ReadFromJsonAsync<CurrentUserResponse>(JsonOptions);
        me!.IsRegistered.Should().BeTrue();
        me.UserType.Should().Be(UserType.Producer);
        me.PublicId.Should().Be(registration.PublicId);
        me.FirstName.Should().Be("Lucía");

        // El JSON del perfil expone el nombre nuevo y ya no el heredado.
        var profileRes = await anonymousClient.GetAsync("/api/v1/producers/me");
        profileRes.StatusCode.Should().Be(HttpStatusCode.OK);
        using var profile = JsonDocument.Parse(await profileRes.Content.ReadAsStringAsync());
        profile.RootElement.GetProperty("firebaseUid").GetString().Should().Be(firebaseUid);
        profile.RootElement.TryGetProperty("auth0UserId", out _).Should().BeFalse();
    }

    [Fact]
    public async Task IdentityMe_ConOtroSub_NoVeAlProductorRegistrado()
    {
        await RegisterProducerAsync($"firebase_{Guid.NewGuid():N}", "Lucía", "Paz", "27-40111222-3");

        var otherClient = CreateClientWithAuth($"firebase_{Guid.NewGuid():N}", "Producer");
        var res = await otherClient.GetAsync("/api/v1/identity/me");

        res.StatusCode.Should().Be(HttpStatusCode.OK);
        var me = await res.Content.ReadFromJsonAsync<CurrentUserResponse>(JsonOptions);
        me!.IsRegistered.Should().BeFalse();
    }
}
