using AgroNexo.Domain.Entities;
using AgroNexo.Domain.Enums;
using AgroNexo.Domain.Exceptions;
using FluentAssertions;
using Xunit;

namespace AgroNexo.UnitTests;

public class FarmWorkspaceDomainTests
{
    private static Farm NewFarm(string? description = null) =>
        new(Guid.NewGuid(), Guid.NewGuid(), "La Esperanza", 350, null, description);

    [Fact]
    public void FarmMember_Leave_EndsTheParticipation()
    {
        var member = new FarmMember(Guid.NewGuid(), Guid.NewGuid(), Guid.NewGuid());

        member.Leave();

        member.Status.Should().Be(FarmMemberStatus.Left);
        member.IsActive.Should().BeFalse();
        member.EndedAt.Should().NotBeNull();
    }

    [Fact]
    public void FarmMember_EndedTwice_Throws()
    {
        var member = new FarmMember(Guid.NewGuid(), Guid.NewGuid(), Guid.NewGuid());
        member.Remove();

        var act = () => member.Leave();

        act.Should().Throw<DomainException>();
        member.Status.Should().Be(FarmMemberStatus.Removed);
    }

    [Fact]
    public void FarmMember_WithoutMatch_Throws()
    {
        var act = () => new FarmMember(Guid.NewGuid(), Guid.NewGuid(), Guid.Empty);

        act.Should().Throw<DomainValidationException>();
    }

    [Fact]
    public void Farm_Description_IsTrimmedAndBlankBecomesNull()
    {
        NewFarm("  Campo en Berrotarán  ").Description.Should().Be("Campo en Berrotarán");
        NewFarm("   ").Description.Should().BeNull();
    }

    [Fact]
    public void Farm_DescriptionTooLong_Throws()
    {
        var act = () => NewFarm(new string('a', Farm.DescriptionMaxLength + 1));

        act.Should().Throw<DomainValidationException>();
    }

    [Fact]
    public void Farm_Archived_IsReadOnlyAndCannotBeArchivedAgain()
    {
        var farm = NewFarm();

        farm.Archive();

        farm.IsArchived.Should().BeTrue();
        farm.Invoking(f => f.UpdateDetails("Otro nombre", 100)).Should().Throw<DomainException>();
        farm.Invoking(f => f.Archive()).Should().Throw<DomainException>();
    }
}
