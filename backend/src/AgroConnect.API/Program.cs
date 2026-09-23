using System.Security.Claims;
using System.Text;
using AgroConnect.API.Middlewares;
using AgroConnect.API.Services;
using AgroConnect.Application;
using AgroConnect.Application.Common.Interfaces;
using AgroConnect.Infrastructure;
using Microsoft.AspNetCore.Authentication.JwtBearer;
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
        policy.WithOrigins("http://localhost:3000", "https://localhost:3000")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// 5. Configure Authentication with Auth0 / Dev JWT Bearer
var devSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes("AgroConnect_SuperSecret_Dev_Key_12345!_For_Local_Testing"));

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
        var auth0Domain = builder.Configuration["Auth0:Domain"]
            ?? throw new InvalidOperationException("Auth0:Domain no configurado. La aplicación no puede iniciar sin este valor.");
        var auth0Audience = builder.Configuration["Auth0:Audience"]
            ?? throw new InvalidOperationException("Auth0:Audience no configurado. La aplicación no puede iniciar sin este valor.");

        var authority = auth0Domain.StartsWith("http", StringComparison.OrdinalIgnoreCase) ? auth0Domain : $"https://{auth0Domain}/";

        options.Authority = authority;
        options.Audience = auth0Audience;
        options.RequireHttpsMetadata = true;

        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = authority,
            ValidateAudience = true,
            ValidAudience = auth0Audience,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidAlgorithms = new[] { SecurityAlgorithms.RsaSha256 },
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
        Title = "AgroConnect API - Módulo Match Productor ↔ Profesional",
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

var app = builder.Build();

// 7. Middlewares Pipeline in Strict Order
app.UseMiddleware<ExceptionHandlingMiddleware>();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "AgroConnect API v1");
    });
}

if (!app.Environment.IsDevelopment() && !app.Environment.IsEnvironment("Testing"))
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
