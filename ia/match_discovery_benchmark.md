# AgroNexo — Benchmark y Propuesta UX/UI: Match Discovery (Productor ↔ Profesional)

> Research de referentes (Clickie, Tegu, Agworld) + propuesta de flujo, layout y arquitectura para el módulo de búsqueda y matching. Complementa [`agent.md`](./agent.md) (backend) y [`frontend_implementation_plan.md`](./frontend_implementation_plan.md) (frontend).

---

## 1. Hallazgos de `agent.md` — Alineación

- El backend ya define el caso de uso clave: **`GenerateMatchRecommendations`**, que arma un ranking por **score** y **excluye profesionales fuera del `CoverageArea`** solo cuando la especialidad requiere presencia física (sección 14 de `agent.md`). Esto significa que **el ranking no debe reinventarse en el frontend** — la UI de Match Discovery es, en esencia, una vista sobre ese endpoint, no un buscador genérico tipo Google.
- `MatchStatus` permite que un productor tenga **varios matches activos simultáneos** con distintos profesionales de la misma especialidad (no hay exclusividad), pero **bloquea duplicados** sobre el mismo par `(ProducerId, ProfessionalId)`. Esto habilita de forma nativa un patrón tipo "pedí varios presupuestos" (como Tegu/Clickie) sin romper reglas de negocio.
- Multi-tenancy y Auth0 (sección 6-7) ya resuelven que un productor nunca vea datos de otro tenant — el filtro geográfico/de catálogo que proponemos acá es *además* de ese filtro, no en su lugar.
- Mobile-first y paginación obligatoria (sección 5) son restricciones directas sobre el listado de resultados: nunca devolver el universo completo de profesionales sin paginar/lazy-load.
- Conclusión: la pieza que falta definir es **UX de búsqueda + anatomía de card + mecanismo de contacto**, no la lógica de ranking (ya resuelta en Application). Este documento se enfoca ahí.

---

## 2. Benchmark Comparativo

**Hallazgo importante antes de la tabla:** Clickie y Tegu **no son plataformas agro** — son marketplaces de servicios para el hogar (plomero, gasista, electricista) operando en CABA/Córdoba. Son referentes válidos igual porque resuelven el mismo patrón de interacción que necesita AgroNexo: *alguien con una necesidad puntual busca un profesional confiable y cercano, rápido*. Agworld sí es agtech real, pero es una **suite de colaboración post-vínculo** (el productor ya tiene agrónomo/contratista y gestiona datos juntos) — **no tiene mecanismo de descubrimiento/matching de nuevos profesionales**. Es más benchmark para el futuro "dashboard compartido" de AgroNexo que para el módulo de Match.

| Dimensión | **Clickie** | **Tegu** | **Agworld** |
|:---|:---|:---|:---|
| **Modelo de búsqueda** | Conversacional (chat/IA): el usuario describe el problema, no navega un directorio | Híbrido: intake tipo chat (foto/audio/texto) + feed social "Hecho en Tegu" explorable por categoría como prueba social | No aplica — no hay descubrimiento; el vínculo ya existe fuera de la plataforma |
| **Filtro geográfico** | Implícito, pedido dentro del wizard (no hay mapa ni radio visible) | Selector de ciudad en header + "zona" declarada por el profesional; sin radio en km ni mapa | N/A |
| **Layout/Componentes** | Modal conversacional de 4 pasos (Pedido → Presupuesto → Elegir → Pago); **cero cards de profesionales explorables** | Grid de cards (imagen, badge categoría, título corto, barrio+fecha, nombre+rating), chips de categoría scrolleables | Dashboard denso de tareas/registros/presupuesto por campo y cultivo |
| **Mecanismo de contacto** | Reverse marketplace: el sistema reparte el pedido, el usuario recibe hasta 3 presupuestos y **elige entre los que llegaron** (no elige un perfil de una lista) | Igual patrón: el cliente publica, profesionales de la zona **ofertan**, cliente elige | Invitación directa dentro de la cuenta (dar acceso a datos), sin negociación pública |
| **Fricción de uso** | Muy baja para arrancar (un mensaje), pero opaca: el usuario nunca ve el universo de profesionales disponibles | Baja para el cliente; más alta para el profesional (registro + verificación + elegir a qué pedidos ofertar) | Alta para "descubrir"; baja para colaborar una vez vinculados |

### Análisis detallado

**Clickie** — virtud: time-to-first-action casi cero (un chat). Debilidad: cero transparencia/control para el usuario sobre *quién* lo va a atender hasta que llegan los presupuestos; no sirve si el objetivo de producto es que el productor pueda comparar perfiles, trayectoria y zona de cobertura antes de decidir (que sí es relevante en agro, donde la relación con el agrónomo es de largo plazo, no un arreglo puntual).

**Tegu** — virtud: combina intake rápido con prueba social pública (feed de trabajos reales) que genera confianza sin fricción de login. El filtro por zona es simple (ciudad/barrio) porque opera en entornos urbanos densos. Debilidad para AgroNexo: ese modelo de zona "urbana" no escala bien a campos rurales dispersos, donde la distancia real en km importa mucho más que el nombre del barrio.

**Agworld** — virtud real para AgroNexo: valida que **después** del match, la colaboración debe vivir en un dashboard compartido por campo/cultivo (coincide con la visión de `agent.md` sección 2). Debilidad como referente de *discovery*: no tiene nada que copiar acá, porque no resuelve ese problema — confirma que para la parte de búsqueda/match debemos mirar a Clickie/Tegu, no a Agworld.

**Camino más corto a valor (time-to-first-result):** Tegu gana — muestra resultados/prueba social sin login, y el intake es tan rápido como Clickie pero con más transparencia (ves perfiles reales, no es una caja negra).

---

## 3. User Flow Paso a Paso (propuesta MVP)

Flujo recomendado: **exploración controlada**, aprovechando que el backend ya devuelve un ranking (a diferencia de Clickie, no hace falta ocultar el universo de profesionales detrás de un chat).

```
1. Productor entra a /match-discovery
   ↓
2. Searchbar: selecciona Especialidad (Agrónomo/Contador/Inversor/…)
   + Zona (autocompletada desde el campo del productor, editable)
   ↓
3. GET /api/v1/professionals?specialty=&lat=&lng=&radiusKm=&page=
   → usa GenerateMatchRecommendations internamente
   ↓
4. Resultados ordenados por score (sin mostrar el número crudo):
   ListingCard por profesional — foto, nombre, especialidad,
   zona de cobertura, rating, insignia "Verificado"
   ↓
5. Click en card → /match-discovery/[id] (perfil completo:
   experiencia, matrícula, zonas, reseñas)
   ↓
6. CTA primario "Solicitar match" → POST /api/v1/matches
   (crea Match en estado Pending)
   ↓
7. Confirmación + redirección a /matches
   ↓
8. Profesional recibe notificación → PATCH /matches/{id}/status
   (acepta/rechaza)
   ↓
9. Match "Active" → habilita el siguiente paso (chat/contacto directo,
   fuera de alcance de este módulo, pero la UI debe dejar el gancho)
```

**Variante a futuro (no MVP):** modo "pedido guiado" estilo Tegu/Clickie — el productor publica una necesidad sin elegir un profesional puntual, el sistema notifica a los N mejores rankeados de su zona, ellos ofertan, el productor elige. Vale la pena explorarlo después porque el modelo de datos (`Match` sin exclusividad, estados `Pending/Active`) ya lo soporta sin cambios — pero no es necesario para el MVP: agrega un paso de negociación que el ranking por score ya resuelve mejor para esta primera fase.

---

## 4. Propuesta de Layout & UI

### Desktop

```
┌──────────────────────────────────────────────────────────────────────┐
│  AgroNexo   Dashboard   Match Discovery   Matches        Perfil ⌄    │
├──────────────────────────────────────────────────────────────────────┤
│ ┌──────────────────────────────────────┐   ┌────────────────────┐   │
│ │ [Especialidad ⌄]  [📍 Zona · 25km ⌄]  │   │ [ Lista │ Mapa ]   │   │
│ │                           [ Buscar ]  │   │  toggle (segmented)│   │
│ └──────────────────────────────────────┘   └────────────────────┘   │
├───────────────┬────────────────────────────────────────────────────┤
│ Filtros        │  42 profesionales encontrados         Ordenar ⌄   │
│ ────────────  │ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐   │
│ Especialidad   │ │   (foto)    │ │   (foto)    │ │   (foto)    │   │
│ ☐ Agrónomo     │ │  ★ 4.9      │ │  ★ 4.8      │ │  ★ 4.7      │   │
│ ☐ Contador     │ │ Juan Pérez  │ │ María Gómez │ │ Ana Ruiz    │   │
│ ☐ Inversor     │ │ Agrónomo    │ │ Contador    │ │ Agrónoma    │   │
│                │ │ 📍 12km     │ │ 📍 8km      │ │ 📍 20km     │   │
│ Radio          │ │ ✓ Verificado│ │ ✓ Verificado│ │ ✓ Verificado│   │
│ ●──────○ 25km  │ │[Ver perfil→]│ │[Ver perfil→]│ │[Ver perfil→]│   │
│                │ └─────────────┘ └─────────────┘ └─────────────┘   │
│ Disponibilidad │ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐   │
│ ☐ Esta semana  │ │     ...     │ │     ...     │ │     ...     │   │
└───────────────┴────────────────────────────────────────────────────┘
```

### Mobile

```
┌───────────────────────┐
│ ☰   AgroNexo      🔔  │
├───────────────────────┤
│ [Especialidad ⌄]      │
│ [📍 Zona ▾]  [Filtros]│
├───────────────────────┤
│ [ Lista │ Mapa ]  42  │
├───────────────────────┤
│ ┌───────────────────┐ │
│ │ (foto)    ★ 4.9    │ │
│ │ Juan Pérez         │ │
│ │ Agrónomo · 12km    │ │
│ │ ✓ Verificado       │ │
│ │ [ Ver perfil → ]   │ │
│ └───────────────────┘ │
│ ┌───────────────────┐ │
│ │        ...         │ │
│ └───────────────────┘ │
├───────────────────────┤
│  🏠    🔍    💬   👤  │  ← MobileNav pill (Pine)
└───────────────────────┘
```

Filtros en mobile = bottom sheet (`Modal/Sheet` del UI Kit), no drawer lateral.

### Componentes clave a construir

Todos como extensiones del **UI Kit existente** (`ui/components/`), sin introducir lenguaje visual nuevo:

| Componente | Base en el UI Kit | Notas |
|:---|:---|:---|
| `SearchBar` | `Input` + `Select` | Especialidad (select) + Zona (input con autocomplete/geoloc) |
| `FilterDrawer` | `Modal/Sheet` (mobile) / sidebar fijo (desktop) | Reusa `Chip`/`SegmentedControl`/`Toggle` |
| `ListingCard` | Variante de `Card` | Foto circular, nombre, especialidad, badge zona, `Badge` verificado, rating, CTA `Button` |
| `MapViewToggle` | `SegmentedControl` | "Lista" / "Mapa" |
| `MapView` | nuevo, `next/dynamic` | Pines clusterizados por zona (regla 5 del plan frontend) |
| `EmptyState` / skeleton | nuevo, usa tokens | Estados loading/error/sin resultados |
| `SortDropdown` | `Select` | Orden implícito del score, nunca expone el número crudo |

---

## 5. Recomendación Técnica y de Producto para el MVP

**Backend (ya definido en `agent.md`, a confirmar en el contrato del endpoint):**
`GET /api/v1/professionals` debe soportar `specialty`, `lat`/`lng` + `radiusKm`, y paginación — consumiendo `GenerateMatchRecommendations` para el orden. No se necesita un endpoint de búsqueda nuevo, sino exponer esos filtros sobre el que ya está planeado.

**Geolocalización — lat/long + radio, no zonas predefinidas fijas.**
El stack ya incluye PostGIS + NetTopologySuite, pensado justamente para esto. A diferencia de Tegu (zona/barrio, porque opera en ciudad densa), el campo en Argentina está disperso — un filtro por "localidad" fija pierde precisión quedándose corto o largo. Traducir esto a UX:
- Mostrar al productor "a 12 km de tu campo", nunca coordenadas crudas.
- Autocompletar la zona desde el campo ya cargado en su perfil (dato que el productor ya ingresó), con opción de override manual.
- Fallback por combobox de localidad para el caso de GPS impreciso en zona rural.

**Frontend — sigue el patrón ya definido en `frontend_implementation_plan.md`:**
Server Component para el listado inicial (SSR vía Server Action con los filtros como query params) + Client Component solo para la interacción de filtros (TanStack Query + Zustand, como ya especifica el plan). El mapa va con `next/dynamic` (regla 5) — sugerido MapLibre GL con tiles gratuitos antes que Google Maps por costo a escala; a validar con negocio si se necesita algo más robusto.

**Diales Taste Skill:** la tabla del plan ya fija Match Discovery en `DESIGN_VARIANCE 7 / MOTION_INTENSITY 5 / VISUAL_DENSITY 5` — no hace falta agregar nada, solo respetarlo al construir.

**No exponer el score crudo.** El ranking del backend es 0-100 internamente; en la UI se traduce a orden implícito + un badge opcional "Mejor match" en el primer resultado, nunca el número — evita que el productor cuestione "por qué este score y no otro" sin aportar valor real.

**Qué NO construir en el MVP:** el modo "pedido guiado" conversacional (variante de la sección 3) y cualquier negociación de presupuesto/oferta estilo Tegu — el modelo de datos ya lo soporta a futuro, pero agregarlo ahora es scope creep sobre un ranking que el backend ya resuelve bien.
