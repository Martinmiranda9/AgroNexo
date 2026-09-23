# Project: AgroConnect Frontend Workspace

## Architecture
- Framework: Next.js 15 (App Router) + React 19 + TypeScript 5
- Styling: Tailwind CSS v4 with custom AgroConnect design tokens
- State & Data: @tanstack/react-query v5, Zustand
- Forms & Validation: React Hook Form + Zod + @hookform/resolvers
- Env Management: @t3-oss/env-nextjs + Zod
- Auth: @auth0/nextjs-auth0
- UI & Motion: Lucide React, Motion
- Testing: Vitest + Testing Library + jsdom (unit/component), Playwright (E2E)
- Quality: ESLint (next/core-web-vitals), Prettier + tailwind plugin
- Layered Architecture: `app/` (routes), `features/` (slices), `ui/` (design system components & layouts), `core/` (models, services, actions, providers, config), `shared/` (utils, hooks, constants, types)

## Feature Inventory
| # | Feature | Description | Milestone | Status | Source |
|---|---|---|---|---|---|
| 1 | R1: Next.js 15 + TS5 Scaffold | App Router, React 19, strict TS, scripts (dev, build, start, lint, test, test:e2e), path aliases | M1 | DONE | ORIGINAL_REQUEST §R1 |
| 2 | R2: Layered Folder Structure | Full folder hierarchy with valid placeholder exports and TODO comments | M1 | DONE | ORIGINAL_REQUEST §R2 |
| 3 | R3: Dependency Installation | All runtime and dev dependencies installed and resolved | M1 | DONE | ORIGINAL_REQUEST §R3 |
| 4 | R4: Tailwind CSS v4 & Globals | Design tokens (bg-page, bg-hero, bg-card, primary, accent, dark, etc.) & globals.css | M2 | DONE | ORIGINAL_REQUEST §R4.1, R4.8 |
| 5 | R4: Vitest & Playwright Configs | vitest.config.ts (jsdom, path aliases, coverage), playwright.config.ts (localhost:3000, chromium) | M2 | DONE | ORIGINAL_REQUEST §R4.2, R4.3 |
| 6 | R4: Environment & Auth0 Config | .env.local.example, src/core/config/env.ts with Zod schema for Auth0 & API variables | M2 | DONE | ORIGINAL_REQUEST §R4.4, R4.7 |
| 7 | R4: ESLint & Prettier Configs | .eslintrc.json (next/core-web-vitals), prettier.config.js (tailwind plugin) | M2 | DONE | ORIGINAL_REQUEST §R4.5, R4.6 |
| 8 | R5: Root Documentation & Config | README.md (stack, run instructions, architecture rules), .gitignore, next.config.ts | M2 | DONE | ORIGINAL_REQUEST §R5 |
| 9 | AC: Build & Lint Verification | npm run build passes without TS errors, npm run lint clean, path aliases resolve | M3 | DONE | ORIGINAL_REQUEST §Acceptance Criteria |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|---|---|---|---|
| 1 | Project Scaffold, Dependencies & Folders | R1, R2, R3 (package.json, tsconfig.json, install deps, directory tree, placeholders) | none | DONE |
| 2 | Tooling Configurations & Root Files | R4, R5 (tailwind, vitest, playwright, env.ts, .env.local.example, eslint, prettier, globals.css, README, .gitignore, next.config.ts) | M1 | DONE |
| 3 | Verification & Gate Pass | AC Verification (npm run build, npm run lint, test suite run, git status check, forensic audit) | M2 | DONE |

## Code Layout
- Root: `c:\Users\miran\OneDrive\Documentos\agroconnect\frontend\`
- `src/app/`: Next.js App Router route segments and root layout/error/loading/not-found
- `src/features/`: Feature modules (auth, profile, match-discovery, matches)
- `src/ui/`: UI components and layouts
- `src/core/`: Models, services, actions, providers, env config
- `src/shared/`: Cross-cutting utils, hooks, constants, types
- `tests/`: Unit and E2E test folders
- `public/`: Static assets
