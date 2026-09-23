using FluentAssertions;
using Xunit;

namespace AgroConnect.IntegrationTests;

public class PlaceholderIntegrationTest
{
    [Fact]
    public void SolutionSetup_SanityCheck()
    {
        true.Should().BeTrue();
    }
}
