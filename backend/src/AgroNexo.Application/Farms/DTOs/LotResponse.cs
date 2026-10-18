using AgroNexo.Domain.Enums;

namespace AgroNexo.Application.Farms.DTOs;

/// <summary>
/// Lote del campo con sus cultivos: de todas las campañas en la lista de lotes, y solo los de la campaña elegida en el
/// tablero.
/// </summary>
public class LotResponse
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public decimal Hectares { get; set; }
    public List<LotCropResponse> Crops { get; set; } = new();

    /// <summary>Última labor de campo del lote en la campaña. Solo en el tablero.</summary>
    public LotLastLaborResponse? LastLabor { get; set; }
}

public class LotLastLaborResponse
{
    public FarmActivityType Type { get; set; }
    public FarmActivityStatus Status { get; set; }
    public DateOnly Date { get; set; }
}
