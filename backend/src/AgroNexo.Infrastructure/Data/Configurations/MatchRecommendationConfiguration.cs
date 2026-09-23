using AgroNexo.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AgroNexo.Infrastructure.Data.Configurations;

public class MatchRecommendationConfiguration : IEntityTypeConfiguration<MatchRecommendation>
{
    public void Configure(EntityTypeBuilder<MatchRecommendation> builder)
    {
        builder.ToTable("match_recommendations");

        builder.HasKey(r => r.Id);

        builder.Property(r => r.MatchDiscoveryRequestId)
            .IsRequired();

        builder.Property(r => r.ProfessionalId)
            .IsRequired();

        builder.Property(r => r.Score)
            .HasColumnType("decimal(5,4)")
            .HasPrecision(5, 4)
            .IsRequired();

        builder.Property(r => r.RankPosition)
            .IsRequired();

        builder.Property(r => r.CreatedAt)
            .IsRequired();

        builder.HasIndex(r => r.MatchDiscoveryRequestId);
        builder.HasIndex(r => r.ProfessionalId);

        // Relationships
        builder.HasOne(r => r.MatchDiscoveryRequest)
            .WithMany(req => req.Recommendations)
            .HasForeignKey(r => r.MatchDiscoveryRequestId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(r => r.Professional)
            .WithMany(p => p.Recommendations)
            .HasForeignKey(r => r.ProfessionalId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
