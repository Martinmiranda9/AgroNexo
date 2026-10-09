using AgroNexo.Domain.Enums;
using AgroNexo.Domain.Exceptions;
using AgroNexo.Domain.ValueObjects;
using FluentAssertions;
using Xunit;

namespace AgroNexo.UnitTests;

public class NeedBriefTests
{
    private const string ValidSummary = "Productor de Berrotarán, 350 ha de soja, necesita ayuda con retenciones, este mes.";

    [Fact]
    public void Create_ValidData_NormalizesAndKeepsEveryField()
    {
        var brief = new NeedBrief(
            "  " + ValidSummary + "  ",
            "  Berrotarán, Córdoba ",
            350,
            MatchUrgency.ThisMonth,
            new[] { "Farm-Taxes", "farm-taxes", " grain-settlement " },
            new[] { "soybean" });

        brief.Summary.Should().Be(ValidSummary);
        brief.PlaceLabel.Should().Be("Berrotarán, Córdoba");
        brief.Hectares.Should().Be(350);
        brief.Urgency.Should().Be(MatchUrgency.ThisMonth);
        brief.Topics.Should().Equal("farm-taxes", "grain-settlement");
        brief.Crops.Should().Equal("soybean");
    }

    [Fact]
    public void Create_OnlySummary_LeavesTheRestEmpty()
    {
        var brief = new NeedBrief(ValidSummary);

        brief.PlaceLabel.Should().BeNull();
        brief.Hectares.Should().BeNull();
        brief.Urgency.Should().BeNull();
        brief.Topics.Should().BeEmpty();
        brief.Crops.Should().BeEmpty();
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData("corto")]
    public void Create_SummaryTooShortOrBlank_ThrowsDomainValidationException(string summary)
    {
        Action act = () => new NeedBrief(summary);

        act.Should().Throw<DomainValidationException>().WithMessage("*resumen*");
    }

    [Fact]
    public void Create_SummaryTooLong_ThrowsDomainValidationException()
    {
        Action act = () => new NeedBrief(new string('a', NeedBrief.SummaryMaxLength + 1));

        act.Should().Throw<DomainValidationException>();
    }

    [Theory]
    [InlineData(0)]
    [InlineData(-5)]
    [InlineData(1_000_001)]
    public void Create_HectaresOutOfRange_ThrowsDomainValidationException(int hectares)
    {
        Action act = () => new NeedBrief(ValidSummary, hectares: hectares);

        act.Should().Throw<DomainValidationException>().WithMessage("*Hectares*");
    }

    [Fact]
    public void Create_UndefinedUrgency_ThrowsDomainValidationException()
    {
        Action act = () => new NeedBrief(ValidSummary, urgency: (MatchUrgency)99);

        act.Should().Throw<DomainValidationException>().WithMessage("*Urgency*");
    }

    [Theory]
    [InlineData("Con Espacios")]
    [InlineData("tema_con_guion_bajo")]
    [InlineData("<script>")]
    public void Create_TopicWithInvalidIdentifier_ThrowsDomainValidationException(string topic)
    {
        Action act = () => new NeedBrief(ValidSummary, topics: new[] { topic });

        act.Should().Throw<DomainValidationException>().WithMessage("*Topics*");
    }

    [Fact]
    public void Create_MoreThanFiveCrops_ThrowsDomainValidationException()
    {
        var crops = new[] { "soybean", "corn", "wheat", "sunflower", "barley", "sorghum" };

        Action act = () => new NeedBrief(ValidSummary, crops: crops);

        act.Should().Throw<DomainValidationException>().WithMessage("*Crops*");
    }

    [Fact]
    public void Create_PlaceTooLong_ThrowsDomainValidationException()
    {
        Action act = () => new NeedBrief(ValidSummary, placeLabel: new string('x', NeedBrief.PlaceMaxLength + 1));

        act.Should().Throw<DomainValidationException>().WithMessage("*PlaceLabel*");
    }
}
