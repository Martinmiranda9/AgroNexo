using AgroNexo.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AgroNexo.Infrastructure.Data.Configurations;

public class LotCropConfiguration : IEntityTypeConfiguration<LotCrop>
{
    public void Configure(EntityTypeBuilder<LotCrop> builder)
    {
        builder.ToTable("lot_crops");

        builder.HasKey(c => c.Id);

        // El id lo asigna el dominio; el repositorio agrega el cultivo explícitamente.
        builder.Property(c => c.Id).ValueGeneratedNever();

        builder.Property(c => c.LotId).IsRequired();
        builder.Property(c => c.CampaignId).IsRequired();
        builder.Property(c => c.Crop).IsRequired().HasConversion<int>();
        builder.Property(c => c.SowingDate);
        builder.Property(c => c.ExpectedHarvestDate);
        builder.Property(c => c.CreatedAt).IsRequired();
        builder.Property(c => c.UpdatedAt);

        // El mismo cultivo no se repite en un lote y campaña (sí trigo y soja de segunda).
        builder.HasIndex(c => new { c.LotId, c.CampaignId, c.Crop }).IsUnique();
        builder.HasIndex(c => c.CampaignId);

        builder.HasOne<Campaign>()
            .WithMany()
            .HasForeignKey(c => c.CampaignId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
