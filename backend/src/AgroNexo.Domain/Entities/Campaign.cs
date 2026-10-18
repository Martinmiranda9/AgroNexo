using System.Text.RegularExpressions;
using AgroNexo.Domain.Common;
using AgroNexo.Domain.Exceptions;

namespace AgroNexo.Domain.Entities;

/// <summary>
/// Campaña agrícola de un campo (por ejemplo "2026/27"): el período dentro del espacio de trabajo en el que se siembran
/// y cosechan los lotes. No es un espacio nuevo; el equipo sigue siendo el del campo.
/// </summary>
public class Campaign : BaseEntity, IAggregateRoot
{
    private static readonly Regex NameFormat = new(@"^(\d{4})/(\d{2})$", RegexOptions.Compiled);

    public Guid FarmId { get; private set; }

    /// <summary>Se escribe "2026/27": el año de inicio completo y los dos últimos dígitos del siguiente.</summary>
    public string Name { get; private set; } = string.Empty;

    public DateOnly StartsOn { get; private set; }
    public DateOnly EndsOn { get; private set; }

    // Parameterless constructor for EF Core
    protected Campaign()
    {
    }

    public Campaign(Guid farmId, string name, DateOnly startsOn, DateOnly endsOn)
    {
        if (farmId == Guid.Empty)
            throw new DomainValidationException(nameof(FarmId), "El FarmId es obligatorio.");

        Id = Guid.NewGuid();
        FarmId = farmId;
        Apply(name, startsOn, endsOn);
        CreatedAt = DateTime.UtcNow;
    }

    public void Update(string name, DateOnly startsOn, DateOnly endsOn)
    {
        Apply(name, startsOn, endsOn);
        MarkUpdated();
    }

    public bool Contains(DateOnly date) => date >= StartsOn && date <= EndsOn;

    /// <summary>Avance de la campaña entre 0 y 1 para una fecha dada.</summary>
    public decimal ProgressOn(DateOnly date)
    {
        if (date <= StartsOn) return 0m;
        if (date >= EndsOn) return 1m;

        var total = EndsOn.DayNumber - StartsOn.DayNumber;
        return Math.Round((decimal)(date.DayNumber - StartsOn.DayNumber) / total, 4);
    }

    private void Apply(string name, DateOnly startsOn, DateOnly endsOn)
    {
        var trimmed = name?.Trim() ?? string.Empty;
        var match = NameFormat.Match(trimmed);
        if (!match.Success)
            throw new DomainValidationException(nameof(Name), "La campaña se escribe con el formato 2026/27.");

        var startYear = int.Parse(match.Groups[1].Value);
        var endSuffix = int.Parse(match.Groups[2].Value);
        if ((startYear + 1) % 100 != endSuffix)
            throw new DomainValidationException(nameof(Name), "La campaña tiene que abarcar dos años seguidos, por ejemplo 2026/27.");

        if (endsOn <= startsOn)
            throw new DomainValidationException(nameof(EndsOn), "La fecha de fin tiene que ser posterior a la de inicio.");

        Name = trimmed;
        StartsOn = startsOn;
        EndsOn = endsOn;
    }
}
