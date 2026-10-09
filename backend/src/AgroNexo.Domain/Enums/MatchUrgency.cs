namespace AgroNexo.Domain.Enums;

/// <summary>
/// Urgencia con la que el productor necesita al profesional, tal como la expresó en su pedido.
/// </summary>
public enum MatchUrgency
{
    /// <summary>Necesita al profesional en los próximos días.</summary>
    ThisWeek = 1,

    /// <summary>Necesita al profesional en las próximas semanas.</summary>
    ThisMonth = 2
}
