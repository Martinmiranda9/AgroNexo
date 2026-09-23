namespace AgroConnect.Domain.Common;

/// <summary>
/// Interface for entities supporting soft-deletion.
/// </summary>
public interface ISoftDeletable
{
    bool IsActive { get; }
    void Deactivate();
    void Activate();
}
