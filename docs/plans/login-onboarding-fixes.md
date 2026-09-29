# Plan: arreglos en login / onboarding

Rama: `fix/login-onboarding-fixes`. Este documento es para cualquier agente que continúe el trabajo. Orden: diagnóstico (§1), flujo objetivo (§2), tareas con su estado (§3), criterios (§4) y cómo probar (§5).

**Estado (2026-09-26): tareas 1–5 y 7 implementadas; la 6 está a la espera de decisión.** Lo que sigue pendiente es de configuración externa (Auth0, Google Cloud, Vercel) y de una decisión de producto; ver §6. Regla del trabajo: UI-freeze, solo lógica/estado/rutas. No cambió ningún color, tipografía ni layout; los únicos elementos visuales nuevos son los del paso "Tu cuenta" (armados con componentes del kit) y la pantalla de "sin conexión".

## 1. Cómo funciona hoy (y por qué confunde)

Piezas:

| Ruta / archivo | Qué hace |
|---|---|
| `app/(public)/login/page.tsx` | Renderiza `AgroNexoAuthModal mode="login"` (correo+contraseña y botón Google). Con sesión, redirige a `/auth/continue`. |
| `app/(public)/onboarding/page.tsx` | **Hace dos cosas según el estado**: sin sesión renderiza *otra vez* `AgroNexoAuthModal mode="signup"` (mismo formulario correo+contraseña + Google); con sesión renderiza `RegistrationWizard` (el formulario de datos). |
| `app/(public)/register/page.tsx` | Redirige a `/onboarding`. |
| `features/auth/components/AgroNexoAuthModal.tsx` | Formulario de credenciales. En `signup` llama a `/api/auth/password/signup`. |
| `features/onboarding/*` | `RegistrationWizard`: rol → datos personales → datos del rol. **No tiene campos de correo ni contraseña.** |
| `app/auth/continue/page.tsx` | Destino de todo login: registrado → `/dashboard`, si no → `/onboarding`. |
| `app/api/auth/[auth0]/route.ts` | Google vía Auth0 (`connection=google-oauth2`), redirección de página completa. |
| `app/api/auth/password/{login,signup}/route.ts` | Correo+contraseña contra Auth0 (password-realm), guardan cookie propia `agronexo_session`. |
| `app/api/identity/register/route.ts` | Proxy al backend `POST /api/v1/identity/register` con el token de la sesión. |

### Por qué se siente roto: el registro son DOS pantallas de cuenta + un wizard

Quien no tiene cuenta y toca "Crear una" en `/login` recorre:

1. `/onboarding` → **pantalla de cuenta** (correo + contraseña, o Google). Es la misma UI que el login con otro texto.
2. `/auth/continue` → redirige de nuevo a `/onboarding`.
3. `/onboarding` → **wizard** (rol, datos personales, datos del rol).

`/onboarding` significa dos cosas distintas según haya sesión, y la cuenta de Auth0 se crea (paso 1) **antes** de que el usuario cargue sus datos. Consecuencias:

- El usuario ve "registro" dos veces y no entiende cuál es cuál.
- Si abandona en el wizard, queda una cuenta de Auth0 huérfana sin perfil en el backend. Al volver a `/login` entra y lo mandan al wizard sin explicación.
- La contraseña se pide una sola vez (sin confirmación).
- No hay verificación de correo en ningún lado (`emailVerified` viaja en la sesión pero nada lo usa).
- Google en el modo `signup` y en el modo `login` es el mismo flujo; no se le explica al usuario qué va a pasar.

### Problema probable de despliegue (Vercel + backend local en Docker)

`fetchCurrentUser()` en `core/auth/server.ts` devuelve `null` cuando el backend **no responde** y también cuando el usuario no está registrado. `auth/continue` y `onboarding/page.tsx` hacen `current?.isRegistered ? '/dashboard' : '/onboarding'`, así que **si Vercel no alcanza el backend, todos los usuarios (incluso los ya registrados) caen en el onboarding**. Esto puede ser una parte grande de lo que se vio.

- `API_ORIGIN` sale de `NEXT_PUBLIC_API_URL` y se usa **desde el servidor de Vercel** (server components y route handlers). Un `http://localhost:5000` no existe desde Vercel: hace falta una URL pública (túnel Cloudflare/ngrok al Docker local o hosting del backend).
- Verificar en Vercel: `AUTH0_SECRET`, `AUTH0_BASE_URL` (URL de Vercel), `AUTH0_ISSUER_BASE_URL`, `AUTH0_CLIENT_ID`, `AUTH0_CLIENT_SECRET`, `AUTH0_AUDIENCE`, `NEXT_PUBLIC_API_URL`.
- Verificar en Auth0 (app): Allowed Callback URLs `https://<vercel>/api/auth/callback`, Allowed Logout URLs `https://<vercel>`, grant *Password* habilitado, y en el tenant "Default Directory" = `Username-Password-Authentication`.
- Backend (`.env` de docker): `FRONTEND_ORIGIN` = URL de Vercel.

### Sobre el cartel de Google (imagen)

Ese selector "Elige una cuenta" es la pantalla de Google. Con el botón actual (`/api/auth/login?connection=google-oauth2`) Auth0 redirige la **página completa** a Google y muestra ese mismo selector; no es una ventana emergente. Para que diga "Ir a AgroNexo" y no muestre el aviso de Auth0/desarrollo:

- Crear un OAuth Client propio en Google Cloud (pantalla de consentimiento con nombre y logo de AgroNexo) y cargarlo en Auth0 → Authentication → Social → Google (sin usar las "Auth0 dev keys").

**Decisión (revisada al implementar): popup real de Google, sobre el mismo flujo de Auth0.** El plan original mantenía la redirección de página completa porque un popup "obligaba a un canje de token". No hace falta: la sesión de `@auth0/nextjs-auth0` es una cookie del navegador, compartida entre el popup y la página. Entonces:

1. `startGoogleSignIn()` (`core/auth/google-sign-in.ts`) abre `/api/auth/login?connection=google-oauth2&returnTo=/auth/popup-complete` con `window.open`.
2. Auth0 hace su callback dentro del popup y deja la cookie de sesión.
3. `/auth/popup-complete` avisa a la página principal por `BroadcastChannel` y cierra el popup. (No se usa `window.opener`/`postMessage`: las pantallas de Google pueden cortar el opener por COOP.)
4. La página principal sigue: login → `/auth/continue`; onboarding → recarga `/onboarding` (conserva `?type=`) ya con sesión.

Sin canje de tokens, sin segunda sesión, backend intacto. Si el navegador bloquea el popup se cae a la redirección de página completa (mismo `/auth/popup-complete` sin opener → sigue a `/auth/continue`). Errores de Auth0/Google (`access_denied`, etc.) terminan también en `/auth/popup-complete?error=` en vez de un JSON, y se muestran en el formulario.

Lo de "Ir a AgroNexo" en vez de Auth0/desarrollo sigue siendo configuración (OAuth Client propio en Google Cloud → Auth0 → Social → Google), no código.

## 2. Flujo objetivo

Una sola entrada para crear cuenta, sin repetir pantallas:

```
/login
  ├─ correo + contraseña → Auth0 → /auth/continue → registrado ? /dashboard : /onboarding
  ├─ Continuar con Google → Google → /auth/continue → idem
  └─ "Crear cuenta" → /onboarding

/onboarding  (un solo wizard; ya NO muestra el formulario de credenciales de AgroNexoAuthModal)
  Sin sesión:
    Paso 0 "Tu cuenta":  [Continuar con Google]   o   correo + contraseña + repetir contraseña
    Paso 1 rol → pasos de datos …
  Con sesión de Google (nombre/apellido/correo ya vienen de Google):
    Se omite el paso de cuenta. Nombre y apellido prellenados (editables), correo fijo (solo lectura,
    deshabilitado), SIN contraseña. Solo falta DNI/WhatsApp y los datos del rol.
  Con sesión de correo sin perfil (usuario que abandonó antes):
    Se omite el paso de cuenta y sigue en el rol.
```

Reglas clave:

- **No crear la cuenta de Auth0 hasta el último paso** en el camino correo+contraseña. Los datos (correo, contraseña) viven en el estado del wizard; al enviar se hace todo junto. Así no hay cuentas huérfanas.
- **Google no pide contraseña.** Se pidió "crear contraseña con doble validación" para el registro; con Google no se aplica, porque el acceso es la cuenta de Google (ver §6, decisión 1). La doble validación es para el camino de correo.
- **Contraseña con doble validación** = campo "Repetir contraseña" que debe coincidir (asumido; si se refería a 2FA, avisar: es otro alcance). Mostrar los requisitos (8+, mayúscula, minúscula, número: coinciden con el mensaje de `signupWithPassword`).
- **Google**: nunca se pide contraseña. Si vuelve de Google, el wizard arranca ya autenticado.
- **Verificación de correo**: Google ya viene verificado. Correo+contraseña: Auth0 envía el mail de verificación al crear el usuario; ver tarea 5.

## 3. Tareas

Respetar las reglas de marca del repo (memoria `frontend-brand-rules`): solo tokens del UI Kit (no hex sueltos como `#00311e` ni `#fef7e5`; el `AgroNexoAuthModal` actual los usa y conviene migrarlo al tocarlo), Geist, sin dorado/serif, reutilizar componentes de `ui/` (`Button`, etc.).

### Tarea 1 — Robustez de `fetchCurrentUser` (hacer primero, es la más chica y de mayor impacto)
- `core/auth/server.ts`: que devuelva un resultado que distinga `registered | not-registered | unavailable` (por ejemplo `{ status: 'unavailable' }` cuando hay error de red o 5xx; 401/404 según cómo responde `/identity/me` para un usuario nuevo — verificar en `GetCurrentUserUseCase`).
- `auth/continue/page.tsx` y `onboarding/page.tsx`: si es `unavailable`, mostrar una pantalla de error ("No pudimos conectarnos con el servidor, reintentá") **sin** mandar al onboarding.
- Documentar en `README`/`.env.example` que `NEXT_PUBLIC_API_URL` en Vercel debe ser una URL pública del backend.

### Tarea 2 — Separar responsabilidades de las rutas
- `/login`: se queda igual (correo+contraseña + Google + link a `/onboarding`). Ajustar copy del footer.
- `/onboarding`: elimina el render de `AgroNexoAuthModal mode="signup"`. Siempre renderiza el wizard. Quitar `AuthMode 'signup'` de `AgroNexoAuthModal` si queda sin uso (o dejar solo login).
- `/register` sigue redirigiendo a `/onboarding`.
- Actualizar los `redirect`/links que asuman la pantalla vieja (`RegistrationWizard` link "Cambiar" hace logout con `returnTo=/onboarding`: sigue válido).

### Tarea 3 — Paso "Tu cuenta" dentro del wizard (`features/onboarding`)
- Nuevo paso 0 en el wizard **solo cuando no hay `account`**: botón "Continuar con Google" (`buildAuthUrl({ connection: 'google', signup: true })`, con `returnTo` a `/onboarding` para conservar `?type=`) + separador "o" + campos `email`, `password`, `passwordConfirm`.
- Agregar los tipos de campo necesarios en `config/types.ts` / `StepFields.tsx` (`kind: 'email'`, `kind: 'password'` con ver/ocultar) y validación en `lib/validation.ts` (formato de correo, fortaleza, coincidencia). El estado de credenciales **no** debe ir dentro de `buildRegisterRequest` (no se envía al backend).
- `useRegistrationWizard`: el orden pasa a cuenta → rol → datos. Con `account` el paso de cuenta se omite (`stepIndex` inicial y `totalSteps` deben ajustarse; hoy `initialKind` ya salta el rol, cuidar la combinación).
- Con `account.provider === 'google-oauth2'`: `email` solo lectura y sin campos de contraseña.
- Barra de progreso (`OnboardingHeader`) debe reflejar el paso extra.

### Tarea 4 — Endpoint de registro unificado (correo+contraseña)
- Nuevo route handler `app/api/auth/password/register/route.ts` (o extender `api/identity/register`) que recibe `{ email, password, profile }` y hace en orden: validar (`zod`) → `signupWithPassword` → `loginWithPassword` → `writePasswordSession` → `POST` al backend `/identity/register` con ese token.
- Idempotencia: si Auth0 responde `user_exists` pero el login con esa contraseña funciona **y** el usuario no tiene perfil, continuar con el registro del perfil en vez de fallar (cubre el caso de reintento tras un fallo del backend). Si la contraseña no coincide → mensaje "Ya existe una cuenta con ese correo. Iniciá sesión."
- Si el backend falla después de crear el usuario en Auth0: dejar la sesión iniciada y devolver el error; el reintento del wizard usa el camino de "con sesión" (`registerWithSession`).
- `api/auth/password/signup/route.ts` queda sin uso: eliminarlo junto con `signupWithPassword` solo si nada más lo llama (buscar referencias).
- Mantener el resto: rate-limit por IP (`clientIpFrom`), sin loguear contraseñas.

### Tarea 5 — Verificación de correo
- Auth0 dashboard: activar Branding → Email Templates → *Verification Email* y un proveedor de email propio (el de prueba de Auth0 tiene límites); confirmar que `dbconnections/signup` dispara el mail.
- Google: `email_verified` ya es `true`, sin acción.
- Política a confirmar con el usuario antes de implementar el bloqueo: recomendado **permitir completar el onboarding pero limitar el acceso al dashboard hasta verificar** (o mostrar un banner persistente "Verificá tu correo"). Implementar:
  - Pantalla/`banner` "Revisá tu correo" con botón **Reenviar** → route handler que llama a la Management API de Auth0 (`POST /api/v2/jobs/verification-email`; requiere una app M2M con scope `update:users` y sus variables `AUTH0_MGMT_CLIENT_ID/SECRET` solo en servidor).
  - Botón "Ya verifiqué" que consulta el estado real (`GET /api/v2/users/{id}`), porque el claim `emailVerified` de la cookie `agronexo_session` queda viejo hasta un nuevo login.
- Si se quiere que el backend lo exija, agregar el claim `email_verified` al access token con una Auth0 Action y validarlo en una policy de la API (fuera de alcance salvo pedido).

### Tarea 6 — Datos que hoy no se guardan (informar, no implementar sin confirmar)
- El backend **no persiste el correo** del usuario: `RegisterUserUseCase` solo guarda `auth0UserId` (`sub`). Si se necesita para notificaciones/contacto, agregar `Email` a `Producer`/`Professional` (migración EF) tomándolo de un claim del access token (Action de Auth0) o de un campo validado. Preguntar antes.

### Tarea 7 — Copy y UX
- `COPY` de `AgroNexoAuthModal`: en `login`, "¿Todavía no tenés una cuenta? → Crear cuenta". Botón Google con texto "Continuar con Google" en ambos lados.
- Mensaje claro cuando alguien entra por login con Google/correo y aún no tiene perfil: en el wizard mostrar "Ya casi: completá tu perfil" (hoy no se explica por qué apareció el formulario).
- Manejar `?error=` que vuelve de Auth0 (`access_denied` ya existe).

## 4. Criterios de aceptación

1. Desde `/login`, "Crear cuenta" lleva a **un solo** flujo; no se ve dos veces el formulario de correo/contraseña.
2. Registro con correo: cuenta → rol → datos → enviar; recién ahí se crea el usuario en Auth0 y el perfil en el backend. Abandonar antes de enviar no deja usuario en Auth0.
3. Contraseña y "Repetir contraseña" deben coincidir; errores visibles por campo.
4. Registro con Google: vuelve autenticado, nombre/apellido/correo cargados (correo bloqueado), sin pedir contraseña; solo faltan los datos restantes.
5. Usuario ya registrado (correo o Google) que inicia sesión llega a `/dashboard` y no ve el onboarding.
6. Con el backend caído no se manda a nadie al onboarding: aparece un error de conexión.
7. Registro por correo dispara el mail de verificación y la app refleja el estado (banner/reenvío).
8. `npm run lint` y `npm run build` del frontend pasan; probar en móvil (375px) y escritorio con el navegador integrado.

## 5. Cómo probar

- Local con `.env` de Auth0 y backend en Docker (`docker compose up`), frontend `npm run dev` con `NEXT_PUBLIC_API_URL=http://localhost:5000`.
- En Vercel: túnel público al backend y variables de la sección 1.
- Casos: correo nuevo, correo existente sin perfil, correo existente con perfil, Google nuevo, Google existente, backend apagado, contraseña débil, contraseñas distintas.

## 6. Estado de implementación y pendientes (2026-09-26)

### Referencia: cómo lo resuelven otras apps
Notion, Airbnb, Spotify y Stripe comparten el patrón: **login y registro son entradas distintas**; con Google el formulario de registro llega con nombre/apellido/correo ya cargados (y sin contraseña); con correo se pide contraseña repetida y se verifica el correo. La cuenta se crea al final, no al principio. Es lo que quedó implementado.

### Hecho
| Tarea | Resultado | Archivos principales |
|---|---|---|
| 1 | `fetchCurrentUser` devuelve `registered / not-registered / unavailable`; backend caído muestra pantalla de error y no manda al onboarding | `core/auth/server.ts`, `app/auth/continue/page.tsx`, `features/auth/components/BackendUnavailable.tsx` |
| 2 | `/onboarding` siempre es el wizard; `AgroNexoAuthModal` es solo login | `app/(public)/onboarding/page.tsx`, `features/auth/components/AgroNexoAuthModal.tsx` |
| 3 | Paso "Tu cuenta" (Google o correo + contraseña + repetir) al inicio del wizard cuando no hay sesión; con sesión se omite y se prellenan nombre/apellido/correo (correo solo lectura) | `features/onboarding/{config/account.ts,components/AccountStep.tsx,components/PasswordField.tsx,hooks/useRegistrationWizard.ts,lib/validation.ts}` |
| 4 | Registro unificado: Auth0 signup → login → perfil en backend, idempotente ante reintentos. Se eliminó `/api/auth/password/signup` | `app/api/auth/password/register/route.ts`, `core/auth/backend.ts`, `core/services/identity.service.ts` |
| 5 (lógica) | Reenviar mail y consultar `email_verified` por Management API; se desactiva solo si faltan las variables | `core/auth/auth0-management.ts`, `app/api/auth/verify-email/route.ts` |
| 7 | Copy "Crear cuenta", errores de Auth0 visibles en el login | `AgroNexoAuthModal.tsx` |
| — | Popup de Google | `core/auth/google-sign-in.ts`, `app/auth/popup-complete/`, `ui/components/GoogleButton.tsx` |

Tests nuevos: `tests/unit/onboarding-account.test.ts` (validación de cuenta, contraseñas, `safeReturnTo`).

### Actualización (2026-09-28)
- **Tarea 6 (correo en backend) — hecha.** `Producer`/`Professional` ahora tienen `Email` (nullable, sin índice único). El frontend lo manda como campo normal del body de `/identity/register` (no se extrae de un claim de Auth0 — hubiera requerido una Auth0 Action; se optó por el camino simple). Migración `AddEmailToProducerAndProfessional` generada y **aplicada** contra la base de Docker.
- **Banner de verificación — hecho.** `ui/components/VerificationBanner.tsx`, montado en `/welcome`. Verde si `emailVerified`, rojo con "Reenviar mail"/"Ya verifiqué" si no, oculto si entró por Google o si la Management API no está configurada. Depende de `AUTH0_MGMT_CLIENT_ID/SECRET` (pendiente, ver más abajo).
- **Bug encontrado y arreglado probando el popup:** `PopupComplete.tsx` cerraba `window` sin chequear que fuera un popup real (`window.opener`); en el camino de fallback (sin `BroadcastChannel`, o popup bloqueado) cerraba la pestaña principal del usuario en vez de solo redirigir. Corregido: `window.close()` ahora solo se llama si `window.opener` existe.
- **Bloqueador externo duro:** el tenant de Auth0 configurado en `.env.local` (`agroconnect-dev.us.auth0.com`) devuelve 404 en `/.well-known/openid-configuration` — no existe o está inalcanzable. Bloquea TODO login real (Google, correo, mail de verificación) hasta que se resuelva desde el dashboard de Auth0.

### Actualización (2026-09-29): login/registro por correo migrado a Authorization Code
Auth0 bloquea el "Resource Owner Password Grant" a nivel de plataforma para tenants nuevos: la casilla
"Password" en Grant Types del dashboard queda marcable pero no tiene efecto real — devuelve
`access_denied` siempre, con cualquier configuración. Confirmado con `curl` directo contra `/oauth/token`,
probando con y sin `audience`, con un usuario recién creado y contraseña válida en el primer intento, y
descartando Suspicious IP Throttling, Brute-force Protection, Default Directory, RBAC y el método de
autenticación del cliente como causa.

Se cambió el login y registro por correo para que usen el mismo mecanismo de popup que Google
(`core/auth/google-sign-in.ts`, ahora con `startEmailSignIn`), contra la pantalla hosteada de Auth0 con
`login_hint`/`screen_hint=signup`, en vez de intercambiar credenciales directo desde el servidor. Se
eliminaron `app/api/auth/password/{login,register}` y `loginWithPassword`/`signupWithPassword` de
`auth0-password.ts` (quedó `requestPasswordReset`, que no depende de ese grant). El paso "Tu cuenta" del
wizard (`AccountStep.tsx`) ya no pide ni valida contraseña, solo el correo.

Bug encontrado en el camino: `AccountStep` tenía un `<form>` propio anidado dentro del `<form>` del
wizard — HTML inválido; el submit del botón de correo terminaba disparando el `onSubmit` del wizard en
vez del propio. Corregido usando un botón `type="button"` en vez de un segundo `<form>`.

Verificado en el navegador con la Auth0 real: el flujo llega a `/api/auth/login?...&screen_hint=signup&login_hint=...` con 302 hacia Auth0, igual que Google.

Nota de seguridad: durante el diagnóstico se puso "Suspicious IP Throttling" en modo Monitoring (no
bloquea) para poder probar — **falta volverlo a "Active" antes de producción** (Security → Attack
Protection en el dashboard de Auth0). Brute-force Protection se reactivó.

### Pendiente / decisiones
1. **Contraseña con Google.** Hoy Google no pide contraseña. Si se quiere que igual cree una, hay que enlazar una identidad de base de datos a la cuenta de Google en Auth0 (Management API, account linking): es otro alcance.
2. **UI de verificación de correo.** El dashboard es un placeholder (`return null`), así que no hay dónde montar el banner "Verificá tu correo" / "Reenviar" / "Ya verifiqué". La lógica y las rutas están listas; falta el componente cuando exista el layout autenticado. Falta definir política: bloquear el dashboard hasta verificar, o solo avisar.
3. **Configuración externa (sin esto no se ve el efecto):** Auth0 → email provider propio y plantilla *Verification Email*; app M2M con `read:users` + `update:users` y `AUTH0_MGMT_CLIENT_ID/SECRET`; OAuth Client propio de Google Cloud (para que diga "Ir a AgroNexo"); Vercel con `NEXT_PUBLIC_API_URL` público y Allowed Callback/Logout URLs.
4. **Tarea 6:** el backend no guarda el correo del usuario; agregar `Email` a `Producer`/`Professional` requiere migración: pendiente de confirmar.
5. **Sin probar contra Auth0/Google reales:** el popup, el registro por correo y el mail de verificación necesitan un tenant con credenciales; verificados solo por tipos, lint, unit tests y build.
6. Deuda previa que no se tocó por UI-freeze: `AgroNexoAuthModal` y `welcome` usan hex sueltos; `tests/unit/alias-resolution` y `toolchain-challenge` ya fallaban antes de estos cambios.
