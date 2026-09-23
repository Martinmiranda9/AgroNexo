using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;

namespace AgroConnect.API.Controllers;

/// <summary>
/// Solo para desarrollo. Genera tokens JWT válidos para probar la API sin Auth0.
/// </summary>
[ApiController]
[Route("api/v1/dev/token")]
[ApiExplorerSettings(IgnoreApi = false)] // Mostrar en Swagger
public class DevAuthController : ControllerBase
{
    private readonly IWebHostEnvironment _env;

    public DevAuthController(IWebHostEnvironment env)
    {
        _env = env;
    }

    /// <summary>
    /// Genera un token JWT simulando a un usuario (Productor o Profesional).
    /// </summary>
    /// <param name="userId">Un ID cualquiera (ej: auth0|123456)</param>
    /// <param name="role">Producer o Professional</param>
    /// <returns>El token listo para usar en Swagger</returns>
    [HttpGet]
    public IActionResult GenerateToken(
        [FromQuery] string userId = "auth0|test_user_123", 
        [FromQuery] string role = "Producer")
    {
        if (!_env.IsDevelopment())
        {
            return NotFound("Solo disponible en desarrollo.");
        }

        var tokenHandler = new JwtSecurityTokenHandler();
        var key = Encoding.UTF8.GetBytes("AgroConnect_SuperSecret_Dev_Key_12345!_For_Local_Testing");

        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, userId),
            new Claim("sub", userId),
            new Claim("email", $"{userId}@agroconnect.local"),
            new Claim("user_type", role),
            new Claim(ClaimTypes.Role, role)
        };

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(claims),
            Expires = DateTime.UtcNow.AddDays(7),
            SigningCredentials = new SigningCredentials(
                new SymmetricSecurityKey(key),
                SecurityAlgorithms.HmacSha256Signature)
        };

        var token = tokenHandler.CreateToken(tokenDescriptor);
        var tokenString = tokenHandler.WriteToken(token);

        return Ok(new
        {
            AccessToken = tokenString,
            Instructions = "Copia el AccessToken y pégalo en el botón 'Authorize' (esquina superior derecha de Swagger) con la palabra Bearer delante: Bearer <tu-token>"
        });
    }
}
