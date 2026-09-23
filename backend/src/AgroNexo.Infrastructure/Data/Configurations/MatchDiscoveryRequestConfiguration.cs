using AgroNexo.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AgroNexo.Infrastructure.Data.Configurations;

public class MatchDiscoveryRequestConfiguration : IEntityTypeConfiguration<MatchDiscoveryRequest>
{
    public void Configure(EntityTypeBuilder<MatchDiscoveryRequest> builder)
    {
        builder.ToTable("match_discovery_requests");

        builder.HasKey(r => r.Id);

        builder.Property(r => r.ProducerId)
            .IsRequired();

        builder.Property(r => r.LocationPoint)
            .HasColumnType("geometry")
            .IsRequired();

        builder.Property(r => r.RequestedSpecialty)
            .HasMaxLength(100);

        builder.Property(r => r.RequiresFieldPresence)
            .IsRequired();

        builder.Property(r => r.CreatedAt)
            .IsRequired();

        builder.HasIndex(r => r.ProducerId);

        // Relationships
        builder.HasOne(r => r.Producer)
            .WithMany(p => p.DiscoveryRequests)
            .HasForeignKey(r => r.ProducerId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(r => r.Recommendations)
            .WithOne(rec => rec.MatchDiscoveryRequest)
            .HasForeignKey(rec => rec.MatchDiscoveryRequestId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
