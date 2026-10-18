namespace AgroNexo.Application.Farms.DTOs;

/// <summary>
/// Campaña del campo ("2026/27") con su período.
/// </summary>
public class CampaignResponse
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public DateOnly StartsOn { get; set; }
    public DateOnly EndsOn { get; set; }
}
