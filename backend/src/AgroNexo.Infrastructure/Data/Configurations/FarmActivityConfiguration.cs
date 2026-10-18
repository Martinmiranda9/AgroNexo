using AgroNexo.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AgroNexo.Infrastructure.Data.Configurations;

public class FarmActivityConfiguration : IEntityTypeConfiguration<FarmActivity>
{
    public void Configure(EntityTypeBuilder<FarmActivity> builder)
    {
        builder.ToTable("farm_activities");

        builder.HasKey(a => a.Id);

        builder.Property(a => a.FarmId).IsRequired();
        builder.Property(a => a.CampaignId);
        builder.Property(a => a.LotId);
        builder.Property(a => a.Type).IsRequired().HasConversion<int>();
        builder.Property(a => a.Title).IsRequired().HasMaxLength(FarmActivity.TitleMaxLength);
        builder.Property(a => a.Notes).HasMaxLength(FarmActivity.NotesMaxLength);
        builder.Property(a => a.Date).IsRequired();
        builder.Property(a => a.Status).IsRequired().HasConversion<int>();
        builder.Property(a => a.CompletedAt);
        builder.Property(a => a.HectaresWorked).HasPrecision(12, 2);
        builder.Property(a => a.AuthorProfessionalId);
        builder.Property(a => a.CreatedAt).IsRequired();
        builder.Property(a => a.UpdatedAt);

        builder.Ignore(a => a.IsOpen);
        builder.Ignore(a => a.IsFieldLabor);

        builder.HasIndex(a => new { a.FarmId, a.Date });
        builder.HasIndex(a => a.CampaignId);
        builder.HasIndex(a => a.LotId);

        builder.HasOne<Farm>()
            .WithMany()
            .HasForeignKey(a => a.FarmId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne<Campaign>()
            .WithMany()
            .HasForeignKey(a => a.CampaignId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne<Lot>()
            .WithMany()
            .HasForeignKey(a => a.LotId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne<Professional>()
            .WithMany()
            .HasForeignKey(a => a.AuthorProfessionalId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
