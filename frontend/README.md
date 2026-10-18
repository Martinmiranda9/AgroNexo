# AgroNexo — Frontend

App Next.js de AgroNexo. La guía completa (arquitectura, stack, sistema de diseño Cashmere y reglas) está en [`ia/frontend_implementation_plan.md`](../ia/frontend_implementation_plan.md); las convenciones generales en [`ia/agent.md`](../ia/agent.md).

## Stack

Next.js 15 (App Router) · React 19 · TypeScript 5 · Tailwind CSS 4 · Cashmere sobre Base UI · Google Material Icons (`react-icons/md`) · `motion/react` · Firebase Authentication · Server Actions contra la API .NET · Gemini para la búsqueda asistida · Vitest + Testing Library · Playwright.

## Puesta en marcha

Requisitos: Node.js 20+ y npm 10+, y la API corriendo en `http://localhost:5000` (ver el [README principal](../README.md)).

```bash
cp .env.local.example .env.local   # Firebase, NEXT_PUBLIC_API_URL y, opcional, GEMINI_API_KEY
npm install
npm run dev
```

App en [http://localhost:3000](http://localhost:3000).

## Scripts

- `npm run dev`: servidor de desarrollo (Turbopack).
- `npm run build` / `npm run start`: build de producción y su servidor.
- `npm run lint`: ESLint.
- `npm test`: tests unitarios (Vitest, `tests/unit/`).
- `npm run test:e2e`: tests E2E (Playwright, `tests/e2e/`). Los flujos que pegan al backend necesitan la API en `:5000`.

## Estructura

```
src/
├── app/        # Rutas: (public), (authenticated), auth/continue, api/
├── features/   # Pantallas por feature: app-shell, auth, onboarding, match-discovery, matches, farms
├── ui/         # UI Kit (Cashmere + piezas de marca) y layouts
├── core/       # models, actions (Server Actions), services, auth (Firebase), config
└── shared/     # utils, hooks, constants, types
```

Dependencias en una sola dirección: App → Feature → Core → Shared, y Feature → UI → Shared.
