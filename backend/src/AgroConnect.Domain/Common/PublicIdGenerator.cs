namespace AgroConnect.Domain.Common;

/// <summary>
/// Generates human-readable numeric public IDs with entity-type prefixes.
/// Uses a dynamic mathematical shift so the prefix is always preserved
/// regardless of how large the sequence grows:
///   PublicId = prefix * 10^(max(digits_in_sequence, MinPadding)) + sequence
///
/// Examples with prefix 10:
///   sequence 1      ? 10 * 10_000 + 1       = 100_001   (6 digits)
///   sequence 9_999  ? 10 * 10_000 + 9_999   = 109_999   (6 digits)
///   sequence 10_000 ? 10 * 100_000 + 10_000 = 1_010_000 (7 digits)
/// </summary>
public static class PublicIdGenerator
{
    // Minimum digits reserved for the sequence (4 ? IDs start at 6 digits).
    private const int MinSequenceDigits = 4;

    // -- Prefix constants -----------------------------------------------------
    public const long ProducerPrefix   = 10;
    public const long AgronomistPrefix = 12;
    public const long AccountantPrefix = 14;
    public const long InvestorPrefix   = 16;
    public const long OtherPrefix      = 19;
    public const long FarmPrefix       = 20;

    /// <summary>
    /// Computes the numeric PublicId = prefix shifted left of the sequence value.
    /// </summary>
    /// <param name="prefix">Entity prefix (e.g. 10 for Producers).</param>
    /// <param name="sequence">Auto-incremental counter (starts at 1).</param>
    public static long Compute(long prefix, long sequence)
    {
        if (sequence <= 0)
            throw new ArgumentOutOfRangeException(nameof(sequence), "La secuencia debe ser mayor a 0.");

        int sequenceDigits = (int)Math.Floor(Math.Log10(sequence)) + 1;
        int paddingDigits  = Math.Max(sequenceDigits, MinSequenceDigits);
        long multiplier    = (long)Math.Pow(10, paddingDigits);

        return (prefix * multiplier) + sequence;
    }
}
