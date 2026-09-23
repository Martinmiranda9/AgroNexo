using AgroNexo.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AgroNexo.Infrastructure.Data.Configurations;

public class FarmConfiguration : IEntityTypeConfiguration<Farm>
{
    public void Configure(EntityTypeBuilder<Farm> builder)
    {
        builder.ToTable("farms");

        builder.HasKey(f => f.Id);

        builder.Property(f => f.TenantId)
            .IsRequired();

        builder.Property(f => f.ProducerId)
            .IsRequired();

        builder.Property(f => f.Name)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(f => f.Location)
            .HasColumnType("geometry");

        builder.Property(f => f.TotalHectares)
            .HasColumnType("decimal(10,2)")
            .HasPrecision(10, 2)
            .IsRequired();

        builder.Property(f => f.IsActive)
            .IsRequired()
            .HasDefaultValue(true);

        builder.Property(f => f.PublicId)
            .IsRequired()
            .HasDefaultValue(0L);

        builder.Property(f => f.CreatedAt)
            .IsRequired();

        builder.Property(f => f.UpdatedAt);

        builder.HasIndex(f => f.TenantId);
        builder.HasIndex(f => f.ProducerId);
        builder.HasIndex(f => f.PublicId)
            .IsUnique();

        // Relationships
        builder.HasOne(f => f.Tenant)
            .WithMany(t => t.Farms)
            .HasForeignKey(f => f.TenantId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(f => f.Producer)
            .WithMany(p => p.Farms)
            .HasForeignKey(f => f.ProducerId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
