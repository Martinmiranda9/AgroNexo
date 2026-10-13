# Plan de implementación · Espacio de trabajo por campo

2026-10-09 · Contexto y decisiones: `docs/research/despues-del-match.md`

## Qué se construye

1. Con el match aceptado, **cada parte ve el WhatsApp y el mail de la otra**. ✅ Hecho (ver Hito 0).
2. El productor crea un **campo** (nombre y breve descripción; el ID 200001… lo genera `Farm`). Lo puede crear cuando quiera, no depende de un match.
3. Desde el campo abre **"Invitar profesionales"**: una lista de los profesionales con los que tiene un **match aceptado**, con filtro por rol (agrónomo, contador, abogado…) y nombre, especialidad, matrícula, verificación y años de experiencia. Un clic y el profesional queda en el equipo.
4. Dentro del campo hay:
   - **General:** datos del campo, equipo con contactos, bitácora general. Lo ven el productor y todo el equipo.
   - **Una sección por profesional:** acuerdo, bitácora y documentos de ese profesional. **Privada entre ese profesional y el productor.** El abogado no ve la del contador.
5. **El productor ve todo.** El profesional puede irse cuando quiera, el productor lo puede desvincular y **solo el productor archiva el campo**.
6. Los lotes van dentro del campo (Hito 5).

Fuera de alcance por ahora: chat propio, espacios entre dos profesionales, cobro.

## Cómo trabajamos

- **Primero el backend de cada hito, con tests.** Se puede hacer sin esperar el diseño.
- **El frontend arranca cuando me pases el prompt de diseño y los componentes** (`npx shadcn@latest add …`). Los bajo exactos con `shadcn view` y solo adapto tokens. Para cada pantalla dejo abajo qué necesito.
- Cada hito termina con build y tests en verde, y la verificación en el navegador cuando haya pantalla.

---

## Hito 0 · Contacto en las dos direcciones ✅

- `MatchResponse.ProfessionalContact`: `GetMatchesUseCase` lo completa para el productor cuando el match está `Active`. Pendiente o rechazado no lo exponen, y nadie recibe su propio contacto.
- Frontend: `MatchRequestCard` muestra el `ContactCard` (WhatsApp, llamar, correo) también del lado del productor.
- Test: `GetMatches_AfterAccepting_BothSidesReceiveTheOthersContact`.

## Hito 1 · Backend del espacio y del equipo ✅

**Dominio**

- `Farm`: suma `Description` (opcional, hasta 500 caracteres) y `ArchivedAt` con `Archive()`. Un campo archivado queda en solo lectura y da de baja a todo el equipo.
- Entidad nueva `FarmMember` (no la acota ningún tenant, igual que `Match`):
  `Id, FarmId, ProfessionalId, MatchId, Status (Active | Left | Removed), JoinedAt, EndedAt`
  - `Leave()` la usa el profesional y `Remove()` el productor. Las dos cierran `EndedAt`.
  - Regla: no puede haber dos miembros activos para el mismo par (campo, profesional). Un profesional que se fue puede volver a ser invitado.
- Regla de invitación: hace falta un `Match` en estado `Active` entre `farm.ProducerId` y el profesional. Se valida en el caso de uso.

**Acceso: un único servicio, `IFarmAccessService`**

- `GetAccessAsync(farmId, auth0UserId)` devuelve `{ Farm, IsOwner, MemberId? }`. Si no hay acceso, **404** y no 403, para no revelar que el campo existe.
- El productor dueño lo ve todo. El miembro activo ve General y su propia sección. El profesional que se fue pierde el acceso.
- Para leer `Farm` desde otro tenant: `IFarmRepository.GetByIdAcrossTenantsAsync`, como ya hace `IProfessionalRepository`.

**API**

| Método | Ruta | Quién | Qué hace |
|---|---|---|---|
| POST / PUT | `/farms` (ya existe) | Productor | Suma `description` |
| POST | `/farms/{id}/archive` | Productor | Archiva el campo |
| GET | `/farms/{id}/candidates?role=` | Productor | Matches aceptados que todavía no están en el equipo: nombre, rol, especialidad, matrícula, verificado, años, `publicId` |
| POST | `/farms/{id}/members` `{ professionalId }` | Productor | Invita (alta directa) |
| DELETE | `/farms/{id}/members/{memberId}` | Productor | Desvincula |
| POST | `/farms/{id}/members/me/leave` | Profesional | Se va |
| GET | `/workspaces` | Los dos | Productor: sus campos. Profesional: los campos donde es miembro activo |
| GET | `/workspaces/{farmId}` | Los dos | Campo + equipo (con contacto de cada uno) + el rol de quien mira |

**Migración:** `AddFarmWorkspace` (dos columnas en `farms` y la tabla `farm_members`).

**Tests**

- Unitarios: reglas de `FarmMember` y de `Farm.Archive()`.
- Integración:
  - invitar sin match aceptado da 400;
  - un profesional de otro tenant ve el campo después de que lo invitan;
  - un profesional que no es miembro recibe 404;
  - después de `leave`, recibe 404;
  - un campo archivado no acepta invitaciones.

## Hito 2 · Frontend: campos, equipo e invitación (✅ todo menos la pantalla del campo)

**Rutas y pantallas**

| Ruta | Productor | Profesional |
|---|---|---|
| `/farms` (hecho) | Lista de sus campos + "Nuevo campo" | Campos donde participa |
| `/campos/nuevo` (o Drawer) | Nombre, descripción, hectáreas (opcional) | — |
| `/campos/[id]` | Encabezado + pestañas **General · una por profesional** | Encabezado + **General · Mi sección** |
| Drawer "Invitar profesionales" | Filtro por rol + lista + "Invitar" | — |

- **General (este hito):** datos del campo y el equipo, con una tarjeta por profesional que lleva `ContactCard`. La bitácora llega en el Hito 3.
- **Acciones:** "Desvincular" y "Archivar campo" (productor, con confirmación en `Dialog`) y "Dejar este campo" (profesional).
- **Navegación:** sumar "Campos" al `AppHeader` para los dos roles.
- **Atajo desde Mis solicitudes:** un match aceptado muestra "Sumar a un campo", que abre el mismo Drawer con el campo a elegir.
- **Estructura:** feature nueva `features/workspaces/` y acciones en `core/actions/` (`get-workspaces`, `create-farm`, `invite-member`…), con el mismo patrón de resultados `{ status: 'ok' | 'unauthorized' | … }` que usan los matches.

**Qué necesito de vos antes de arrancar**

1. **Prompt de diseño** de: lista de campos, pantalla del campo (encabezado y pestañas), tarjeta de miembro del equipo, Drawer de invitación con filtro y estado vacío.
2. **Componentes** que todavía no están en `ui/components`:
   - **Tabs**, para General y las secciones por profesional.
   - Algún **listado con filtro**, si querés otro distinto de `Item` + `ToggleGroup`, que ya existen.
   - Lo que el diseño pida para el encabezado del campo.

Ya existen y los reuso: `Drawer`, `Item`, `ToggleGroup`, `Badge`, `Empty`, `Card`, `ContactCard`, `Avatar`, `Field`, `Input`, `Textarea`, `NumberField`, `Dialog`, `Toaster`.

## Hito 3 · Bitácora general y secciones privadas

**Backend**

- Entidad `WorkspaceEntry`: `FarmId, AuthorType (Producer | Professional), AuthorId, MemberId? (null = General), Body (≤ 2000), CreatedAt`.
- `GET / POST /workspaces/{farmId}/entries?section=general|{memberId}`. `IFarmAccessService` valida que el que pide sea el dueño o el miembro de esa sección.
- El autor puede editar o borrar su entrada durante 15 minutos. Después queda fija, porque es un registro.

**Tests:** el contador no lee la sección del abogado (404). El productor lee todas. Un miembro que se fue no lee nada.

**Frontend:** la bitácora en General y en cada sección (lista cronológica + campo para escribir).

**Te voy a pedir:** prompt de diseño de la bitácora y, si lo querés, un componente de **timeline o feed**.

## Hito 4 · Acuerdo por profesional

- Value object `Agreement` dentro de `FarmMember`: `Scope, Frequency, Fee (texto), ProposedBy, ProposedAt, ConfirmedAt`. Lo propone una parte y la otra confirma. Si alguien lo edita, vuelve a quedar sin confirmar.
- Se muestra arriba de cada sección privada.
- El honorario se guarda como texto: no pasa por la plataforma (ver "Cómo cobrar").

## Hito 5 · Lo que viene después

- **Lotes y campañas** dentro del campo (`Lot`: nombre, hectáreas, cultivo, campaña "2026/27"). Las entradas de la bitácora se pueden etiquetar por lote.
- **Documentos** en General y en cada sección: hay que elegir dónde guardar los archivos (no hay nada armado todavía).
- **Avisos por correo** (invitación, nueva entrada): hay que elegir proveedor.
- **Reseñas** al salir del equipo y al cierre de cada campaña.
- Espacio "Mi empresa", espacios entre dos profesionales, avisos por WhatsApp y cobro.

## Riesgos y cosas a vigilar

- **Acceso entre tenants:** es la parte más delicada. Todo acceso al campo pasa por `IFarmAccessService` y tiene tests de que el miembro equivocado recibe 404.
- **`Farm` tiene un filtro global por tenant:** desde el lado del profesional hay que usar los métodos `AcrossTenants` de forma explícita y nunca desactivar el filtro de manera general.
- **Nombres:** en el código, `Farm` y `FarmMember`. En la interfaz, "Campo" y "Equipo". No usar "workspace" en la interfaz.
