using System.Text.Json;
using Microsoft.IdentityModel.Tokens;

namespace AgroNexo.API.Services;

/// <summary>
/// Resuelve las claves públicas (JWKS) que Firebase usa para firmar sus ID token.
/// Firebase NO publica un documento de descubrimiento OIDC en su issuer
/// (`https://securetoken.google.com/{projectId}/.well-known/openid-configuration` no existe), así que
/// `options.Authority` de <c>AddJwtBearer</c> no puede autodescubrirlas: hay que pedirlas a mano al
/// endpoint JWKS fijo de Google y pasarlas por <c>IssuerSigningKeyResolver</c>.
/// Cachea el resultado (las claves rotan con poca frecuencia) y lo refresca solo cuando vence.
/// </summary>
public sealed class FirebaseJwksCache
{
    private const string JwksUrl = "https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com";
    private static readonly TimeSpan CacheTtl = TimeSpan.FromHours(1);

    private readonly HttpClient _http = new();
    private readonly SemaphoreSlim _lock = new(1, 1);
    private IList<SecurityKey> _keys = Array.Empty<SecurityKey>();
    private DateTimeOffset _expiresAt = DateTimeOffset.MinValue;

    public IEnumerable<SecurityKey> GetKeys() => GetKeysAsync().GetAwaiter().GetResult();

    private async Task<IList<SecurityKey>> GetKeysAsync()
    {
        if (DateTimeOffset.UtcNow < _expiresAt) return _keys;

        await _lock.WaitAsync();
        try
        {
            if (DateTimeOffset.UtcNow < _expiresAt) return _keys;

            var json = await _http.GetStringAsync(JwksUrl);
            var jwks = new JsonWebKeySet(json);
            _keys = jwks.GetSigningKeys();
            _expiresAt = DateTimeOffset.UtcNow.Add(CacheTtl);
            return _keys;
        }
        finally
        {
            _lock.Release();
        }
    }
}
