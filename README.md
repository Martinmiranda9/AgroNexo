# AgroNexo

Plataforma agropecuaria **multi-tenant** que conecta **productores** con **profesionales y equipos agronómicos** (agrónomos, contadores, inversores y otros perfiles). Un equipo puede gestionar uno o más productores/campos y colaborar sobre los mismos datos en un dashboard compartido.

> **Estado:** en desarrollo. La primera pieza funcional es el **módulo Match Productor ↔ Profesional**, base sobre la que se construirá el resto de la plataforma.
>
> **Nota de nombre:** el proyecto se llamaba *AgroConnect*. Los namespaces, carpetas y proyectos de código todavía conservan ese nombre; la migración a *AgroNexo* es gradual.

## Qué hace el módulo Match

1. El productor registra su perfil y sus campos (con ubicación geográfica).
2. Crea una búsqueda indicando la especialidad que necesita.
3. El motor de scoring rankea a los profesionales por afinidad y cercanía geográfica.
4. Productor y profesional gestionan el match: aceptar, rechazar o cancelar.

Fuera de alcance por ahora: bot de WhatsApp, liquidación de impuestos, inversión patrimonial y compra colectiva de insumos.

## Stack

| Capa | Tecnología |
|:---|:---|
| **Frontend** | Next.js 15 (App Router), React 19, TypeScript 5, Tailwind CSS 4 |
| **Estado / datos** | TanStack Query 5, Zustand, React Hook Form + Zod |
| **UI** | UI Kit propio (paleta Pine & Beige, Geist), Motion, Taste Skill como guía de diseño |
| **Backend** | .NET 8, ASP.NET Core Web API, Swagger |
| **Arquitectura** | Clean Architecture (Domain · Application · Infrastructure · API), multi-tenant |
| **Datos** | PostgreSQL + PostGIS, EF Core, NetTopologySuite |
| **Auth** | Auth0 (JWT + claims) con Google Social Login |
| **Testing** | xUnit (unit e integración), Vitest + Testing Library, Playwright (E2E) |

## Estructura del repositorio

```
├── backend/     # API .NET 8 (src/ + tests/)
├── frontend/    # App Next.js (features, ui, core, shared)
└── ia/          # Planes de implementación y lineamientos del proyecto
```

- Plan de frontend y **UI Kit**: [`ia/frontend_implementation_plan.md`](ia/frontend_implementation_plan.md)
- Plan y lineamientos de backend: [`ia/implementation_plan.md`](ia/implementation_plan.md), [`ia/agent.md`](ia/agent.md)

## Puesta en marcha

### Requisitos
- Node.js 20+ y npm 10+
- .NET SDK 8
- PostgreSQL con la extensión PostGIS
- Un tenant de Auth0 (aplicación web + API)

### Backend
```bash
cd backend
cp .env.example .env        # completar con valores reales
dotnet restore
dotnet run --project src/AgroConnect.API
dotnet test
```
API en `http://localhost:5000` (Swagger en modo Development).

### Frontend
```bash
cd frontend
cp .env.local.example .env.local   # completar con valores reales
npm install
npm run dev
```
App en `http://localhost:3000`. Otros scripts: `npm run build`, `npm run lint`, `npm test`, `npm run test:e2e`.

## Seguridad y credenciales

- **Nunca se commitean secretos.** `.env` y `.env.local` están en `.gitignore`; solo se versionan las plantillas `*.example`.
- Las contraseñas de base de datos se inyectan por variables de entorno o *user secrets*; los `appsettings*.json` solo contienen placeholders.
- El aislamiento entre tenants se aplica en el backend (middleware de tenant + validación de ownership), y la autorización de rutas en el frontend se resuelve server-side en `middleware.ts`.

## Convenciones

- Código en **inglés**; textos visibles al usuario en **español** (Argentina).
- Capas con dependencias en una sola dirección (ver planes en `ia/`).
- Todo el frontend respeta el UI Kit: solo tokens de diseño y componentes de `ui/`.
