using AgroNexo.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AgroNexo.Infrastructure.Data.Configurations;

public class ProfessionalConfiguration : IEntityTypeConfiguration<Professional>
{
    public void Configure(EntityTypeBuilder<Professional> builder)
    {
        builder.ToTable("professionals");

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

        builder.Property(p => p.Email)
            .HasMaxLength(254);

        builder.Property(p => p.Role)
            .IsRequired()
            .HasConversion<int>();

        builder.Property(p => p.Specialty)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(p => p.PhoneNumber)
            .IsRequired()
            .HasMaxLength(20)
            .HasDefaultValue(string.Empty);

        builder.Property(p => p.LicenseNumber)
            .HasMaxLength(50);

        builder.Property(p => p.CoverageArea)
            .HasColumnType("geometry");

        builder.Property(p => p.YearsExperience)
            .IsRequired()
            .HasDefaultValue(0);

        builder.Property(p => p.MaxCapacity)
            .IsRequired()
            .HasDefaultValue(20);

        builder.Property(p => p.IsVerified)
            .IsRequired()
            .HasDefaultValue(false);

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

        // Spatial GIST Index on CoverageArea for fast PostGIS ST_Contains / ST_Intersects queries
        builder.HasIndex(p => p.CoverageArea)
            .HasMethod("GIST");

        // Relationships
        builder.HasOne(p => p.Tenant)
            .WithMany(t => t.Professionals)
            .HasForeignKey(p => p.TenantId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(p => p.Matches)
            .WithOne(m => m.Professional)
            .HasForeignKey(m => m.ProfessionalId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(p => p.Recommendations)
            .WithOne(r => r.Professional)
            .HasForeignKey(r => r.ProfessionalId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
