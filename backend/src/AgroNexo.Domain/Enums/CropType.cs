namespace AgroNexo.Domain.Enums;

/// <summary>
/// Cultivos que se pueden sembrar en un lote. Los ids coinciden con el catálogo del frontend (`NEED_CROPS`).
/// </summary>
public enum CropType
{
    Soybean = 0,
    Corn = 1,
    Wheat = 2,
    Sunflower = 3,
    Barley = 4,
    Sorghum = 5,
    Peanut = 6,
    Other = 99
}
