import type { SearchableRole } from '@/core/models/identity.model';
import type { MatchRecommendation } from '@/core/models/match.model';
import { NEED_TOPICS, ROLE_REQUIRES_PRESENCE, type NeedTopic } from '../config/catalog';
import { fold, matchesAnyPrefix, type NeedInterpretation } from './interpret-need';

export const MAX_RESULTS = 6;

/** Años de ejercicio por debajo de los cuales se avisa en "Falta validar". */
const FEW_YEARS = 3;
/** Radio máximo del motor de ranking del backend: más lejos que esto, la zona no incluye el campo. */
const FAR_KM = 100;

export type Fit = 'fits' | 'maybe';

/** Un profesional listo para mostrar: lo que dice el backend más la explicación de por qué aparece. */
export interface ResultView {
  recommendation: MatchRecommendation;
  fit: Fit;
  /** Una frase: por qué aparece. */
  why: string;
  /** Dónde está respecto de la zona buscada, para la ficha: "A 38 km de tu campo · a distancia". */
  proximity: string;
  /** Lo mismo en dos o tres palabras, para la fila de la lista: "Cubre tu campo", "A 38 km · a distancia". */
  proximityShort: string;
  /** Lo que cumple, en una línea cada uno. */
  checks: string[];
  /** Lo que todavía no se pudo confirmar. */
  missing: string[];
}

export function fullName(r: Pick<MatchRecommendation, 'firstName' | 'lastName'>): string {
  return `${r.firstName} ${r.lastName}`.trim();
}

export function initialsOf(r: Pick<MatchRecommendation, 'firstName' | 'lastName'>): string {
  return `${r.firstName[0] ?? ''}${r.lastName[0] ?? ''}`.toUpperCase();
}

export const hasCapacity = (r: MatchRecommendation) => r.activeMatches < r.maxCapacity;

/** Contador, abogado e inversionista trabajan a distancia: para ellos la distancia al campo no cuenta. */
const needsFieldPresence = (r: MatchRecommendation) =>
  ROLE_REQUIRES_PRESENCE[r.role as SearchableRole] ?? false;

/** Fuera del radio del ranking, y solo para quien tiene que ir al campo. */
const isTooFar = (r: MatchRecommendation) => needsFieldPresence(r) && r.distanceKm >= FAR_KM;

function topicsOf(ids: string[]): NeedTopic[] {
  return NEED_TOPICS.filter((topic) => ids.includes(topic.id));
}

/** La especialidad (texto libre que escribió el profesional) toca alguno de los temas pedidos. */
function specialtyMatches(specialty: string, topics: NeedTopic[]): boolean {
  const folded = fold(specialty);
  return topics.some(
    (topic) => folded.includes(fold(topic.label)) || matchesAnyPrefix(folded, topic.keywords)
  );
}

const lower = (value: string) => value.charAt(0).toLowerCase() + value.slice(1);

const kmLabel = (km: number) => (km < 1 ? 'menos de 1 km' : `${Math.round(km)} km`);

/**
 * Distancia del profesional a la zona buscada. `zone` es "tu campo" o el lugar que nombró el productor.
 * Quien trabaja a distancia también se ubica: la cercanía no lo descarta, pero lo ordena (misma zona primero).
 */
function proximityTexts(r: MatchRecommendation, zone: string) {
  const near = r.distanceKm < 1;
  const away = kmLabel(r.distanceKm);

  if (needsFieldPresence(r)) {
    // `distanceKm` es hasta el CENTRO de su zona. El backend solo devuelve agrónomos cuya zona contiene el punto
    // buscado, así que por debajo del radio máximo cubre el lugar aunque su centro esté lejos.
    const covers = !isTooFar(r);
    const centered = `zona centrada a ${away}`;
    return {
      check: near
        ? `Cubre la zona de ${zone}`
        : covers
          ? `Cubre ${zone}; su ${centered}`
          : `Su zona está a ${away} de ${zone}`,
      why: near
        ? `cubre la zona de ${zone}`
        : covers
          ? `cubre ${zone} (${centered})`
          : `está a ${away} de ${zone}`,
      detail: near
        ? `Cubre la zona de ${zone}`
        : covers
          ? `Cubre ${zone} (${centered})`
          : `A ${Math.round(r.distanceKm)} km de ${zone}`,
      short: covers ? `Cubre ${zone}` : `A ${away}`,
    };
  }
  return {
    check: near
      ? `Está en la zona de ${zone} y trabaja a distancia`
      : `Está a ${away} de ${zone} y trabaja a distancia`,
    why: near
      ? `está en la zona de ${zone} y atiende a distancia`
      : `atiende a distancia, a ${away} de ${zone}`,
    detail: near
      ? `En la zona de ${zone} · a distancia`
      : `A ${Math.round(r.distanceKm)} km de ${zone} · a distancia`,
    short: near ? `En ${zone} · a distancia` : `A ${away} · a distancia`,
  };
}

function explain(
  r: MatchRecommendation,
  need: NeedInterpretation,
  topics: NeedTopic[],
  zone: string
): Omit<ResultView, 'recommendation' | 'fit'> {
  const proximity = proximityTexts(r, zone);
  const topicHit = topics.length > 0 && specialtyMatches(r.specialty, topics);

  const checks: string[] = [];
  const missing: string[] = [];

  checks.push(
    topicHit ? `Trabaja en ${lower(r.specialty)}` : `Su especialidad es ${lower(r.specialty)}`
  );
  if (r.isVerified) checks.push('Matrícula verificada por AgroNexo');
  checks.push(proximity.check);
  if (r.yearsExperience >= 5) checks.push(`${r.yearsExperience} años de experiencia`);
  if (hasCapacity(r)) checks.push('Toma clientes nuevos');

  if (topics.length > 0 && !topicHit) {
    missing.push(`su especialidad no menciona ${topics.map((t) => lower(t.label)).join(' ni ')}`);
  }
  if (!r.isVerified) missing.push('su matrícula todavía no está verificada');
  if (!hasCapacity(r)) missing.push('no tiene cupo para clientes nuevos ahora');
  if (isTooFar(r)) missing.push(`su zona de cobertura no incluye ${zone}`);
  if (r.yearsExperience < FEW_YEARS) missing.push('tiene pocos años de ejercicio');

  const subject = topicHit
    ? `trabaja en ${lower(r.specialty)}`
    : `se especializa en ${lower(r.specialty)}`;
  const but = missing.length > 0 && !topicHit && topics.length > 0 ? `, pero ${missing[0]}` : '';

  return {
    why: `${r.firstName} ${subject} y ${proximity.why}${but}.`,
    proximity: proximity.detail,
    proximityShort: proximity.short,
    checks: checks.slice(0, 5),
    missing,
  };
}

/**
 * Filtra por profesión, marca cuáles encajan con el pedido y arma la explicación de cada uno.
 * El orden base es el del backend (`rankPosition`); acá solo se sube a quienes encajan por delante de quienes
 * "podrían encajar", sin alterar el orden relativo dentro de cada grupo.
 */
export function buildResults(
  recommendations: MatchRecommendation[],
  need: NeedInterpretation,
  zone = 'tu campo'
): ResultView[] {
  const topics = topicsOf(need.topics);

  const views = recommendations
    .filter((r) => !need.role || r.role === need.role)
    .map<ResultView>((r) => {
      const topicOk = topics.length === 0 || specialtyMatches(r.specialty, topics);
      const fit: Fit = topicOk && hasCapacity(r) && !isTooFar(r) ? 'fits' : 'maybe';
      return { recommendation: r, fit, ...explain(r, need, topics, zone) };
    });

  const rank = (v: ResultView) => v.recommendation.rankPosition;
  const group = (fit: Fit) => views.filter((v) => v.fit === fit).sort((a, b) => rank(a) - rank(b));

  return [...group('fits'), ...group('maybe')].slice(0, MAX_RESULTS);
}
