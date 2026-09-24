using System.Text.RegularExpressions;

namespace AgroNexo.Domain.Common;

/// <summary>
/// Reglas de formato para el número de WhatsApp (formato internacional E.164).
/// </summary>
public static class PhoneNumberRules
{
    public const string Pattern = @"^\+[1-9][0-9]{7,14}$";
    public const string ErrorMessage = "El WhatsApp debe estar en formato internacional, ej: +5493511234567.";
    public const int MaxLength = 20;

    private static readonly Regex PhoneRegex = new(Pattern, RegexOptions.Compiled | RegexOptions.CultureInvariant);

    public static bool IsValid(string? phoneNumber) =>
        !string.IsNullOrWhiteSpace(phoneNumber) && PhoneRegex.IsMatch(phoneNumber.Trim());
}
