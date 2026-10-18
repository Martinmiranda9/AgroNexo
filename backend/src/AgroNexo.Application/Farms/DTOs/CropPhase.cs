namespace AgroNexo.Application.Farms.DTOs;

/// <summary>
/// En qué etapa está un cultivo según sus fechas: por sembrar, en desarrollo o en cosecha.
/// </summary>
public enum CropPhase
{
    Sowing = 0,
    Growing = 1,
    Harvest = 2
}
