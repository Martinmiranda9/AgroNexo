# AgroNexo — Frontend: Plan de Implementación (v4)

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
| Iconos / Motion | Google Material Icons (`react-icons/md`: `MdOutline*` por defecto, `Md*` relleno) · `motion/react` |
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

1. **Paleta v4 "verde campo"** (ver [Paleta](#paleta)): lienzo salvia, superficies blancas, pine para lo importante y verde campo para la acción. El crema queda solo en las superficies de marca.
2. **Double-bezel** en cards, inputs y badges premium (shell externo + core interno con radios concéntricos).
3. **Motion**: nunca `useState` para valores continuos; usar `useMotionValue` + `useTransform`. `AnimatePresence` en estados loading/empty/error.
4. **Inputs con label flotante**, sin placeholder-as-label.
5. **CTA button-in-button**: flecha dentro de círculo interno con hover independiente. Sheen sutil en hover.
6. **Iconos Google Material** (`react-icons/md`): variante `MdOutline*` por defecto y `Md*` (relleno) para estados activos o de éxito/error. Nada de `@phosphor-icons/react` ni `lucide-react`.
7. **`min-h-[100dvh]`**, nunca `h-screen` (iOS Safari).
8. **Grain/noise** solo en elementos `fixed` con `pointer-events: none`.

### Paleta

Paleta v4 "verde campo" (2026-10-11), definida en `src/app/globals.css`. Muestras, contrastes y maqueta aplicada:
https://claude.ai/artifact/73zC2CPYG6ZXhi7NTNSqHT

**Proporción objetivo por pantalla:** ~60 % lienzo salvia · ~28 % superficies blancas · ~8 % pine y verde campo · ~4 % estados. Las zonas se separan por luminosidad y bordes, nunca por tono.

#### Escala de marca: `field` (verde campo, tono 148°, armada en OKLCH desde `#3E7949`)

| Paso | Hex | Uso |
|:---|:---|:---|
| `field-50` / `100` | `#f4fcf3` / `#e5f7e5` | Fondos de selección suaves |
| `field-200` | `#cdeecf` | Texto e íconos del sidebar (11,5:1 sobre pine) |
| `field-300` | `#ade1b2` | Acentos sobre pine (9,7:1), serie clara de gráficos |
| `field-400` | `#88cc8f` | Rótulos del sidebar (7,6:1 sobre pine) |
| `field-500` / `600` | `#63b070` / `#4d9259` | Series de gráficos, íconos |
| **`field-700`** | **`#3e7949`** | **Acción principal** (`--primary`): botón, barra actual. Texto blanco 5,2:1 |
| `field-800` | `#29603b` | Hover del botón, ítem activo del sidebar, superficie de invitación |
| `field-900` | `#16482d` | Hover del sidebar |
| **`field-950` = `pine`** | **`#00311e`** | **Lo importante**: sidebar, selección activa, títulos, dato clave |

#### Neutros: `sage` (grises con un toque mínimo del verde de marca; sin crema)

| Paso | Hex | Uso |
|:---|:---|:---|
| blanco | `#ffffff` | Cards, popovers, inputs, columna del formulario en login/onboarding |
| `sage-50` | `#f4f6f4` | Lienzo (`--background`, `body`) |
| `sage-100` | `#ecefec` | Hover, `muted`, contenedores de ícono |
| `sage-200` | `#e0e4e1` | Borde de card y separadores (`--border`) |
| `sage-400` | `#8a8f8b` | Borde de controles (`--input`, 3,3:1), íconos inactivos |
| `sage-500` | `#707470` | Placeholders (4,7:1) |
| `sage-600` | `#5a5f5b` | Texto secundario (`--muted-foreground`, 6,5:1) |
| `sage-800` | `#2c302c` | Texto de apoyo |

#### Estados (colores reales)

| Estado | Tinte / punto | Texto del tag | Uso |
|:---|:---|:---|:---|
| Positivo | `status-green` `#16a34a` | `status-green-ink` `#166534` (6,4:1) | Aceptada, verificada, encaja |
| Pendiente | `status-orange` `#f97316` | `status-orange-ink` `#9a3412` (6,6:1) | Pendiente, enviada, a revisar |
| Negativo | `status-red` `#b91c1c` | el mismo (5,5:1 sobre su tinte) | Rechazada, errores, destructivo |

**Tag vs. marca:** el verde de marca y el verde de estado son de la misma familia, así que se distinguen por forma. La marca va **siempre sólida** (botón, barra, sidebar); los estados van **siempre como pill clara** (tinte al 10 % + texto 800 + punto o ícono). Nunca un pill con tinte verde de marca, y lo activo en chips/toggles es pine, no verde campo.

#### Superficies de marca (piezas puntuales)

La combinación cálida del login original se conserva para piezas sueltas: avisos, estados vacíos, logros, invitaciones.

| Superficie | Fondo | Título | Bajada (itálica 500) | Cuerpo | Botón | Para qué |
|:---|:---|:---|:---|:---|:---|:---|
| Crema | `cream` `#fef7e5` + borde `cream-border` | pine | `moss` `#4d694e` | `loam` `#24301e` | pine | Estados vacíos, bienvenida |
| Cálida | `sand` `#fff3d5` + borde `sand-border` | pine | `moss` | `loam` | pine | Avisos y novedades |
| Pine | `pine` | `beige` | `sprout` `#99a474` | `beige/75` | beige | Logros, dato clave |
| Verde | `field-800` | `beige` | `cream-border` | `beige/85` | beige | Invitaciones, promociones |

Reglas: son piezas dentro de la grilla, **nunca fondo de página ni franja a todo el ancho**; como máximo una clara y una oscura por vista (sin contar el sidebar); **nunca para estados del sistema** (errores y alertas usan los estados); título 600 con tracking −1px y bajada en itálica **solo dentro de estas piezas**; los avisos se pueden cerrar y no vuelven.

#### Nombres heredados

Los nombres de la v3 siguen existiendo como alias de la v4 para no tocar componentes: `beige` → `sage-50`, `beige-dark` → `sage-100`, `beige-deeper` → `sage-200`, `bg-card`/`surface` → blanco, `paper`/`bg-page` → `sage-50`, `bg-hero` → `field-50`, `olive` → `sage-600`, `olive-hover` → `sage-700`, `dark` → `sage-800`, `neutral-warm` → `sage-400`, `accent-mid` → `field-500`, `accent-light` → `field-300`, `danger` → `status-red`. **En código nuevo** usar la escala (`field-*`, `sage-*`) o los tokens semánticos (`primary`, `muted-foreground`, `border`, `input`…).

### Combinaciones válidas

| Contexto | Fondo | Texto | Borde |
|:---|:---|:---|:---|
| Botón primario / CTA | `primary` (`field-700`), hover `primary-hover` (`field-800`) | blanco | — |
| Botón outline | transparent (hover: `muted`) | `pine` | `input` (`sage-400`) |
| Botón ghost | transparent (hover: `muted`) | `pine` | — |
| Input | blanco / transparent | `pine` | `input` (`sage-400`) |
| Input focus | blanco | `pine` | `ring` (`pine`) + halo `ring/50` |
| Selección activa (chip, toggle, radio, checkbox, paso) | `pine` | `beige` | `pine` |
| Card / panel | blanco | `pine` | `border` (`sage-200`) |
| Página de producto | `sage-50` | `pine` / `sage-600` | — |
| Login / onboarding | columna blanca + panel `pine` | `pine` / `sage-600` | — |
| Sidebar | `pine` (texto `field-200`) | hover `field-900`, activo `field-800` + blanco | `field-900` |

### Tipografía y forma

- **Geist** (UI, titulares) + **Geist Mono** (cifras: qq/ha, $/ha, fechas). Nunca serif.
- Radius: 16px cards, 12px inputs/botones, pill (999px) en badges/chips/toggles; radius 0 solo en bloques hero/poster.
- Sombra mínima (hairline 1px), nunca dura. Iconos en contenedor circular con tinte suave.

---

## UI Kit — Consistencia Visual Obligatoria

> [!IMPORTANT]
> **Todo el desarrollo frontend debe respetar este UI Kit.** Mismos colores, combinaciones, botones y estilos de componentes en cada pantalla, actual o futura. El resultado final es un único UI Kit coherente, con identidad de marca y fiabilidad.

### Línea base visual

Referencias: dashboards minimalistas tipo FixTrack / Haulsight (lienzo gris claro, cards blancas con borde fino, sidebar fuerte, verde solo donde importa) y la app móvil en verde bosque. Se adopta su lógica con la paleta v4:

- **Pine marca lo importante** (sidebar, selección, dato clave) y **verde campo marca la acción** (botón principal), sobre superficies neutras.
- **Un único CTA primario por pantalla**, siempre en el mismo estilo y zona.
- **Activo = relleno Pine + texto Beige**; inactivo = tinte `pine/8` u outline `input` (chips, tabs, toggles, filtros, fechas).
- **Par de botones**: outline (secundario) + primario, mismo alto y radius.
- **Cards**: imagen arriba, título, subtítulo corto, acciones abajo.
- **Escritorio: `Sidebar` en pine** desde `lg` (`ui/layouts/Sidebar` + `AppShell`, conectado en `features/app-shell/AppLayout`); versión básica hasta tener la plantilla definitiva de sidebar y panel. **Celular: el encabezado** (`AppHeader`). `MobileNav` oscuro tipo pill en Pine, pendiente.
- **Formularios compactos** con label arriba y `SegmentedControl` para opciones cortas.
- **Espaciado en múltiplos de 4px** y misma jerarquía tipográfica en todas las pantallas.

### Reglas obligatorias

1. **Solo tokens**: prohibido `#hex`, `rgb()` o `bg-[#...]` en componentes/pantallas. Si falta un color, se agrega primero al sistema.
2. **Solo componentes de `ui/`**: no re-estilizar ni crear "botones parecidos" en un feature. Si falta uno, se crea en `ui/` y se reutiliza.
3. **Variantes cerradas**: nada de `className` one-off que cambie color, radius, alto o tipografía base.
4. **Solo las combinaciones de la tabla** (nunca oliva como fondo de CTA ni texto arbitrario sobre Pine).
5. **Todos los estados**: default, hover, focus-visible (`ring` pine + halo `ring/50`), active, disabled, loading y error.
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
- [ ] Activo/inactivo siguen la regla Pine + Beige; el botón principal es verde campo (`primary`).
- [ ] Sin crema como fondo de página; estados con verde/naranja/rojo en pill clara; superficies de marca solo como piezas puntuales.
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
