using AgroNexo.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AgroNexo.Infrastructure.Data.Configurations;

public class FarmMemberConfiguration : IEntityTypeConfiguration<FarmMember>
{
    public void Configure(EntityTypeBuilder<FarmMember> builder)
    {
        builder.ToTable("farm_members");

        builder.HasKey(m => m.Id);

        builder.Property(m => m.FarmId).IsRequired();
        builder.Property(m => m.ProfessionalId).IsRequired();
        builder.Property(m => m.MatchId).IsRequired();

        builder.Property(m => m.Status)
            .IsRequired()
            .HasConversion<int>();

        builder.Property(m => m.JoinedAt).IsRequired();
        builder.Property(m => m.EndedAt);
        builder.Property(m => m.CreatedAt).IsRequired();
        builder.Property(m => m.UpdatedAt);

        builder.Ignore(m => m.IsActive);

        // Un solo miembro activo por (campo, profesional); quien se fue puede volver a entrar. Status: Active = 0
        builder.HasIndex(m => new { m.FarmId, m.ProfessionalId })
            .IsUnique()
            .HasFilter("\"Status\" = 0");

        builder.HasIndex(m => m.ProfessionalId);

        builder.HasOne(m => m.Farm)
            .WithMany()
            .HasForeignKey(m => m.FarmId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(m => m.Professional)
            .WithMany()
            .HasForeignKey(m => m.ProfessionalId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne<Match>()
            .WithMany()
            .HasForeignKey(m => m.MatchId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
