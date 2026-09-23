namespace AgroConnect.Domain.Enums;

/// <summary>
/// Lifecycle status of a Match connection between a Producer and a Professional.
/// </summary>
public enum MatchStatus
{
    Pending = 1,
    Active = 2,
    Rejected = 3,
    Cancelled = 4,
    Completed = 5
}
