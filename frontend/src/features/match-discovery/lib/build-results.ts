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

function explain(
  r: MatchRecommendation,
  need: NeedInterpretation,
  topics: NeedTopic[]
): Omit<ResultView, 'recommendation' | 'fit'> {
  const presence = needsFieldPresence(r);
  const topicHit = topics.length > 0 && specialtyMatches(r.specialty, topics);

  const checks: string[] = [];
  const missing: string[] = [];

  checks.push(
    topicHit ? `Trabaja en ${lower(r.specialty)}` : `Su especialidad es ${lower(r.specialty)}`
  );
  if (r.isVerified) checks.push('Matrícula verificada por AgroNexo');
  if (presence)
    checks.push(
      r.distanceKm < 1
        ? 'Cubre la zona de tu campo'
        : `Su zona está a ${kmLabel(r.distanceKm)} de tu campo`
    );
  else checks.push('No necesita ir al campo: trabaja a distancia');
  if (r.yearsExperience >= 5) checks.push(`${r.yearsExperience} años de experiencia`);
  if (hasCapacity(r)) checks.push('Toma clientes nuevos');

  if (topics.length > 0 && !topicHit) {
    missing.push(`su especialidad no menciona ${topics.map((t) => lower(t.label)).join(' ni ')}`);
  }
  if (!r.isVerified) missing.push('su matrícula todavía no está verificada');
  if (!hasCapacity(r)) missing.push('no tiene cupo para clientes nuevos ahora');
  if (isTooFar(r)) missing.push('su zona de cobertura no incluye tu campo');
  if (r.yearsExperience < FEW_YEARS) missing.push('tiene pocos años de ejercicio');

  const subject = topicHit
    ? `trabaja en ${lower(r.specialty)}`
    : `se especializa en ${lower(r.specialty)}`;
  const zone = presence
    ? r.distanceKm < 1
      ? 'cubre la zona de tu campo'
      : `está a ${kmLabel(r.distanceKm)} de tu campo`
    : 'atiende a distancia';
  const but = missing.length > 0 && !topicHit && topics.length > 0 ? `, pero ${missing[0]}` : '';

  return { why: `${r.firstName} ${subject} y ${zone}${but}.`, checks: checks.slice(0, 5), missing };
}

/**
 * Filtra por profesión, marca cuáles encajan con el pedido y arma la explicación de cada uno.
 * El orden base es el del backend (`rankPosition`); acá solo se sube a quienes encajan por delante de quienes
 * "podrían encajar", sin alterar el orden relativo dentro de cada grupo.
 */
export function buildResults(
  recommendations: MatchRecommendation[],
  need: NeedInterpretation
): ResultView[] {
  const topics = topicsOf(need.topics);

  const views = recommendations
    .filter((r) => !need.role || r.role === need.role)
    .map<ResultView>((r) => {
      const topicOk = topics.length === 0 || specialtyMatches(r.specialty, topics);
      const fit: Fit = topicOk && hasCapacity(r) && !isTooFar(r) ? 'fits' : 'maybe';
      return { recommendation: r, fit, ...explain(r, need, topics) };
    });

  const rank = (v: ResultView) => v.recommendation.rankPosition;
  const group = (fit: Fit) => views.filter((v) => v.fit === fit).sort((a, b) => rank(a) - rank(b));

  return [...group('fits'), ...group('maybe')].slice(0, MAX_RESULTS);
}
