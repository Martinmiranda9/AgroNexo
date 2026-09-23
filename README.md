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
![Auth0](https://img.shields.io/badge/Auth0-JWT-EB5424?logo=auth0&logoColor=white)

</div>

---

## 📖 Sobre el proyecto

Un **equipo** (agrónomo, contador, inversor y otros profesionales) gestiona uno o más **productores y campos**, y todos colaboran sobre los mismos datos en un dashboard compartido.

> 🚧 **Estado: en desarrollo.** La primera pieza funcional es el **módulo Match Productor ↔ Profesional**, base sobre la que se construirá el resto de la plataforma.

## 🤝 Módulo Match

| Paso | Qué ocurre |
|:---:|:---|
| 1️⃣ | El productor registra su perfil y sus campos, con ubicación geográfica |
| 2️⃣ | Crea una búsqueda indicando la especialidad que necesita |
| 3️⃣ | El motor de scoring rankea a los profesionales por afinidad y cercanía |
| 4️⃣ | Productor y profesional gestionan el match: aceptar, rechazar o cancelar |

**Fuera de alcance por ahora:** bot de WhatsApp, liquidación de impuestos, inversión patrimonial y compra colectiva de insumos.

## 🛠️ Stack tecnológico

| | Capa | Tecnología |
|:---:|:---|:---|
| 🎨 | **Frontend** | Next.js 15 (App Router), React 19, TypeScript 5, Tailwind CSS 4 |
| 🔄 | **Estado y formularios** | TanStack Query 5, Zustand, React Hook Form + Zod |
| 💎 | **UI** | UI Kit propio (paleta Pine & Beige, Geist), Motion |
| ⚙️ | **Backend** | .NET 8, ASP.NET Core Web API, Swagger |
| 🏛️ | **Arquitectura** | Clean Architecture (Domain · Application · Infrastructure · API), multi-tenant |
| 🗄️ | **Datos** | PostgreSQL + PostGIS, EF Core, NetTopologySuite |
| 🔐 | **Autenticación** | Auth0 (JWT + claims) con Google Social Login |
| 🧪 | **Testing** | xUnit, Vitest + Testing Library, Playwright (E2E) |

## 📁 Estructura del repositorio

```
AgroNexo/
├── backend/     # API .NET 8 (src/ + tests/)
├── frontend/    # App Next.js (features, ui, core, shared)
└── ia/          # Planes de implementación y lineamientos
```

📚 **Documentación interna**
- 🎨 Plan de frontend y UI Kit: [`ia/frontend_implementation_plan.md`](ia/frontend_implementation_plan.md)
- ⚙️ Plan y lineamientos de backend: [`ia/implementation_plan.md`](ia/implementation_plan.md) · [`ia/agent.md`](ia/agent.md)

## 🚀 Puesta en marcha

### ✅ Requisitos

- Node.js 20+ y npm 10+
- .NET SDK 8
- PostgreSQL con la extensión PostGIS
- Un tenant de Auth0 (aplicación web + API)

### ⚙️ Backend

```bash
cd backend
cp .env.example .env        # completar con valores reales
dotnet restore
dotnet run --project src/AgroNexo.API
dotnet test
```

API en `http://localhost:5000` (Swagger en modo Development).

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
- 🛡️ El aislamiento entre tenants se aplica en el backend (middleware de tenant + validación de ownership); la autorización de rutas del frontend se resuelve server-side en `middleware.ts`.

## 📐 Convenciones

- 🌐 Código en **inglés**; textos visibles al usuario en **español** (Argentina).
- 🧱 Capas con dependencias en una sola dirección (ver planes en `ia/`).
- 🎯 Todo el frontend respeta el UI Kit: solo tokens de diseño y componentes de `ui/`.

## 📝 Nota sobre el nombre

El proyecto se llamaba *AgroConnect* y fue renombrado a **AgroNexo**. El dominio y audience del tenant de Auth0 (`agroconnect-dev…`, `api.agroconnect.com`) y los claims `https://agroconnect.com/*` se mantienen hasta migrar la configuración del tenant.

---

<div align="center">

Hecho con 💚 en Argentina

</div>
