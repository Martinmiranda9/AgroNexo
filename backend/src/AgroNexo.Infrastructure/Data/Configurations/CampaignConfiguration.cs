using AgroNexo.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AgroNexo.Infrastructure.Data.Configurations;

public class CampaignConfiguration : IEntityTypeConfiguration<Campaign>
{
    public void Configure(EntityTypeBuilder<Campaign> builder)
    {
        builder.ToTable("campaigns");

        builder.HasKey(c => c.Id);

        builder.Property(c => c.FarmId).IsRequired();
        builder.Property(c => c.Name).IsRequired().HasMaxLength(7);
        builder.Property(c => c.StartsOn).IsRequired();
        builder.Property(c => c.EndsOn).IsRequired();
        builder.Property(c => c.CreatedAt).IsRequired();
        builder.Property(c => c.UpdatedAt);

        // Una sola "2026/27" por campo.
        builder.HasIndex(c => new { c.FarmId, c.Name }).IsUnique();

        // El campo es de otro tenant para los profesionales: la relación va sin navegación y sin filtro de tenant.
        builder.HasOne<Farm>()
            .WithMany()
            .HasForeignKey(c => c.FarmId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
