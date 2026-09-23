namespace AgroConnect.Domain.Enums;

/// <summary>
/// Tipo de actividad productiva principal del productor.
/// </summary>
public enum ProducerType
{
    /// <summary>Cultivos agrícolas extensivos (cereales, oleaginosas).</summary>
    Agricola = 1,

    /// <summary>Producción ganadera (cría, recría o engorde bovino).</summary>
    Ganadero = 2,

    /// <summary>Combinación de agricultura y ganadería con rotación de cultivos y pasturas.</summary>
    Mixto = 3
}
