# AgroConnect — Frontend

AgroConnect is a multi-tenant agricultural platform connecting producers and agronomic professionals/teams. This repository contains the frontend application built with **Next.js 15 (App Router)**, **React 19**, **TypeScript 5**, and **Tailwind CSS 4**.

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 15 (App Router) + React 19 + TypeScript 5 (strict mode) |
| **Styling** | Tailwind CSS 4 with custom AgroConnect design tokens |
| **Authentication** | Auth0 (`@auth0/nextjs-auth0`) with edge session management |
| **Server State** | TanStack Query v5 (mutations and client fetching) |
| **Client State** | Zustand (filters, client selections) |
| **Forms & Validation**| React Hook Form + Zod + `@hookform/resolvers` |
| **Environment** | `@t3-oss/env-nextjs` + Zod (build-time validation) |
| **Icons & Motion** | Lucide React, Motion (`motion/react`) |
| **Unit Testing** | Vitest + React Testing Library + jsdom |
| **E2E Testing** | Playwright (Chromium) |
| **Code Quality** | ESLint (`next/core-web-vitals`) + Prettier (`prettier-plugin-tailwindcss`) |

---

## Getting Started

### Prerequisites
- **Node.js**: v20.x or higher
- **npm**: v10.x or higher

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy the example environment file:
```bash
cp .env.local.example .env.local
```
Fill in the Auth0 credentials and the backend API endpoint (`NEXT_PUBLIC_API_URL`).

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser.

---

## Available Scripts

- `npm run dev`: Starts the Next.js development server on port 3000.
- `npm run build`: Compiles the production build with type checking.
- `npm run start`: Runs the built production application.
- `npm run lint`: Runs ESLint across the codebase.
- `npm run test`: Executes unit and component tests via Vitest.
- `npm run test:e2e`: Runs end-to-end integration tests using Playwright.

---

## Layered Architecture

The project follows a strict unidirectional layered architecture:

```
App ──→ Features ──→ Core ──→ Shared
             │                  ▲
             └──→ UI ───────────┘
```

- `src/app/`: Next.js App Router route segments, public/authenticated route groups, root layouts, error/loading handlers, and middleware.
- `src/features/`: Domain feature slices (`auth/`, `profile/`, `match-discovery/`, `matches/`) containing Server Components and interactive Client Components.
- `src/ui/`: Reusable, domain-agnostic Design System components (`Button`, `Input`, `Card`, `Modal`, `Badge`, `Spinner`, `Toast`) and structural layouts (`AppShell`, `Navbar`, `MobileNav`, `Sidebar`, `Footer`).
- `src/core/`: Models (TypeScript interfaces), client-side services, Server Actions, context providers, and environment configuration.
- `src/shared/`: Utility functions, custom hooks, constants, and shared types.

---

## Architectural Rules

1. **Server Components by Default**: Pages and components are Server Components unless interactivity (`useState`, event listeners) is strictly needed.
2. **Layer Import Boundaries**:
   - Features may import Core, UI, and Shared.
   - Features **never** import other Features.
   - Core **never** imports Features or UI.
   - UI imports only Shared.
   - Shared never imports from outer layers.
3. **No Direct API Calls from UI**: Server Components invoke `core/actions/`, while Client Components use `core/services/` via TanStack Query.
4. **Localization & Language**: Code, types, and comments are written in **English**; all user-facing text and messages are in **Spanish**.
