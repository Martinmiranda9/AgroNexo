using System.Security.Claims;
using System.Text;
using AgroNexo.API.Middlewares;
using AgroNexo.API.Services;
using AgroNexo.Application;
using AgroNexo.Application.Common.Interfaces;
using AgroNexo.Infrastructure;
using AgroNexo.Infrastructure.Data;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);

// 1. Add Core Services & HTTP Context Accessor
builder.Services.AddHttpContextAccessor();
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new System.Text.Json.Serialization.JsonStringEnumConverter());
        options.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
    });
builder.Services.AddEndpointsApiExplorer();

// 2. Register Scoped Tenant and Current User Contexts
builder.Services.AddScoped<TenantContext>();
builder.Services.AddScoped<ITenantContext>(sp => sp.GetRequiredService<TenantContext>());
builder.Services.AddScoped<CurrentUserService>();
builder.Services.AddScoped<ICurrentUserService>(sp => sp.GetRequiredService<CurrentUserService>());

// 3. Register Clean Architecture Layers
builder.Services.AddApplication();
builder.Services.AddInfrastructure(builder.Configuration);

// 4. Configure CORS for Local Frontend
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        // En despliegue se define con Cors__AllowedOrigins__0, Cors__AllowedOrigins__1...
        var origins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>();
        if (origins is not { Length: > 0 })
            origins = new[] { "http://localhost:3000", "https://localhost:3000" };

        policy.WithOrigins(origins)
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// 5. Configure Authentication with Firebase / Dev JWT Bearer
var devSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes("AgroNexo_SuperSecret_Dev_Key_12345!_For_Local_Testing"));

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    if (builder.Environment.IsDevelopment())
    {
        options.RequireHttpsMetadata = false;
        options.SaveToken = true;
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = false,
            ValidateAudience = false,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = devSigningKey,
            NameClaimType = ClaimTypes.NameIdentifier,
            RoleClaimType = ClaimTypes.Role
        };
    }
    else
    {
        // Firebase firma los ID token con RS256, pero a diferencia de Auth0 NO publica un documento de
        // descubrimiento OIDC en su issuer (https://securetoken.google.com/{projectId}/.well-known/
        // openid-configuration no existe) — por eso NO se setea `options.Authority` (dispararía ese
        // descubrimiento y fallaría). Las claves se resuelven a mano contra el JWKS fijo de Google
        // (`FirebaseJwksCache`) y el emisor/audiencia se validan de forma estática.
        var firebaseProjectId = builder.Configuration["Firebase:ProjectId"]
            ?? throw new InvalidOperationException("Firebase:ProjectId no configurado. La aplicación no puede iniciar sin este valor.");

        var authority = $"https://securetoken.google.com/{firebaseProjectId}";
        var jwksCache = new FirebaseJwksCache();

        options.RequireHttpsMetadata = true;

        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = authority,
            ValidateAudience = true,
            ValidAudience = firebaseProjectId,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidAlgorithms = new[] { SecurityAlgorithms.RsaSha256 },
            IssuerSigningKeyResolver = (_, _, _, _) => jwksCache.GetKeys(),
            NameClaimType = ClaimTypes.NameIdentifier,
            RoleClaimType = ClaimTypes.Role
        };
    }
});

// 5. Configure Authorization Policies
builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("Authenticated", policy =>
        policy.RequireAuthenticatedUser());

    options.AddPolicy("IsProducer", policy =>
        policy.RequireAssertion(context =>
        {
            var user = context.User;
            if (user.Identity?.IsAuthenticated != true)
                return false;

            var roleOrType = user.FindFirst("user_type")?.Value
                ?? user.FindFirst("https://agroconnect.com/user_type")?.Value
                ?? user.FindFirst(ClaimTypes.Role)?.Value
                ?? user.FindFirst("role")?.Value
                ?? user.FindFirst("https://agroconnect.com/roles")?.Value;

            if (string.Equals(roleOrType, "Producer", StringComparison.OrdinalIgnoreCase))
                return true;

            var httpContext = context.Resource as HttpContext
                ?? (context.Resource as Microsoft.AspNetCore.Mvc.Filters.AuthorizationFilterContext)?.HttpContext;

            if (httpContext != null)
            {
                var tenantContext = httpContext.RequestServices.GetService<ITenantContext>();
                if (string.Equals(tenantContext?.UserRole, "Producer", StringComparison.OrdinalIgnoreCase))
                    return true;
            }

            return false;
        }));

    options.AddPolicy("IsProfessional", policy =>
        policy.RequireAssertion(context =>
        {
            var user = context.User;
            if (user.Identity?.IsAuthenticated != true)
                return false;

            var roleOrType = user.FindFirst("user_type")?.Value
                ?? user.FindFirst("https://agroconnect.com/user_type")?.Value
                ?? user.FindFirst(ClaimTypes.Role)?.Value
                ?? user.FindFirst("role")?.Value
                ?? user.FindFirst("https://agroconnect.com/roles")?.Value;

            if (string.Equals(roleOrType, "Professional", StringComparison.OrdinalIgnoreCase))
                return true;

            var httpContext = context.Resource as HttpContext
                ?? (context.Resource as Microsoft.AspNetCore.Mvc.Filters.AuthorizationFilterContext)?.HttpContext;

            if (httpContext != null)
            {
                var tenantContext = httpContext.RequestServices.GetService<ITenantContext>();
                if (string.Equals(tenantContext?.UserRole, "Professional", StringComparison.OrdinalIgnoreCase))
                    return true;
            }

            return false;
        }));
});

// 6. Configure Swagger with JWT Bearer Security Definition
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "AgroNexo API - Módulo Match Productor ↔ Profesional",
        Version = "v1",
        Description = "API REST para conexión y matching geoespacial entre productores agrícolas y profesionales agropecuarios."
    });

    var securityScheme = new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Description = "Ingrese el token JWT Bearer: 'Bearer {token}'",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.Http,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        Reference = new OpenApiReference
        {
            Id = "Bearer",
            Type = ReferenceType.SecurityScheme
        }
    };

    options.AddSecurityDefinition("Bearer", securityScheme);
    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        { securityScheme, Array.Empty<string>() }
    });
});

// Detrás de nginx/Caddy la IP y el esquema reales llegan en X-Forwarded-*.
builder.Services.Configure<ForwardedHeadersOptions>(options =>
{
    options.ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto;
    // El proxy corre en otro contenedor de la red interna de Docker: no se conoce su IP de antemano.
    options.KnownNetworks.Clear();
    options.KnownProxies.Clear();
});

var app = builder.Build();

app.UseForwardedHeaders();

// Aplica migraciones al arrancar (contenedor). Se activa con Database__MigrateOnStartup=true.
if (app.Configuration.GetValue<bool>("Database:MigrateOnStartup"))
{
    using var scope = app.Services.CreateScope();
    scope.ServiceProvider.GetRequiredService<AgroNexoDbContext>().Database.Migrate();
}

// 7. Middlewares Pipeline in Strict Order
app.UseMiddleware<ExceptionHandlingMiddleware>();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "AgroNexo API v1");
    });
}

if (!app.Environment.IsDevelopment() && !app.Environment.IsEnvironment("Testing")
    && !app.Configuration.GetValue<bool>("Https:DisableRedirection"))
{
    app.UseHttpsRedirection();
}
app.UseRouting();
app.UseCors("AllowFrontend");

app.UseAuthentication();
app.UseMiddleware<TenantMiddleware>();
app.UseAuthorization();

app.MapControllers();

app.MapGet("/", context =>
{
    context.Response.Redirect("/swagger");
    return Task.CompletedTask;
});

app.Run();

// Partial class declaration for WebApplicationFactory in Integration Tests
public partial class Program { }
