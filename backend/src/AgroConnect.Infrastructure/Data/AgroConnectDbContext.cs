using System.Reflection;
using AgroConnect.Application.Common.Interfaces;
using AgroConnect.Domain.Common;
using AgroConnect.Domain.Entities;
using AgroConnect.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace AgroConnect.Infrastructure.Data;

public class AgroConnectDbContext : DbContext
{
    private readonly ITenantContext? _tenantContext;

    public AgroConnectDbContext(DbContextOptions<AgroConnectDbContext> options)
        : base(options)
    {
    }

    public AgroConnectDbContext(
        DbContextOptions<AgroConnectDbContext> options,
        ITenantContext tenantContext)
        : base(options)
    {
        _tenantContext = tenantContext;
    }

    public Guid CurrentTenantId => _tenantContext?.TenantId ?? Guid.Empty;

    public DbSet<Tenant> Tenants => Set<Tenant>();
    public DbSet<Producer> Producers => Set<Producer>();
    public DbSet<Professional> Professionals => Set<Professional>();
    public DbSet<Match> Matches => Set<Match>();
    public DbSet<MatchDiscoveryRequest> MatchDiscoveryRequests => Set<MatchDiscoveryRequest>();
    public DbSet<MatchRecommendation> MatchRecommendations => Set<MatchRecommendation>();
    public DbSet<Farm> Farms => Set<Farm>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Register PostGIS extension
        modelBuilder.HasPostgresExtension("postgis");

        // Apply entity configurations from current assembly
        modelBuilder.ApplyConfigurationsFromAssembly(Assembly.GetExecutingAssembly());

        // Multi-tenant and Soft-delete Global Query Filters:
        // 1. Tenant workspace filter (Soft delete)
        modelBuilder.Entity<Tenant>().HasQueryFilter(t => t.IsActive);

        // 2. Producer entity filter (Global entity, only soft delete)
        modelBuilder.Entity<Producer>().HasQueryFilter(p => p.IsActive);

        // 3. Professional entity filter (Tenant-scoped + Soft delete)
        modelBuilder.Entity<Professional>().HasQueryFilter(p =>
            p.IsActive && p.TenantId == CurrentTenantId);

        // 4. Farm entity filter (Tenant-scoped + Soft delete)
        modelBuilder.Entity<Farm>().HasQueryFilter(f =>
            f.IsActive && f.TenantId == CurrentTenantId);

        // Note: Match, MatchDiscoveryRequest, and MatchRecommendation do NOT have a restrictive
        // single-tenant filter because Match serves as an inter-tenant bridge between Producer (Tenant A)
        // and Professional (Tenant B).
    }

    public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        // 1. Set UpdatedAt for modified entities
        foreach (var entry in ChangeTracker.Entries<BaseEntity>())
        {
            if (entry.State == EntityState.Modified)
                entry.Entity.MarkUpdated();
        }

        // 2. Auto-assign PublicId for new entities that haven't been given one yet
        await AssignPublicIdsAsync(cancellationToken);

        return await base.SaveChangesAsync(cancellationToken);
    }

    private async Task AssignPublicIdsAsync(CancellationToken cancellationToken)
    {
        // ── Producers ────────────────────────────────────────────────────────
        foreach (var entry in ChangeTracker.Entries<Producer>()
            .Where(e => e.State == EntityState.Added && e.Entity.PublicId == 0))
        {
            long seq = await NextSequenceValueAsync("producers_public_seq", cancellationToken);
            entry.Property(nameof(Producer.PublicId)).CurrentValue =
                PublicIdGenerator.Compute(PublicIdGenerator.ProducerPrefix, seq);
        }

        // ── Professionals ────────────────────────────────────────────────────
        foreach (var entry in ChangeTracker.Entries<Professional>()
            .Where(e => e.State == EntityState.Added && e.Entity.PublicId == 0))
        {
            long prefix = entry.Entity.Role switch
            {
                ProfessionalRole.Agronomist => PublicIdGenerator.AgronomistPrefix,
                ProfessionalRole.Accountant => PublicIdGenerator.AccountantPrefix,
                ProfessionalRole.Investor   => PublicIdGenerator.InvestorPrefix,
                _                           => PublicIdGenerator.OtherPrefix
            };

            long seq = await NextSequenceValueAsync("professionals_public_seq", cancellationToken);
            entry.Property(nameof(Professional.PublicId)).CurrentValue =
                PublicIdGenerator.Compute(prefix, seq);
        }

        // ── Farms ────────────────────────────────────────────────────────────
        foreach (var entry in ChangeTracker.Entries<Farm>()
            .Where(e => e.State == EntityState.Added && e.Entity.PublicId == 0))
        {
            long seq = await NextSequenceValueAsync("farms_public_seq", cancellationToken);
            entry.Property(nameof(Farm.PublicId)).CurrentValue =
                PublicIdGenerator.Compute(PublicIdGenerator.FarmPrefix, seq);
        }
    }

    private static readonly System.Text.RegularExpressions.Regex ValidSequenceName = new(@"^[a-zA-Z_][a-zA-Z0-9_]{0,62}$", System.Text.RegularExpressions.RegexOptions.Compiled);

    private static readonly HashSet<string> AllowedSequences = new()
    {
        "producers_public_seq",
        "professionals_public_seq",
        "farms_public_seq"
    };

    /// <summary>
    /// Fetches the next value from a PostgreSQL sequence, creating it if it does not exist.
    /// </summary>
    private async Task<long> NextSequenceValueAsync(string sequenceName, CancellationToken cancellationToken)
    {
        if (!AllowedSequences.Contains(sequenceName) || !ValidSequenceName.IsMatch(sequenceName))
            throw new ArgumentException($"Nombre de secuencia no permitido: {sequenceName}", nameof(sequenceName));

        var conn = Database.GetDbConnection();
        if (conn.State != System.Data.ConnectionState.Open)
            await conn.OpenAsync(cancellationToken);

        using var cmd = conn.CreateCommand();
        // SEQUENCE is created lazily so we never need a manual migration for it.
        cmd.CommandText = $@"
            CREATE SEQUENCE IF NOT EXISTS ""{sequenceName}"" START 1 INCREMENT 1;
            SELECT nextval('""{sequenceName}""');";

        var result = await cmd.ExecuteScalarAsync(cancellationToken);
        return Convert.ToInt64(result);
    }
}
