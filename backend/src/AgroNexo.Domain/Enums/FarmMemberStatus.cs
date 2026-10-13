namespace AgroNexo.Domain.Enums;

/// <summary>
/// Estado de la participación de un profesional en el equipo de un campo.
/// </summary>
public enum FarmMemberStatus
{
    Active = 0,

    /// <summary>El profesional dejó el campo por su cuenta.</summary>
    Left = 1,

    /// <summary>El productor lo desvinculó.</summary>
    Removed = 2,

    /// <summary>El productor archivó el campo y el equipo se dio de baja con él.</summary>
    FarmArchived = 3
}
