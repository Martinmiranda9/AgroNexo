namespace AgroNexo.Domain.Enums;

/// <summary>
/// Rango de hectáreas que maneja un productor.
/// </summary>
public enum HectaresRange
{
    /// <summary>Hasta 100 hectáreas.</summary>
    Up100 = 1,

    /// <summary>Entre 100 y 500 hectáreas.</summary>
    From100To500 = 2,

    /// <summary>Entre 500 y 1.000 hectáreas.</summary>
    From500To1000 = 3,

    /// <summary>Entre 1.000 y 5.000 hectáreas.</summary>
    From1000To5000 = 4,

    /// <summary>Más de 5.000 hectáreas.</summary>
    Over5000 = 5
}
