# AgroConnect — Frontend: Plan de Implementación (v3)

## Decisiones

| # | Decisión |
|:---|:---|
| 1 | **Next.js 15 + React 19** (no Angular): es lo que usan las referencias (Clickie, Tegu), Tailwind es first-class y permite migrar a React Native compartiendo hooks y modelos. No se usa Express: el backend .NET ya cumple ese rol. |
| 2 | **Auth0 + Social Login Google**: frontend y backend comparten identity provider; se pueden sumar email/Apple sin tocar el backend. |
| 3 | **Landing pública: sí.** Flujo: landing → login/registro → onboarding de rol (Productor/Profesional) → dashboard autenticado. Rutas: `app/(public)/` y `app/(authenticated)/`. |
| 4 | **BFF liviano (pendiente de cerrar antes de Fase 1):** Server Actions/Server Components para lecturas iniciales (SSR, token fuera del browser); `api.service.ts` solo para mutaciones en Client Components vía TanStack Query. |

---

## Arquitectura de Capas

```
App ──→ Feature ──→ Core ──→ Shared
             │                  ▲
             └──→ UI ───────────┘
```

- Feature importa Core, UI y Shared. UI y Core importan solo Shared. Shared no importa de nadie.
- Core nunca importa Feature ni UI. Un Feature nunca importa otro Feature.

| Capa | Contiene | NO contiene |
|:---|:---|:---|
| **App** | Rutas, layouts, `middleware.ts`, providers globales | Lógica de negocio, llamadas API |
| **Feature** | Server Components (fetch inicial) + Client Components (interacción) | Componentes genéricos, HTTP directo |
| **UI** | Dumb components: props + events | Llamadas API, estado de servidor |
| **Core** | Models, services, Server Actions, config Auth0 | Componentes de UI, páginas |
| **Shared** | Utils puros, constantes, tipos genéricos | Services con estado, lógica de negocio |

### Patrón Server/Client

Una page es Server Component por defecto (sin hooks). Se hace el fetch inicial vía Server Action y se pasan los datos como props. Solo se agrega `"use client"` (con TanStack Query usando `initialData`) cuando hace falta interactividad: filtros, aceptar/rechazar match, refetch. Empezar sin `"use client"` y sumarlo cuando el compilador lo exija.

---

## Estructura de Archivos

```
frontend/src/
├── middleware.ts            # Sesión Auth0 + redirects por rol
├── app/
│   ├── (public)/            # Landing, login, register
│   ├── (authenticated)/     # dashboard, profile, match-discovery, matches
│   └── layout.tsx, loading.tsx, error.tsx, not-found.tsx, globals.css
├── features/                # auth, profile, match-discovery, matches ({components/, hooks/, index.ts})
├── ui/                      # Design System / UI Kit
│   ├── components/          # Button, Input, Card, Modal, Badge, Spinner, Toast…
│   └── layouts/             # AppShell, Navbar, MobileNav, Sidebar, Footer
├── core/                    # models/, services/, actions/, providers/, config/env.ts
└── shared/                  # utils/, hooks/, constants/, types/
```

Auth se resuelve en `middleware.ts` + layouts, no con guards client-side.

---

## Stack Técnico

| Área | Tecnología |
|:---|:---|
| Framework | Next.js 15 (App Router) + React 19 + TypeScript 5 |
| Estilos | Tailwind CSS 4 |
| Auth | Auth0 (`@auth0/nextjs-auth0`) + Google, sesión en `middleware.ts` |
| Estado | TanStack Query 5 (server/mutations), Zustand (filtros, selección), Context (solo theme/locale) |
| Forms | React Hook Form + Zod |
| Env vars | `@t3-oss/env-nextjs` + Zod |
| Testing | Vitest + React Testing Library (unit), Playwright (E2E: buscar → ranking → aceptar match) |
| Iconos / Motion | Phosphor Icons (`@phosphor-icons/react`) · `motion/react` |
| Diseño | Taste Skill (`frontend/.agents/skills/`, principal: `design-taste-frontend/SKILL.md`; también `brandkit`, `minimalist-ui`, `high-end-visual-design`) |

---

## Diseño: Taste Skill + Sistema Visual

Taste Skill es la guía anti-slop obligatoria. Antes de diseñar una pantalla se declaran los diales:

| Pantalla | DESIGN_VARIANCE | MOTION_INTENSITY | VISUAL_DENSITY |
|:---|:---|:---|:---|
| Login / Auth | 7 | 6 | 3 |
| Landing pública | 8 | 7 | 3 |
| Dashboard | 6 | 4 | 6 |
| Match Discovery | 7 | 5 | 5 |
| Profile | 6 | 4 | 4 |

### Reglas de diseño

1. **Paleta Pine & Beige se preserva**; no reemplazar por paletas neutras genéricas.
2. **Double-bezel** en cards, inputs y badges premium (shell externo + core interno con radios concéntricos).
3. **Motion**: nunca `useState` para valores continuos; usar `useMotionValue` + `useTransform`. `AnimatePresence` en estados loading/empty/error.
4. **Inputs con label flotante**, sin placeholder-as-label.
5. **CTA button-in-button**: flecha dentro de círculo interno con hover independiente. Sheen sutil en hover.
6. **Iconos Phosphor**, stroke 1.5–1.75.
7. **`min-h-[100dvh]`**, nunca `h-screen` (iOS Safari).
8. **Grain/noise** solo en elementos `fixed` con `pointer-events: none`.

### Paleta

| Token | Hex | Uso |
|:---|:---|:---|
| `beige` | `#fef7e5` | Fondo principal de página |
| `beige-dark` / `beige-deeper` | `#f5ead4` / `#ede0c4` | Hover de superficies / panel hero |
| `pine` | `#00311e` | Texto principal + CTA (≈15:1 sobre Beige) |
| `pine-hover` | `#002617` | Hover de Pine |
| `bg-hero` / `bg-card` | `#FFF3D5` / `#FFFBF0` | Bloques de contraste / cards |
| `primary` / `primary-hover` | `#4D694E` / `#3F4C26` | Oliva: iconos, links activos, texto secundario (≥14px semibold) |
| `accent-mid` / `accent-light` | `#728141` / `#99A474` | Tags, iconos secundarios (nunca body text) |
| `dark` | `#24301E` | Texto de soporte |
| `neutral-warm` | `#978A56` | Bordes, divisores, placeholders |
| `danger` | `#8C4A34` | Solo error/rechazo; nunca lleva texto encima |

### Combinaciones válidas

| Contexto | Fondo | Texto | Borde |
|:---|:---|:---|:---|
| Botón primario / CTA | `pine` | `beige` | — |
| Botón outline | transparent | `pine` | `pine/40` |
| Botón ghost | transparent (hover: beige) | `pine` | — |
| Input | `beige` | `pine` | `neutral-warm/50` |
| Input focus | `beige` | `pine` | `pine` + ring `pine/15` |
| Card / panel | `bg-card` | `pine` | `pine/10` |
| Panel hero lateral | `beige` → `beige-deeper` | `pine` | — |

### Tipografía y forma

- **Geist** (UI, titulares) + **Geist Mono** (cifras: qq/ha, $/ha, fechas). Nunca serif.
- Radius: 16px cards, 12px inputs/botones, pill (999px) en badges/chips/toggles; radius 0 solo en bloques hero/poster.
- Sombra mínima (hairline 1px), nunca dura. Iconos en contenedor circular con tinte suave.

---

## UI Kit — Consistencia Visual Obligatoria

> [!IMPORTANT]
> **Todo el desarrollo frontend debe respetar este UI Kit.** Mismos colores, combinaciones, botones y estilos de componentes en cada pantalla, actual o futura. El resultado final es un único UI Kit coherente, con identidad de marca y fiabilidad.

### Línea base visual

Referencia: app móvil en verde bosque donde todas las pantallas comparten el mismo lenguaje. Se adopta su lógica, traducida a Pine & Beige:

- **Un color de marca dominante** (Pine) sobre superficies claras.
- **Un único CTA primario por pantalla**, siempre en el mismo estilo y zona.
- **Activo = relleno Pine + texto Beige**; inactivo = tinte `pine/8` u outline `pine/40` (chips, tabs, toggles, filtros, fechas).
- **Par de botones**: outline (secundario) + primario, mismo alto y radius.
- **Cards**: imagen arriba, título, subtítulo corto, acciones abajo.
- **`MobileNav` oscuro tipo pill** en Pine, con ítem activo resaltado. Header único (volver · título centrado · acción).
- **Formularios compactos** con label arriba y `SegmentedControl` para opciones cortas.
- **Espaciado en múltiplos de 4px** y misma jerarquía tipográfica en todas las pantallas.

### Reglas obligatorias

1. **Solo tokens**: prohibido `#hex`, `rgb()` o `bg-[#...]` en componentes/pantallas. Si falta un color, se agrega primero al sistema.
2. **Solo componentes de `ui/`**: no re-estilizar ni crear "botones parecidos" en un feature. Si falta uno, se crea en `ui/` y se reutiliza.
3. **Variantes cerradas**: nada de `className` one-off que cambie color, radius, alto o tipografía base.
4. **Solo las combinaciones de la tabla** (nunca oliva como fondo de CTA ni texto arbitrario sobre Pine).
5. **Todos los estados**: default, hover, focus-visible (ring `pine/15`), active, disabled, loading y error.
6. **Una pantalla nueva no introduce lenguaje visual nuevo**: se compone con el kit.
7. **Todo cambio al kit es global**: se hace en `ui/` o en los tokens, nunca solo en una pantalla.

### Catálogo base

| Componente | Variantes |
|:---|:---|
| **Button** | `primary` · `outline` · `ghost` · `danger` (solo destructivo) · `sm`/`md`/`lg` · loading · disabled |
| **Input / Select / Textarea** | default · focus · error · disabled · con icono (label flotante) |
| **SegmentedControl / Chip / Toggle** | activo · inactivo · disabled (siempre pill) |
| **Card** | estándar · seleccionable · con imagen |
| **Badge / Tag** | neutro · positivo · alerta · error |
| **Modal / Sheet** | estándar · confirmación (un CTA primario + una acción secundaria) |
| **Toast** | éxito · info · error |
| **Header / MobileNav / Sidebar** | por breakpoint |
| **Avatar / Icon container** | tamaños fijos |

### Checklist de cierre (obligatorio)

- [ ] Cero colores hardcodeados; todo sale de tokens.
- [ ] Todos los controles son de `ui/components/`.
- [ ] Un solo CTA primario claro en la vista.
- [ ] Activo/inactivo siguen la regla Pine + Beige.
- [ ] Radius, alturas, espaciado e iconos coinciden con el resto de la app.
- [ ] Hover, focus, disabled, loading y error implementados.
- [ ] Se ve como parte del mismo producto junto a Login, Onboarding y Dashboard.

> Una pantalla que no pase el checklist **no se considera terminada**, aunque funcione.

---

## Reglas Estrictas

| # | Regla |
|:---|:---|
| 1 | Server Components por defecto; `"use client"` solo cuando sea necesario |
| 2 | Un archivo = un componente = una responsabilidad |
| 3 | Autorización server-side en `middleware.ts`; sin guards client-side |
| 4 | Nunca llamar API desde UI: Server Components → `core/actions/`; Client Components → `core/services/` vía TanStack Query |
| 5 | `next/dynamic` para componentes pesados (mapas, gráficos) |
| 6 | Barrel exports nombrados, nunca `export * from` |
| 7 | Env vars tipadas con `@t3-oss/env-nextjs`, nunca `process.env.X` suelto |
| 8 | Rutas como constantes, nunca strings hardcodeados |
| 9 | Mobile-first Tailwind (base = mobile, `md:` tablet, `lg:` desktop) |
| 10 | Código en inglés, textos al usuario en español |
| 11 | **UI Kit inviolable**: tokens, componentes de `ui/`, variantes cerradas y checklist en cada pantalla |

---

## Features (Módulo Match — Fase 1)

| Feature | Rutas | Pantallas clave |
|:---|:---|:---|
| Landing | `/` | Propuesta de valor, CTA a login/registro |
| Auth | `/login`, `/register` | Google Sign-In, toggle Productor/Profesional |
| Profile | `/profile` | Ver/editar perfil según rol |
| Match Discovery | `/match-discovery`, `.../[id]/recommendations` | Búsqueda especialidad + ubicación, ranking |
| Matches | `/matches`, `/matches/[id]` | Lista con estados, aceptar/rechazar |

---

## Plan de Fases

| Fase | Subagente | Entregable |
|:---|:---|:---|
| 1 | Frontend Architect | Scaffold, Tailwind, `middleware.ts`, `core/models/`, decisión BFF, `core/actions/` + `core/services/` |
| 2 | Auth Engineer | Auth0 + Google, sesión en middleware, feature `auth/` |
| 3 | UI Engineer | **UI Kit** (`ui/`) con catálogo base y variantes cerradas, layouts responsive, escala tipográfica, Motion, tests |
| 4 | Feature Engineer | `profile/`, `match-discovery/`, `matches/` con patrón Server/Client |
| 5 | Test Engineer | Vitest, Playwright (flujo completo), responsive QA, accesibilidad básica |
