# AgroNexo — Frontend: Plan de Implementación

> Cómo se trabaja hoy en `frontend/`. Si algo no coincide con el código, manda el código y se corrige este documento. Los valores exactos de color, sombras y radius viven en `src/app/globals.css`.

## Decisiones

- **Next.js 15 + React 19.** El backend es la API .NET; no hay servidor Node propio.
- **Firebase Authentication** (correo + contraseña y Google). El SDK autentica en el cliente; el ID token se verifica en el servidor (`jose` contra el JWKS de Google), se guarda en la cookie httpOnly `agronexo_session` y viaja como `Bearer` a la API, que lo vuelve a validar.
- **Flujo:** `/` → `/login`. Login/registro → `/auth/continue` (decide destino) → onboarding de rol → app autenticada. Ya registrado, entra al tablero de su campo en uso (con varios, el primero por nombre); sin campos, el productor va a Buscar y el profesional a su Panel (`homeRouteFor`, `core/services/home-route.service.ts`). El logo pasa por el mismo camino. Rutas en `app/(public)/` y `app/(authenticated)/`.
- **Server Actions como capa de datos:** lecturas y mutaciones pasan por `core/actions/` (el token no sale del servidor).
- **Cashmere** como sistema de diseño, con la paleta v4 "verde campo" e Inter.

## Arquitectura

```
App ──→ Feature ──→ Core ──→ Shared
             │                  ▲
             └──→ UI ───────────┘
```

| Capa | Contiene | Regla |
|:---|:---|:---|
| **App** | Rutas, layouts, route handlers (`app/api/`: sesión y proxy de registro) | Sin lógica de negocio ni llamadas directas al backend |
| **Feature** | Pantallas, hooks, `lib/` de vista, `server/` con acciones propias | Nunca importa otro feature |
| **UI** | Componentes tontos (props + eventos) | Solo importa Shared |
| **Core** | `models/`, `actions/`, `services/`, `auth/` (Firebase), `config/` | Nunca importa Feature ni UI |
| **Shared** | Utils puros (`cn`), constantes (`ROUTES`), hooks y tipos genéricos | No importa de nadie |

**Server/Client:** la page es Server Component, lee la sesión con `getSessionUser()` / `fetchCurrentUser()` (`core/auth/server.ts`), trae datos con una Server Action y los pasa a la pantalla del feature (`FarmsScreen`, `MatchDiscoveryScreen`…). `"use client"` solo cuando hay interactividad. La autorización es server-side: layout de `(authenticated)` (sin sesión → `/login`) y `/auth/continue` (rol y registro).

```
frontend/src/
├── app/          # (public): login, register, forgot-password, onboarding, welcome · (authenticated): dashboard,
│                 # match-discovery, matches, farms · auth/continue · api/ · layout, error, not-found, globals.css
├── features/     # app-shell, auth, onboarding, match-discovery, matches, farms
├── ui/           # components/ (UI Kit) · layouts/ (AppShell)
├── core/         # models, actions, services, auth, config/{env,api}.ts
└── shared/       # utils, hooks, constants, types
```

## Stack

| Área | Tecnología |
|:---|:---|
| Base | Next.js 15 (App Router, Turbopack) · React 19 · TypeScript 5 · Tailwind CSS 4 (tema en `globals.css`, sin modo oscuro) |
| Componentes | Cashmere sobre `@base-ui/react` (Radix solo sin variante base: `react-slot`, `react-toast`) · `cva` + `clsx` + `tailwind-merge` |
| Auth y datos | `firebase` + `jose` · Server Actions contra la API (`core/config/api.ts`) · estado local de React |
| Forms | Controlados con validación propia y Zod; React Hook Form solo en `AgroNexoAuthModal` |
| Otros | `country-state-city` · `react-phone-number-input` + `libphonenumber-js` · Gemini (`@google/genai`, en `features/match-discovery/server/`) · `recharts` 3 vía `ui/components/Chart` · `@t3-oss/env-nextjs` |
| Íconos y motion | `react-icons/md` (`MdOutline*` por defecto, `Md*` relleno para activo/éxito/error) · `motion/react` |
| Tests | Vitest + Testing Library (`tests/unit/`) · Playwright (`tests/e2e/`, un spec por feature) |

## Sistema de diseño Cashmere

> [!IMPORTANT]
> **Toda UI nueva se construye con componentes de Cashmere.** Prohibido crear componentes ad hoc o sumar utilidades Tailwind nuevas en páginas. Si Cashmere no cubre un caso, se consulta antes de crear algo.

- **Instalar ítem por ítem:** `npx shadcn@latest add https://better-design.com/registry/cashmere/<item>.json` (índice: `.../cashmere/index.json`). **Nunca** `all.json` ni `globals.json`: pisan `globals.css` y `ui/` (en Windows `button.tsx` reemplaza `Button.tsx`).
- **Variante `<item>-base`** (Base UI) siempre que exista; Radix solo si no (ej. `sidebar`, `stat-card`, gráficos).
- **Íconos:** cada `<Icon icon="ph:…">` de Cashmere se reemplaza por su equivalente de `react-icons/md`; `@iconify/react` no se instala.
- **Tamaños de Cashmere**, responsivos: botón sm 32 · default 40 · lg 48 · icon 40 (pill); campos 40px. En celular el texto de los campos queda en 16px (iOS no hace zoom).
- **Tailwind** solo dentro de `ui/`. En páginas y features, solo el layout imprescindible; al tocar una pantalla se borran las utilidades que repiten o pisan al componente.
- **Reglas de Cashmere** (`rules.md`: componer con lo instalado, labels en sentence case, límites de copy) aplican salvo choque con la identidad.
- **Ante conflictos:** 1) identidad de AgroNexo (paleta v4 e Inter) · 2) Cashmere (estructura, formas, espaciados, variantes) · 3) este plan, shadcn y Tailwind.

## Identidad visual

**Paleta v4 "verde campo"** (muestras y contrastes: https://claude.ai/artifact/73zC2CPYG6ZXhi7NTNSqHT). Proporción por pantalla: ~60 % lienzo salvia · ~28 % superficies blancas · ~8 % pine y verde campo · ~4 % estados. Las zonas se separan por luminosidad y bordes, nunca por tono. En código se usan la escala (`field-*`, `sage-*`) o los tokens semánticos, nunca hex.

| Rol | Token | Uso |
|:---|:---|:---|
| **Lo importante** | `pine` (= `field-950`, `#00311e`) | Títulos, dato clave, selección activa, ítem activo del sidebar |
| **Acción** | `primary` (= `field-700`, `#3e7949`), hover `field-800` | Botón principal, barra actual. Texto blanco |
| Acentos | `field-50/100` fondos de selección · `field-300…600` series de gráficos e íconos | |
| Lienzo / superficies | `background` = `sage-50` · `card`, `popover`, `input` = blanco · `canvas` = `sage-100` (marco autenticado) | |
| Texto | `foreground` = `pine` · `muted-foreground` = `sage-600` · placeholder `sage-500` · apoyo `sage-800` | Sobre pine, el texto claro es `sage-50` |
| Bordes | `border` = `sage-200` (cards, separadores) · `input-border` = `sage-400` (controles, 3,3:1) · `ring` = `pine` + halo `ring/50` | |
| Estados | `success` (`status-green` / ink `#166534`) · `warning` (`status-orange` / ink `#9a3412`) · `destructive` (`status-red`) | Aceptada / pendiente / rechazada y errores |
| Otros | `secondary` = pine 8 % · `muted`, `accent` = `sage-100` · `pop-*` (azul y violeta van a neutro) · `chart-1…5` · `sidebar-*` | |

**Marca vs. estado:** la marca va **siempre sólida** (botón, barra); los estados van **siempre en pill clara** (tinte 10 % + texto ink + `BadgeDot` o ícono). Nunca un pill con verde de marca; lo activo en chips y toggles es pine, no verde campo.

**Combinaciones válidas**

| Contexto | Resultado |
|:---|:---|
| Botón primario (`variant="default"`) | `primary`, hover `primary-hover`, texto blanco |
| Botón outline / ghost / destructive | Transparente con borde `border` · transparente · `destructive/10` con texto `destructive`; texto `pine` en los dos primeros |
| Input | Fondo blanco, texto `pine`, borde `input-border`; foco `ring` + halo |
| Selección activa (chip, toggle, radio, checkbox, paso) | `pine` con texto `sage-50`; inactivo `secondary` u outline |
| Card / página | Card blanca con `border` · página en `sage-50` con texto `pine` / `sage-600` |
| Login / onboarding | Columna blanca + panel `pine` |
| Sidebar | Blanco, texto `sage-600`; hover `field-100` + `field-800`; activo `pine` + blanco |

**Tipografía y forma:** Inter (`next/font/google`, itálica real) para todo; `text-figure` (números tabulares) en cifras; Geist Mono solo en `font-mono` (IDs, teléfonos); nunca serif. Escala: `text-caption` 12 · `body-sm` 14 · `body` 16 · `body-lg` 18 · `heading-sm` 20 · `heading-md` 24 · `heading-lg` 30 · `heading-xl` 36. `--radius` 1rem, botones y badges pill, cards `rounded-2xl`, sombras suaves de Cashmere teñidas de pine; nunca sombras duras.

## UI Kit

**Línea base** (referencias tipo FixTrack / Haulsight): lienzo claro, cards blancas con borde fino, verde solo donde importa.

- **Un único CTA primario por pantalla**, siempre en el mismo estilo y zona. Par de botones: outline + primario, mismo alto.
- **Marco:** `Sidebar` blanco de **una sola columna** a toda la altura desde `lg` (`ui/components/Sidebar` + `ui/layouts/AppShell`, compuesto en `features/app-shell/AppSidebar`, ítems por rol en `navigation.ts`): arriba el logo sin contenedor ni borde con el espacio del usuario y el botón para colapsar a íconos, la búsqueda con forma de campo (Ctrl/⌘ + K) y "Menú principal"; en el medio "Mis campos"; abajo Ayuda y Cerrar sesión. Activo en pine. La barra de arriba (`AppHeader`) lleva la ruta (`Breadcrumb`) a la izquierda y avisos, ayuda y perfil a la derecha; en celular suma el menú (abre la misma columna en un `Drawer`) y el logo.
- **Títulos de página:** `SectionHeader as="h1"` (título, bajada y acciones a la derecha); las secciones internas, `SectionHeader` (`h2`).
- **Resúmenes y tablas:** cifras de una pantalla en `StatStrip` (una card con celdas, info en tooltip y variación en pill de estado); tablas con selección usan `Checkbox` (con `indeterminate`), `SelectionBar` para las acciones en lote, orden en el encabezado (`aria-sort`) y `Pagination` con filas por página.
- **Formularios:** label arriba (`Field` + `FieldLabel`, nunca placeholder como label) y `ToggleGroup` para opciones cortas. Altas y ediciones en `Drawer`; confirmaciones en `Dialog`.
- **Cards:** imagen arriba, título, subtítulo corto, acciones abajo. Íconos en `IconContainer` circular con tinte.
- **Motion:** `useMotionValue` + `useTransform` para valores continuos (nunca `useState`), `AnimatePresence` en loading/empty/error, respetar `prefers-reduced-motion`.
- Espaciado en múltiplos de 4px · `min-h-[100dvh]`, nunca `h-screen` · grain/noise solo en elementos `fixed` con `pointer-events: none`.

**Reglas obligatorias**

1. **Solo tokens:** nada de `#hex`, `rgb()` ni `bg-[#…]`. Si falta un color, se agrega primero a `globals.css`.
2. **Solo componentes de `ui/`:** no re-estilizar ni crear "botones parecidos". Si falta uno, se instala de Cashmere y se adapta solo a tokens e íconos Material.
3. **Variantes cerradas:** nada de `className` one-off que cambie color, radius, alto o tipografía.
4. **Todos los estados:** default, hover, focus-visible, active, disabled, loading y error.
5. **Sin lenguaje visual nuevo:** una pantalla se compone con el kit; todo cambio al kit es global (en `ui/` o en `globals.css`).

**Catálogo (`ui/components/`)**

- **Cashmere:** `Button` (pill; `default`/`primary`, `secondary`, `outline`, `ghost`, `destructive`, `link`; tamaños `xs`–`lg` e `icon-*`; `asChild`/`render`; `loading`) · `IconButton` (`surface`: blanco con borde, para la barra de arriba) · `Badge` + `BadgeDot` (`success`, `warning`, `destructive`, `inverse`…) · `StatusIndicator` · `Input`, `Textarea`, `NativeSelect`, `InputGroup`, `PasswordInput`, `NumberInput`, `EmailField`, `InlineValidation`, `SearchInput`, `CommandSearch`, `AiAgentInput` · `Field` y familia · `Checkbox` (con `indeterminate`)/`CheckboxCard`, `RadioGroup`/`RadioCard` · `Toggle`, `ToggleGroup`, `SegmentedControl` · `Card` (+ `CardAction`), `StatCard` (`unit`, `action`, `change`; tono `brand` = dato clave en pine) · `SectionHeader` (`as`) · `Alert` · `Dialog`, `Drawer`, `Popover`, `DropdownMenu`, `Collapsible`, `Tooltip` · `Toast` (`toast.success()`/`toast.error()`) · `Sidebar` y familia · `Avatar` (+ `InitialsAvatar`) · `Item`, `Empty`, `Table`, `Skeleton`, `Spinner`, `Separator`, `Kbd`, `Label` · `Progress` (`thin`/`default`/`thick`) · `Breadcrumb` · `Pagination` (+ `PaginationButton`, `pageWindow`) · `Chart` (shadcn, para recharts 3). Recetas compartidas en `_shared.ts`.
- **Propios de AgroNexo:** `StatStrip` (tira de métricas) · `SelectionBar` (barra flotante de acciones sobre lo elegido) · `AppLayoutSkeleton` (feature `app-shell`) · `ChoiceGroup` · `IconContainer` · `PhoneInput` · `VerificationBanner`, `NeedBriefCard`, `ContactCard` · `BrandLogo`, `BrandMark`, `BrandGlow`, `GoogleButton` · `ThoughtLine`, `hairline/HairlineFigure`.

**Checklist de cierre** (una pantalla que no lo pasa no está terminada, aunque funcione):

- [ ] Cero colores hardcodeados y todos los controles de `ui/components/`.
- [ ] Un solo CTA primario (verde campo); activo en pine + `sage-50`; estados en pill clara.
- [ ] Radius, alturas, espaciado e íconos iguales al resto de la app; hover, focus, disabled, loading y error.
- [ ] Se ve como parte del mismo producto que Login, Onboarding, Búsqueda y Campos.
- [ ] Spec E2E nuevo en `tests/e2e/` que cubre el cambio (ver `CLAUDE.md`).

## Reglas de código

1. Server Components por defecto; `"use client"` solo si hace falta. Un archivo = un componente = una responsabilidad.
2. Nunca llamar a la API desde UI: datos vía Server Actions (`core/actions/` o `server/` del feature).
3. `next/dynamic` para componentes pesados (mapas, gráficos).
4. Barrels con exports nombrados, nunca `export * from`.
5. Env vars tipadas con `@t3-oss/env-nextjs`, nunca `process.env.X` suelto.
6. Rutas como constantes (`ROUTES`, `farmRoute()` en `shared/constants/routes.ts`).
7. Mobile-first: base = celular, `md:` tablet, `lg:` escritorio.
8. Código en inglés, textos al usuario en español.

## Features y rutas

| Feature | Rutas | Qué hace | Estado |
|:---|:---|:---|:---|
| `auth` | `/login`, `/register`, `/forgot-password`, `/auth/continue` | Correo + contraseña y Google, panel de marca | Hecho |
| `onboarding` | `/onboarding`, `/welcome/[publicId]/[kind]` | Wizard de rol, ubicación, vista previa del perfil | Hecho |
| `app-shell` | (layout autenticado) | Sidebar de una columna por rol (búsqueda, menú, Mis campos) + barra con ruta, avisos, ayuda y perfil | Hecho |
| `match-discovery` | `/match-discovery` | Búsqueda asistida con Gemini, ficha de necesidad, ranking, enviar solicitud | Hecho |
| `matches` | `/matches` | Solicitudes con estados, aceptar/rechazar | Hecho |
| `farms` | `/farms`, `/farms/[id]` | Campos con resumen, equipo y tablero (lotes, campañas, actividades con selección en lote y paginación) | En curso |
| Dashboard | `/dashboard` | Panel del profesional: resumen de solicitudes y las que esperan respuesta | Hecho |
| Landing · `profile` | — | `/` redirige a `/login`; perfil sin ruta todavía | Pendiente |

Navegación: Productor → Buscar · Mis solicitudes · Campos. Profesional → Panel · Solicitudes · Campos.

## Deuda conocida

- `core/config/env.ts` existe pero nadie lo importa; quedan `process.env.X` sueltos en `core/auth/`, `app/api/auth/session` y `search-professionals.action.ts` (regla 5).
- Utilidades Tailwind de layout en pantallas existentes; se limpian al tocar cada una.
