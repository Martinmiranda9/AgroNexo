using AgroConnect.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AgroConnect.Infrastructure.Data.Configurations;

public class MatchConfiguration : IEntityTypeConfiguration<Match>
{
    public void Configure(EntityTypeBuilder<Match> builder)
    {
        builder.ToTable("matches");

        builder.HasKey(m => m.Id);

        builder.Property(m => m.ProducerId)
            .IsRequired();

        builder.Property(m => m.ProfessionalId)
            .IsRequired();

        builder.Property(m => m.Status)
            .IsRequired()
            .HasConversion<int>();

        builder.Property(m => m.RequestedAt)
            .IsRequired();

        builder.Property(m => m.RespondedAt);

        builder.Property(m => m.CreatedAt)
            .IsRequired();

        builder.Property(m => m.UpdatedAt);

        // Partial Unique Index: only 1 active or pending match allowed per (ProducerId, ProfessionalId) pair.
        // Status: Pending = 1, Active = 2
        builder.HasIndex(m => new { m.ProducerId, m.ProfessionalId })
            .IsUnique()
            .HasFilter("\"Status\" IN (1, 2)");

        // Indexes for performance
        builder.HasIndex(m => m.ProducerId);
        builder.HasIndex(m => m.ProfessionalId);
        builder.HasIndex(m => m.Status);

        // Foreign Key Relationships
        builder.HasOne(m => m.Producer)
            .WithMany(p => p.Matches)
            .HasForeignKey(m => m.ProducerId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(m => m.Professional)
            .WithMany(p => p.Matches)
            .HasForeignKey(m => m.ProfessionalId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
