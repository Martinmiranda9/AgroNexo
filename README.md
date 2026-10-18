<div align="center">

# 🌾 AgroNexo

### Conectando productores con profesionales del agro

Plataforma agropecuaria **multi-tenant** donde productores y equipos agronómicos colaboran sobre los mismos datos, en un solo lugar.

![Next.js](https://img.shields.io/badge/Next.js-15-000000?logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind-4-06B6D4?logo=tailwindcss&logoColor=white)
![.NET](https://img.shields.io/badge/.NET-8-512BD4?logo=dotnet&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-PostGIS-4169E1?logo=postgresql&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-Auth-FFCA28?logo=firebase&logoColor=black)

</div>

---

## 📖 Sobre el proyecto

Un **productor** busca profesionales (agrónomo, contador, inversor y otros) y arma un **equipo por campo**: todos colaboran sobre los mismos datos en el tablero del campo.

> 🚧 **Estado: en desarrollo.** Hoy funcionan el **módulo Match Productor ↔ Profesional** y, sobre él, el **espacio de trabajo por campo**.

## 🤝 Módulo Match

| Paso | Qué ocurre |
|:---:|:---|
| 1️⃣ | **Búsqueda asistida:** el productor describe su necesidad y la IA (Gemini) arma una ficha |
| 2️⃣ | El motor de scoring rankea a los profesionales por especialidad, zona y score |
| 3️⃣ | **Solicitud:** el productor la envía; el profesional la acepta o la rechaza |
| 4️⃣ | **Campo compartido:** con la solicitud aceptada, el profesional entra al campo del productor (lotes, cultivos, campañas, actividades y resumen semanal) |

**Fuera de alcance por ahora:** bot de WhatsApp, liquidación de impuestos, inversión patrimonial y compra colectiva de insumos.

## 🛠️ Stack tecnológico

| | Capa | Tecnología |
|:---:|:---|:---|
| 🎨 | **Frontend** | Next.js 15 (App Router), React 19, TypeScript 5, Tailwind CSS 4 |
| 🔄 | **Datos y formularios** | Server Actions contra la API .NET, formularios controlados + Zod |
| 💎 | **UI** | UI Kit sobre Cashmere y Base UI (paleta v4 verde campo, Inter), Google Material Icons, Motion, Recharts |
| 🤖 | **IA** | Gemini (`@google/genai`) para la búsqueda asistida |
| ⚙️ | **Backend** | .NET 8, ASP.NET Core Web API, Swagger |
| 🏛️ | **Arquitectura** | Clean Architecture (Domain · Application · Infrastructure · API), multi-tenant |
| 🗄️ | **Datos** | PostgreSQL + PostGIS, EF Core, NetTopologySuite |
| 🔐 | **Autenticación** | Firebase Authentication (correo + contraseña y Google), cookie de sesión httpOnly; el backend valida el JWT contra el JWKS de Google |
| 🧪 | **Testing** | xUnit + FluentAssertions + Moq, Testcontainers, Vitest + Testing Library, Playwright (E2E) |

## 📁 Estructura del repositorio

```
AgroNexo/
├── backend/     # API .NET 8 (src/ + tests/)
├── frontend/    # App Next.js (features, ui, core, shared)
├── docs/        # Planes de trabajo (plans/) e investigación de mercado (research/)
├── ia/          # Convenciones del proyecto y plan de frontend
└── .github/     # Workflows de CI (backend y frontend)
```

📚 **Documentación interna**
- 🔎 Investigación de mercado (matchmaking profesional agro): [`docs/research/`](docs/research/)
- 🎨 Plan de frontend y UI Kit: [`ia/frontend_implementation_plan.md`](ia/frontend_implementation_plan.md)
- ⚙️ Convenciones generales y de backend: [`ia/agent.md`](ia/agent.md)

## 🚀 Puesta en marcha

### ✅ Requisitos

- Node.js 20+ y npm 10+
- .NET SDK 8
- PostgreSQL con la extensión PostGIS
- Un proyecto de Firebase con Authentication (correo/contraseña y Google) habilitado
- Opcional: una clave de Gemini (`GEMINI_API_KEY`) para la búsqueda asistida

### ⚙️ Backend

```bash
cd backend
dotnet user-secrets set "ConnectionStrings:DefaultConnection" "Host=localhost;Port=5432;Database=agronexo_dev_db;Username=postgres;Password=<tu-clave>" --project src/AgroNexo.API
dotnet restore
dotnet run --project src/AgroNexo.API
dotnet test
```

API en `http://localhost:5000` (Swagger en modo Development). El `Firebase:ProjectId` ya viene en `appsettings.json`; la cadena de conexión va por *user secrets* o por la variable `ConnectionStrings__DefaultConnection`.

### 🐳 Docker (API + base)

```bash
cp .env.example .env   # POSTGRES_*, FIREBASE_PROJECT_ID, FRONTEND_ORIGIN
docker compose up -d --build
```

La API queda en `http://127.0.0.1:8080` y aplica las migraciones al arrancar.

### 🎨 Frontend

```bash
cd frontend
cp .env.local.example .env.local   # completar con valores reales
npm install
npm run dev
```

App en `http://localhost:3000`. Otros scripts: `npm run build` · `npm run lint` · `npm test` · `npm run test:e2e`.

## 🔒 Seguridad y credenciales

- 🚫 **Nunca se commitean secretos.** `.env` y `.env.local` están en `.gitignore`; solo se versionan las plantillas `*.example`.
- 🔑 Las contraseñas de base de datos se inyectan por variables de entorno o *user secrets*; los `appsettings*.json` solo llevan placeholders.
- 🛡️ El aislamiento entre tenants se aplica en el backend (middleware de tenant + validación de ownership); la autorización de rutas del frontend se resuelve server-side en el layout de `(authenticated)` y en `/auth/continue`.

## 📐 Convenciones

- 🌐 Código en **inglés**; textos visibles al usuario en **español** (Argentina).
- 🧱 Capas con dependencias en una sola dirección (ver `ia/`).
- 🎯 Todo el frontend respeta el UI Kit: solo tokens de diseño y componentes de `ui/`.

---

<div align="center">

Hecho con 💚 en Argentina

</div>
