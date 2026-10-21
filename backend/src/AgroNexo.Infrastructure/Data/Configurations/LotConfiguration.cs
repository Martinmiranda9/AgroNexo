using AgroNexo.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AgroNexo.Infrastructure.Data.Configurations;

public class LotConfiguration : IEntityTypeConfiguration<Lot>
{
    public void Configure(EntityTypeBuilder<Lot> builder)
    {
        builder.ToTable("lots");

        builder.HasKey(l => l.Id);

        builder.Property(l => l.FarmId).IsRequired();
        builder.Property(l => l.Name).IsRequired().HasMaxLength(Lot.NameMaxLength);
        builder.Property(l => l.Hectares).IsRequired().HasPrecision(12, 2);
        builder.Property(l => l.IsActive).IsRequired();
        builder.Property(l => l.CreatedAt).IsRequired();
        builder.Property(l => l.UpdatedAt);

        builder.Property(l => l.Boundary).HasColumnType($"geometry(Polygon,{Lot.BoundarySrid})");
        builder.Property(l => l.CreatedByProfessionalId);
        builder.Property(l => l.BoundaryEditedByProfessionalId);
        builder.Property(l => l.BoundaryEditedAt);

        builder.HasIndex(l => l.FarmId);
        builder.HasIndex(l => l.Boundary).HasMethod("gist");

        builder.HasOne<Farm>()
            .WithMany()
            .HasForeignKey(l => l.FarmId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(l => l.Crops)
            .WithOne()
            .HasForeignKey(c => c.LotId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Navigation(l => l.Crops).UsePropertyAccessMode(PropertyAccessMode.Field);
    }
}
