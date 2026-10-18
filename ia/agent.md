# AgroNexo — Convenciones generales del proyecto

> Información general del proyecto (negocio, stack, reglas comunes) y convenciones del backend. El detalle del frontend está en [`frontend_implementation_plan.md`](frontend_implementation_plan.md); las reglas de trabajo (tests E2E en todo pedido) en [`CLAUDE.md`](../CLAUDE.md).

## 1. Rol y Objetivo
Desarrollador full stack senior: .NET con Clean Architecture y multi-tenant en el backend, Next.js + React en el frontend. Objetivo de esta etapa: el módulo **Match Productor ↔ Profesional** y, sobre él, el **espacio de trabajo por campo** donde el productor y los profesionales con los que hizo match colaboran.

## 2. Contexto del negocio
Plataforma donde un **productor** busca profesionales (agrónomo, contador, inversor y otros) y arma un **equipo por campo**. Flujo actual:
1. **Búsqueda asistida**: el productor describe su necesidad, la IA arma una ficha y el sistema rankea profesionales por especialidad, zona y score.
2. **Solicitud (match)**: el productor la envía; el profesional la acepta o rechaza.
3. **Campo compartido**: con el match aceptado, el profesional entra al campo del productor. Los profesionales entran y salen; solo el productor cierra el campo. Tablero con lotes, cultivos, campañas, actividades y resumen semanal.

Fuera de alcance: bot de WhatsApp, liquidación de impuestos, inversión patrimonial, compra colectiva de insumos.

## 3. Stack
- **Backend:** .NET 8 · ASP.NET Core Web API · Firebase Authentication (JWT RS256) · PostgreSQL con PostGIS · EF Core 8 con NetTopologySuite · Swagger · Docker.
- **Frontend:** Next.js 15 + React 19 + TypeScript · Tailwind CSS 4 · Cashmere (registro shadcn, variantes sobre Base UI) · Google Material Icons (`react-icons/md`) · `motion/react` · Firebase Auth en cliente con cookie de sesión httpOnly · Gemini para la búsqueda asistida. Mobile-first.
- **Tests:** xUnit + FluentAssertions + Moq, Testcontainers (PostgreSQL) en integración · Vitest + Testing Library y Playwright en el frontend.

### 3.1 Sistema de diseño Cashmere
La UI de AgroNexo se construye con el sistema de diseño **Cashmere** de Better Design (https://better-design.com/design-systems/cashmere), un registro shadcn que se instala ítem por ítem con `npx shadcn@latest add https://better-design.com/registry/cashmere/<item>.json`. Nunca instalar `all.json` (pisa `globals.css` y los componentes de `ui/`).

> **Toda UI nueva debe construirse con componentes de Cashmere** (buttons, cards, breadcrumb, cards de datos/stats, métricas, toggle, toggle group, charts, progress, tabs, tables, inputs, selects, dialogs, alerts, badges, sidebar, etc.). **Prohibido crear componentes ad hoc o escribir utilidades Tailwind nuevas en páginas.** Si un caso no está cubierto por Cashmere, se consulta antes de crear algo.

Los componentes de Cashmere pueden usar Tailwind por dentro; páginas, features y layouts no suman clases utilitarias nuevas: el estilo sale de los componentes y de los tokens/variables CSS. Se usan las variantes `-base` (Base UI) cuando existen, Radix solo donde no; los íconos de Cashmere (`@iconify/react`) se reemplazan por `react-icons/md`; los tamaños son los de Cashmere, responsivos. **Ante un conflicto, Cashmere gana a shadcn y a Tailwind.**

**Jerarquía de decisión ante conflictos:**
1. **Identidad de AgroNexo**: paleta v4 "verde campo" y sus combinaciones. La tipografía es la de Cashmere (Inter). No se negocia.
2. **Componentes Cashmere**: estructura, comportamiento, formas, espaciados y variantes.
3. **[`frontend_implementation_plan.md`](frontend_implementation_plan.md)** (incluidos shadcn y Tailwind): si contradice a Cashmere en lo que hace al componente, gana Cashmere.

## 4. Idioma del código (regla estricta)
- Todo el código se escribe en **inglés**: clases, métodos, variables, propiedades, DTOs, componentes, tablas, columnas, ramas de git, proyectos y carpetas. Ejemplo: `Producer`, `MatchStatus`, `IMatchRepository`, `CreateMatchRequest`, `FarmDashboardScreen`.
- Lo que ve el usuario final argentino queda en **español**: mensajes de error y validación (`[Required(ErrorMessage = "El campo es obligatorio")]`), textos de la UI, notificaciones y catálogos de negocio con datos reales (localidades, cultivos).
- Comentarios de código: en español.
- Nombres de tests: en inglés en .NET (`MethodName_Scenario_ExpectedResult`); en español en `describe`/`test` de Playwright y Vitest.

## 5. Arquitectura backend (Clean Architecture)
```
backend/src/
├── AgroNexo.Domain/          # Entidades, enums, value objects, excepciones de dominio. Sin dependencias externas.
├── AgroNexo.Application/     # Por feature: Identity, Producers, Professionals, Matching, Farms (DTOs, use cases, servicios).
├── AgroNexo.Infrastructure/  # EF Core (DbContext, migraciones), repositorios concretos.
└── AgroNexo.API/             # Controllers, middlewares (Exception, Tenant), auth, DI, Swagger.
```
Dependencia: **API → Application → Domain**. Infrastructure implementa interfaces definidas arriba, nunca al revés. Domain no conoce a nadie.

**Repository:** interfaces en Application/Domain, implementación en Infrastructure. Un repo por agregado. Nunca exponer `DbContext` ni `IQueryable` fuera de Infrastructure.

**Modularidad:** Application se organiza por feature, no por tipo técnico. Cada módulo trae sus DTOs, validaciones y use cases. Lo compartido va a Domain o a `Application/Common`. Así se agregan módulos (gastos, liquidación) sin tocar lo construido.

**Mobile-first:** payloads livianos y paginación en las listas que puedan crecer.

## 6. Multi-tenancy
Tenant = espacio de trabajo de cada usuario: se crea al registrarse (`POST /api/v1/identity/register`). Los tokens de Firebase no traen rol ni tenant: `TenantMiddleware` los resuelve desde la base (productor o profesional registrado con ese `sub`) y completa `ITenantContext` y `ICurrentUserService`. Sin tenant solo se permiten `identity/me` e `identity/register`.

- Filtro por `TenantId` con global query filters de EF Core en las entidades de un solo tenant (`Professional`, `Farm`); nunca confiar en que cada repo filtre a mano.
- `Match`, `FarmMember`, lotes, campañas y actividades **cruzan tenants** (productor ↔ profesional): no llevan filtro de tenant y el acceso se valida en Application (`IFarmAccessService`).
- La identidad del token manda sobre cualquier ID de URL o body. Un acceso cruzado indebido lanza `CrossTenantAccessException` → 403.

## 7. Autenticación y autorización
- **Producción:** JWT de Firebase validado contra el JWKS de Google (`FirebaseJwksCache`), con emisor `https://securetoken.google.com/{projectId}` y audiencia `projectId` (`Firebase:ProjectId`). No se usa `Authority` porque Firebase no publica discovery OIDC.
- **Desarrollo:** JWT firmado con clave simétrica local, emitido por `DevAuthController` (`/api/v1/dev/token`). Nunca habilitarlo fuera de Development.
- Todas las rutas con `[Authorize]` salvo health y Swagger. Policies centralizadas en `Program.cs`: `Authenticated`, `IsProducer`, `IsProfessional`; nada de checks de rol hardcodeados en los controllers.
- La identidad se guarda en `FirebaseUid` (columna de `Producer` y `Professional`, índice único): es el `sub` del token de Firebase.

## 8. DTOs y validaciones
Nunca exponer entidades de dominio: DTOs de entrada (`...Request`) y salida (`...Response`). Validación con **Data Annotations**; `[ApiController]` corta con 400 si el modelo es inválido. Mapeo entidad↔DTO **manual** (mappers por feature, ej. `FarmPlanningMapper`), sin AutoMapper. Las reglas de negocio (ej. no duplicar un match activo con el mismo profesional) van en Domain/Application, nunca en el DTO ni en el controller.

## 9. API
**Códigos HTTP:** 200 · 201 (+`Location`) · 204 · 400 (validación) · 401 (sin token o sin tenant) · 403 (sin permiso) · 404 · 409 (ej. match duplicado) · 500 (sin stack trace en producción).

Errores en `ProblemDetails` (RFC 7807), centralizados en `ExceptionHandlingMiddleware`; los controllers no hacen try/catch. Enums serializados como string (`JsonStringEnumConverter`), JSON en camelCase.

**Recursos actuales** (todos bajo `/api/v1`): `identity` (`me`, `register`), `producers`, `professionals`, `match-discovery` (+`/{id}/recommendations`), `matches` (+`/{id}/status`), `workspaces`, `farms` (+`members`, `candidates`), `farms/{farmId}/lots` (+`crops`), `farms/{farmId}/campaigns`, `farms/{farmId}/activities` (+`/{id}/status`), `farms/{farmId}/dashboard`, `health`.

Sustantivos en plural, sin verbos en la ruta, versionado `/api/v1/...` desde el primer día.

## 10. Estilo de código
`PascalCase` para clases/métodos/propiedades, `camelCase` para variables y parámetros, `_camelCase` para campos privados. Un archivo por clase o componente, sin "god objects". DI por constructor, nunca `new` de servicios o repositorios. Async/await de punta a punta, nada de `.Result` ni `.Wait()`. Comentarios solo donde el código no se explica solo.

**Git:** commits convencionales en español (`feat:`, `fix:`, `refactor:`, `test:`, `docs:`), un commit por bloque de trabajo, sin `git add -A`. Los tests se suben; informes y scripts de desarrollo locales, no.

## 11. Testing
```
backend/tests/
├── AgroNexo.UnitTests/         # Use cases, dominio, scoring, middlewares
└── AgroNexo.IntegrationTests/  # Endpoints por HTTP con Postgres en Testcontainers, aislamiento de tenant
```
Cubrir siempre: reglas de negocio del match, acceso a campos compartidos, aislamiento multi-tenant y los casos 401/403/404/409. No hace falta 100 % de cobertura.

**E2E en todo pedido:** cada cambio suma tests nuevos. Frontend: Playwright en `frontend/tests/e2e/<feature>.spec.ts`. Cambio solo de backend: test de integración nuevo que recorra el flujo por HTTP. Los tests existentes no se modifican salvo pedido explícito. Detalle en [`CLAUDE.md`](../CLAUDE.md).

## 12. Logging y configuración
- Logger nativo de .NET con niveles claros: `Information` para eventos de negocio (match creado, miembro agregado), `Warning` para accesos denegados, `Error` para excepciones no controladas. Nunca loguear tokens, contraseñas ni datos personales.
- Configuración sensible (connection strings, `Firebase:ProjectId`, `Cors:AllowedOrigins`; en el frontend, `GEMINI_API_KEY`) por variables de entorno o User Secrets; nunca versionada.
- Migraciones al arrancar solo con `Database:MigrateOnStartup=true` (contenedor).
- Health check público en `/api/v1/health`.

## 13. Qué NO hacer
- No implementar el bot de WhatsApp, liquidación de impuestos ni inversión patrimonial.
- No hardcodear roles ni `TenantId` "para probar más rápido".
- No exponer entidades de EF Core en ningún response.
- No usar el token de desarrollo ni la clave simétrica fuera de Development.
- No introducir colores, fuentes o componentes fuera del UI Kit en el frontend.

## 14. Definition of Done
Endpoints documentados en Swagger. Rutas protegidas con su policy. Aislamiento de tenant y acceso a campos compartidos probados. DTOs validados, dominio nunca expuesto. Códigos HTTP según §9. Tests unitarios de los use cases y tests de integración/E2E del flujo nuevo, corridos y reportados con su resultado real. En frontend, además, el checklist del UI Kit.

Reglas de negocio del match que siempre tienen test:
- Dos matches activos del mismo productor con distintos profesionales de la misma especialidad → 201 en ambos.
- Segundo match contra el mismo par (ProducerId, ProfessionalId) en estado Pending/Active → 409.
- `GenerateMatchRecommendations` excluye profesionales fuera de su zona de cobertura cuando la especialidad requiere presencia física, y no filtra por zona cuando no la requiere.
- El orden de las recomendaciones respeta el score calculado, no el orden de inserción.
