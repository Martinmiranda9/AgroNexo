— AgroNexo Platform (Backend API)

## 1. Rol y Objetivo
Desarrollador backend senior en .NET, especializado en Clean Architecture, multi-tenant y APIs REST productivas. Objetivo de esta etapa: construir la API del módulo **Match Productor ↔ Profesional**, primera pieza funcional de AgroNexo. Solo backend; frontend (Angular/Next) se aborda después.

## 2. Contexto del negocio
Plataforma multi-tenant donde un **equipo** (agrónomo + contador + inversor + otros profesionales) gestiona uno o más **productores/campos**. El productor carga datos por WhatsApp; el equipo colabora sobre esos datos en un dashboard compartido. **Alcance de esta fase:** el Match — vínculo entre productor y profesional/equipo, base sobre la que se construye todo lo demás. Fuera de alcance: bot de WhatsApp, liquidación de impuestos, inversión patrimonial, compra colectiva de insumos.

## 3. Stack
.NET 8 · Auth0 (JWT + claims) · PostgreSQL (con PostGIS) · EF Core (con NetTopologySuite) · Swagger. Frontend: **Next.js 15 + React 19 + Tailwind CSS 4**, mobile-first.

### 3.1 Skill de Diseño Frontend — Taste Skill
El proyecto usa **Taste Skill** (`npx skills add Leonxlnx/taste-skill`) como framework anti-slop de diseño para el frontend. Las skills instaladas están en `frontend/.agents/skills/`. Al generar cualquier UI:
- Leer `design-taste-frontend/SKILL.md` antes de escribir código de interfaz.
- Aplicar siempre los tres diales: `DESIGN_VARIANCE`, `MOTION_INTENSITY`, `VISUAL_DENSITY`.
- Usar `motion/react` (Framer Motion) para animaciones — nunca `useState` para valores continuos.
- Nunca usar Inter, Lucide por defecto, sombras `shadow-md/lg`, ni gradientes AI-purple genéricos.
- Paleta AgroNexo (verde oliva + crema) se mantiene — NO reemplazar por paletas estándar.
- Tipografía: Usar EXCLUSIVAMENTE fuente sans-serif (Geist). NUNCA usar fuentes Serif (como Instrument Serif).
- Componentes de referencia: `reactbits.dev`, `ui.aceternity.com` para inspiración de componentes premium.

## 4. Idioma del código (regla estricta)
- Todo el código se escribe en **inglés**: nombres de clases, métodos, variables, propiedades, DTOs, tablas, columnas, ramas de git, nombres de proyectos/carpetas. Ejemplo: `Producer`, `Professional`, `MatchStatus`, `IMatchRepository`, `CreateMatchRequest`.
- Todo lo que sea **contenido en español** (porque lo consume un usuario final argentino) queda en español: mensajes de error visibles, mensajes de validación (`[Required(ErrorMessage = "El campo es obligatorio")]`), textos de notificaciones, nombres/etiquetas de catálogos de negocio si vienen de datos reales (ej. localidades, cultivos), y cualquier string que se le muestre al usuario.
- Comentarios de código: en español, salvo que documenten una regla de negocio específica del contexto argentino donde el término local no tiene traducción clara (ej. "gasto hormiga").

## 5. Arquitectura (Clean Architecture)
```
src/
├── AgroNexo.Domain/          # Entidades, Value Objects, interfaces de dominio. Sin dependencias externas.
├── AgroNexo.Application/     # Casos de uso, DTOs, interfaces de repositorio, validadores.
├── AgroNexo.Infrastructure/  # EF Core, repositorios concretos, Auth0, servicios externos.
└── AgroNexo.API/             # Controladores, middlewares, inyección de dependencias, filtros globales.
```
Dependencia: **API → Application → Domain**. Infrastructure implementa interfaces definidas arriba, nunca al revés. Domain no conoce a nadie.

**Repository:** interfaces en Application/Domain (`IProducerRepository`, `IProfessionalRepository`, `IMatchRepository`), implementación concreta en Infrastructure. Un repo por agregado, no un repositorio genérico gigante salvo un `IRepository<T>` base opcional para CRUD trivial. Nunca exponer `DbContext` ni `IQueryable` fuera de Infrastructure.

**Modularidad:** organizar Application por feature (`Application/Matching`, `Application/Producers`, `Application/Professionals`), no por tipo técnico plano. Cada módulo trae sus propios DTOs, validadores y use cases. Sin acoplamiento cruzado entre módulos; lo compartido va a Domain o a un módulo `Shared`. Esto es clave para agregar módulos futuros (gastos, liquidación, inversión) sin tocar lo ya construido.

**Mobile-first:** la API devuelve payloads livianos, paginación por defecto en toda lista (nunca colecciones completas sin paginar), pensada para consumo desde mobile y desde el bot de WhatsApp más adelante.

## 6. Multi-tenancy
Tenant = equipo. `TenantId` viaja como claim en el JWT de Auth0 y se resuelve en un `ITenantContext` al inicio de cada request. Filtro automático por `TenantId` vía global query filter de EF Core — nunca confiar en que cada repositorio filtre a mano. El claim del token manda siempre sobre cualquier ID pasado por URL o body; un tenant jamás accede a datos de otro, ni por error de parámetro.

## 7. Auth0 — autenticación y autorización
Todas las rutas protegidas con `[Authorize]` salvo health check y documentación. Validar claims específicos: rol (`producer`, `agronomist`, `accountant`, `investor`, `team_admin`) y `TenantId`, mediante **policies** definidas centralizadamente en `Program.cs`, nunca con checks de rol hardcodeados dentro de los controllers. Un productor nunca accede a datos de otro productor del mismo tenant sin permiso explícito.

## 8. DTOs y validaciones
Nunca exponer entidades de dominio en request/response — siempre DTOs de entrada (`...Request`) y salida (`...Response`). Validar con **Data Annotations** (`[Required]`, `[MaxLength]`, `[EmailAddress]`, `[Range]`), reforzado por un `ActionFilter` global que corte antes de llegar al controller si `ModelState` es inválido. Mapeo entidad↔DTO manual o AutoMapper — elegir uno y ser consistente en todo el proyecto. Reglas de negocio (ej: un productor no puede tener dos matches activos con el mismo profesional) van en Application, nunca en el DTO ni en el controller.

## 9. API

**Códigos HTTP:**
200 OK · 201 Created (+header `Location`) · 204 No Content (delete exitoso) · 400 Bad Request (validación) · 401 Unauthorized (sin token/token inválido) · 403 Forbidden (token válido, sin permiso) · 404 Not Found · 409 Conflict (ej: match duplicado) · 500 Internal Server Error (nunca exponer stack trace en producción).

Errores en formato `ProblemDetails` (RFC 7807), consistente en toda la API. Manejo de excepciones centralizado en un middleware global (`ExceptionHandlingMiddleware`) — los controllers no hacen try/catch salvo casos muy puntuales.

**Rutas ejemplo (módulo Match):**
```
GET    /api/v1/producers
GET    /api/v1/producers/{id}
POST   /api/v1/producers
GET    /api/v1/professionals
GET    /api/v1/professionals/{id}
POST   /api/v1/matches
GET    /api/v1/matches?producerId=&professionalId=
PATCH  /api/v1/matches/{id}/status
DELETE /api/v1/matches/{id}
```
Sustantivos en plural, sin verbos en la ruta, versionado desde el día uno (`/api/v1/...`) para no romper clientes al evolucionar el contrato.

## 10. Estilo de código
`PascalCase` para clases/métodos/propiedades, `camelCase` para variables locales y parámetros, `_camelCase` para campos privados. Un archivo por clase, sin "god objects" que mezclen responsabilidades de distintos módulos. Inyección de dependencias por constructor, nunca `new` directo de servicios/repositorios. Async/await de punta a punta, nada de `.Result` o `.Wait()` bloqueante. Comentarios solo donde el código no se explica solo. Commits en formato convencional: `feat:`, `fix:`, `refactor:`, `test:`, `docs:` y en español 

## 11. Testing
Unitarios sobre Application (use cases). Primero vamos con la estructura de la api, despues desarrollamos la Base de datos.  Integración sobre los endpoints críticos del Match (alta, filtro por tenant, autorización por claims) con Postgres de test (Testcontainers o similar). No hace falta 100% de cobertura, pero sí cubrir siempre: reglas de negocio del match, aislamiento multi-tenant, y los casos de error 401/403/404/409.

Estructura sugerida:
```
tests/
├── AgroNexo.UnitTests/         # Casos de uso de Application, validadores, reglas de dominio
└── AgroNexo.IntegrationTests/  # Endpoints, EF Core, aislamiento de tenant
```
Nombres de tests en inglés, formato `MethodName_Scenario_ExpectedResult` (ej: `CreateMatch_DuplicateProducerAndProfessional_ReturnsConflict`).

## 12. Logging y configuración
- Logging estructurado (Serilog o el logger nativo de .NET) con niveles claros: `Information` para eventos de negocio relevantes (match creado, match cerrado), `Warning` para intentos fallidos de autorización, `Error` para excepciones no controladas. Nunca loguear tokens, passwords ni datos personales sensibles del productor.
- Configuración sensible (connection strings, Auth0 domain/audience/secret) vía variables de entorno o `appsettings.{Environment}.json` + User Secrets en desarrollo — nunca hardcodeada ni versionada en el repo.
- Un endpoint de health check (`/health`) público, sin autenticación, para monitoreo de infraestructura.

## 13. Qué NO hacer en esta fase
No implementar el bot de WhatsApp ni su parser de mensajes. No construir liquidación de impuestos ni inversión patrimonial. No armar frontend todavía — primero API estable y documentada en Swagger. No hardcodear roles ni `TenantId` "para probar más rápido": multi-tenant y policies se implementan desde el primer endpoint. No exponer entidades de EF Core en ningún response.

## 14. Definition of Done — módulo Match
Endpoints documentados en Swagger con ejemplos de request/response. Todas las rutas protegidas con su policy correspondiente. Filtro multi-tenant aplicado y probado (un tenant no ve datos de otro). DTOs validados con Data Annotations, dominio nunca expuesto. Códigos HTTP consistentes según sección 9. Tests unitarios de los use cases principales + al menos un test de integración end-to-end (alta de producer → alta de professional → creación de match → consulta filtrada por tenant).

Tests de integración requeridos para reglas de negocio:
- Test: dos Match activos para el mismo productor con distinto profesional y misma especialidad → 201 Created en ambos, no 409 Conflict.
- Test: segundo intento de match contra el mismo par (ProducerId, ProfessionalId) en estado Pending/Active → 409 Conflict.
- Test: GenerateMatchRecommendations excluye profesionales fuera de CoverageArea cuando la especialidad requiere presencia física, y no filtra por zona cuando no la requiere.
- Test: orden de MatchRecommendation respeta el score calculado (no depende de orden de inserción en DB).
