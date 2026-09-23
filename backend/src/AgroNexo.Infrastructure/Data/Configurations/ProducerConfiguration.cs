using AgroNexo.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AgroNexo.Infrastructure.Data.Configurations;

public class ProducerConfiguration : IEntityTypeConfiguration<Producer>
{
    public void Configure(EntityTypeBuilder<Producer> builder)
    {
        builder.ToTable("producers");

        builder.HasKey(p => p.Id);

        builder.Property(p => p.TenantId)
            .IsRequired();

        builder.Property(p => p.Auth0UserId)
            .IsRequired()
            .HasMaxLength(128);

        builder.Property(p => p.FirstName)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(p => p.LastName)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(p => p.DocumentNumber)
            .HasMaxLength(50);

        builder.Property(p => p.IsActive)
            .IsRequired()
            .HasDefaultValue(true);

        builder.Property(p => p.PublicId)
            .IsRequired()
            .HasDefaultValue(0L);

        builder.Property(p => p.CreatedAt)
            .IsRequired();

        builder.Property(p => p.UpdatedAt);

        // Indexes
        builder.HasIndex(p => p.Auth0UserId)
            .IsUnique();

        builder.HasIndex(p => p.PublicId)
            .IsUnique();

        builder.HasIndex(p => p.TenantId);

        // Relationships
        builder.HasOne(p => p.Tenant)
            .WithMany(t => t.Producers)
            .HasForeignKey(p => p.TenantId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(p => p.Farms)
            .WithOne(f => f.Producer)
            .HasForeignKey(f => f.ProducerId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(p => p.Matches)
            .WithOne(m => m.Producer)
            .HasForeignKey(m => m.ProducerId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(p => p.DiscoveryRequests)
            .WithOne(d => d.Producer)
            .HasForeignKey(d => d.ProducerId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
