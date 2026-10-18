namespace AgroNexo.Domain.Enums;

/// <summary>
/// Tipo de labor o tarea registrada en el campo.
/// </summary>
public enum FarmActivityType
{
    Sowing = 0,
    Spraying = 1,
    Fertilization = 2,
    Harvest = 3,
    Monitoring = 4,
    Visit = 5,

    /// <summary>Labranza: arado, rastra, cincel.</summary>
    Tillage = 6,
    Other = 99
}
