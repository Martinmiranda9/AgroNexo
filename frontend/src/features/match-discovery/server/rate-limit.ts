/**
 * Límite de llamadas por usuario para las Server Actions que gastan cuota de IA: son endpoints públicos.
 * Mejor esfuerzo: la memoria no se comparte entre instancias del servidor (en Vercel cada una tiene su cuenta),
 * pero frena abusos simples. Para un límite real hace falta un almacenamiento compartido.
 */
export function createRateLimiter(maxCallsPerMinute: number): (userId: string) => boolean {
  const recentCalls = new Map<string, number[]>();

  /** `true` si el usuario ya llegó al límite del último minuto. */
  return (userId) => {
    const now = Date.now();
    const calls = (recentCalls.get(userId) ?? []).filter((at) => now - at < 60_000);
    if (calls.length >= maxCallsPerMinute) {
      recentCalls.set(userId, calls);
      return true;
    }
    recentCalls.set(userId, [...calls, now]);
    return false;
  };
}
