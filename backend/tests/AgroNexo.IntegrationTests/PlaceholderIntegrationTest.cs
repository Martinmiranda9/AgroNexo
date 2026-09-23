using FluentAssertions;
using Xunit;

namespace AgroNexo.IntegrationTests;

public class PlaceholderIntegrationTest
{
    [Fact]
    public void SolutionSetup_SanityCheck()
    {
        true.Should().BeTrue();
    }
}
