namespace AgroNexo.Application.Farms.Services;

/// <summary>
/// Fecha de hoy para las reglas del campo. Se toma la hora de Argentina (UTC−3, sin horario de verano) para que "hoy"
/// no cambie a las 21 h.
/// </summary>
public static class FarmCalendar
{
    private static readonly TimeSpan ArgentinaOffset = TimeSpan.FromHours(-3);

    public static DateOnly Today(TimeProvider clock) =>
        DateOnly.FromDateTime(clock.GetUtcNow().ToOffset(ArgentinaOffset).DateTime);
}
