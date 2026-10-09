# Auditoría UX/UI · Flujo de match (productor → profesional)

Fecha: 2026-10-08 · Rama: `feat/match-discovery-assisted-search`

**Qué se revisó:** `features/match-discovery` (búsqueda asistida, resultados, ficha, diálogo de envío), `features/matches` (pedidos), `ui/components` (Badge, Button, Card, Avatar, NeedBriefCard), `app/globals.css`.
**Fuentes de verdad:** artifact *AgroNexo Brand Board* (v1.0, oct 2026), artifacts *Búsqueda asistida* y *Búsqueda de profesionales*, `ia/agent.md` §3.1, y como referencia de calidad las pantallas de login y registro ya hechas.

> Nota de método: no hay entrevistas ni tests con usuarios. Las secciones de investigación son **heurísticas e hipótesis** que salen del código, los artifacts y el contexto del sector. Están para validarse, no son hallazgos de campo.

---

## 0. Resumen ejecutivo

El flujo está bien armado: la IA interpreta el pedido, explica "por qué aparece" cada profesional, deja corregir lo que entendió y genera la ficha que recibe el profesional. Los componentes salen del kit shadcn y usan los tokens. Los problemas son cuatro:

| # | Problema | Severidad |
|---|---|---|
| 1 | **Los badges `success`/`warning` no llegan a AA**: 2,96:1 y 2,86:1. Son "Encaja", "Podría encajar", "Matrícula verificada" y "Escuchando". | 🔴 Crítico |
| 2 | **Después de enviar no hay confirmación.** El diálogo se cierra y nada más. En celular la ficha ya estaba cerrada, así que solo aparece un caption de 12 px en la lista. `Toast.tsx` sigue en `TODO`. | 🔴 Crítico |
| 3 | **Desde la búsqueda no se llega a "Mis pedidos".** El header de `match-discovery` no tiene navegación y `/matches` usa otro header ("Volver" + Salir). | 🔴 Crítico |
| 4 | **Faltan señales de confianza en la lista y en el CTA.** Matrícula, distancia y cupo solo están en la ficha. Junto a "Solicitar match" no se explica qué pasa después (plazo, teléfono, WhatsApp). Y se puede pedir match a alguien "Sin cupo". | 🟠 Alto |

---

## 1. Contradicciones de diseño detectadas (necesitan decisión tuya)

| # | Tema | Brand Board | Artifacts | Código actual | Recomendación |
|---|---|---|---|---|---|
| C1 | **Color de los tags de estado** | Verificado = tinte oliva + texto `#3F4C26`; Pendiente = tinte neutral-warm + texto Pine; Rechazado = terracota. "Terracota solo para error o rechazo". | *Asistida*: `positive = bg-olive/12 text-pine`, `alert = bg-neutral-warm/20 text-dark` (igual que el board) | `success` green-600 `#16a34a`, `warning` amber-600 `#d97706` (de ss-components, según tu regla de marca) | Mantener verde/naranja/rojo como decidiste, pero **oscurecer el texto** (green-700/800, amber-700/800) para pasar AA. Después **actualizar el Brand Board**, porque hoy dice otra cosa. Si preferís la paleta del board, la combinación oliva/neutral ya pasa (7,4:1 y 11,6:1). |
| C2 | **Fondo de producto** | "Beige: fondo principal" | *Asistida* lo marca como "propuesta de extensión": `paper #fbfbf8` + `surface #fff` | `bg-paper` + cards blancas | Va con tu regla ("nada de crema plano"). Hay que **documentar `paper`/`surface` en el board**, que hoy no los tiene. |
| C3 | **Layout de resultados** | — | *Búsqueda de profesionales*: **grilla de cards** con rating, precio, cobertura y disponibilidad. *Asistida*: **lista + ficha lateral** | Lista + ficha lateral (sigue a *Asistida*) | Para la búsqueda por IA conviene quedarse con lista + ficha, porque la explicación pesa más que comparar. **Pero hay que enriquecer la fila** con lo que traía la card de la grilla (ver §3.2). La grilla queda para "Buscar con filtros". |
| C4 | **Card** | Card simple: radio 16, borde hairline Pine 12 %, sin bisel | Double-bezel 22/16 (Taste Skill) | `Card` con double-bezel; `ResultItem` y el estado vacío **no** lo usan | Elegir una. Mi recomendación: **bisel solo en contenedores protagonistas** (ficha, diálogo, prompt) y **card plana del board en las filas de lista**. Agregarlo al board. |
| C5 | **Foco de inputs** | Borde Pine 1,5 px + halo Pine 12 % | — | `ring-ring/50` (≈3,1:1) | Mantener el código: el halo al 12 % del board no cumple WCAG 1.4.11. **Corregir el board.** |
| C6 | **Botones** | 38 px, radio 12, secundario con borde Pine 40 % | CTA "button-in-button" con flecha en círculo | 44/48 px, radio 12, `outline` con borde `--border` (Pine 12 %) | Alturas: mantener el código (más táctil, 44 px). El **borde outline al 12 % se pierde sobre blanco (1,21:1)**. Subirlo al 40 % como en el board. |
| C7 | **Hover del primario** | No está definido | — | `hover:bg-primary/80`: *aclara* el Pine | Existe `--color-pine-hover #002617` y no se usa. El hover tiene que **oscurecer**, no lavar el color (ver §3.3). |
| C8 | **Label del prompt** | — | *Asistida*: label visible "Describilo con tus palabras" | Label `sr-only` | Mostrar un label o una ayuda visible (ver §2.1). |

---

## 2. Investigación y síntesis (`user-research` + `research-synthesis`)

### 2.1 Fricción cognitiva por etapa

**Etapa 1 · Búsqueda asistida** (`SearchHero`, `PromptBox`, `SearchingState`)

| Fricción | Evidencia en el código | Impacto |
|---|---|---|
| Página en blanco: no se sabe qué conviene contar | La ayuda útil ("cultivo o hectáreas y para cuándo", `PromptBox.tsx:15`) queda en `sr-only` hasta que el texto es muy corto. | Llegan pedidos pobres, la IA entiende menos y los resultados encajan peor |
| El dictado casi no se ve | Botón de ícono `ghost` sin texto (`PromptBox.tsx:105`). El productor usa audios de WhatsApp todos los días: es la entrada natural. | Se pierde el canal de menor esfuerzo |
| Sin salida para quien no quiere escribir | *Asistida* tenía "Buscar con filtros"; en el código no está | Abandono |
| Badge "Búsqueda asistida" | Es una etiqueta del producto, no del usuario. *Asistida* usaba "Profesionales con matrícula verificada". | Se pierde la primera señal de confianza |
| "Ctrl o ⌘ + Enter" | Aparece en la ayuda también en celular | Ruido en mobile |
| El progreso es falso y se pierde el contexto | `SearchingState` avanza cada 350 ms sin relación con el backend y oculta lo que se escribió | Si el backend tarda, se queda pulsando en el último paso. Si es rápido, parpadea. |

**Etapa 2 · Resultados y fichas** (`NeedSummary`, `ResultsSection`, `ResultItem`, `ProfessionalDetail`)

| Fricción | Evidencia | Impacto |
|---|---|---|
| **Comparar obliga a abrir cada ficha** | `ResultItem` muestra profesión, nombre, fit y porqué. Matrícula, distancia y cupo solo están en el detalle. En celular eso es abrir y cerrar un sheet por cada profesional. | Carga de memoria y abandono en mobile |
| Chips con comportamiento distinto | Los temas tienen ✕. Zona, actividad, ha y urgencia no se pueden quitar ni editar. La profesión es otro control aparte (ToggleGroup) debajo. | El usuario no sabe qué puede corregir |
| La voz cambia de persona | "Encontremos" y "Contalo" (nosotros) contra "Entendí", "No pude ubicar… busqué" (yo) | Rompe el tono "Equipo" de la marca |
| "Ordenados por afinidad" sin explicar | No dice qué es la afinidad | Desconfianza en el ranking ("¿me están vendiendo a alguien?") |
| Reputación ausente | `MatchRecommendation` no trae rating, reseñas ni matches concretados (falta en el backend) | El brief pide reputación. Hoy solo están años y matrícula. |
| "Falta validar" como texto corrido | `missing.join('; ')` en minúscula (`ProfessionalDetail.tsx:115`) | Cuesta escanearlo |
| CTA sin consecuencia | "Solicitar match" sin texto al lado sobre qué pasa después | Miedo a comprometerse ("¿me van a cobrar?", "¿le doy mi teléfono?") |
| Se puede pedir match "Sin cupo" | La ficha muestra "Sin cupo por ahora" y el CTA sigue activo | Pedido que el profesional no puede tomar: frustración en las dos puntas |
| En laptops bajas el CTA queda abajo | Ficha `sticky top-24` sin `max-height` | El CTA queda fuera de la pantalla |

**Etapa 3 · Confirmación y envío** (`MatchRequestDialog`, `NeedBriefCard`)

| Fricción | Evidencia | Impacto |
|---|---|---|
| **Sin feedback de éxito** | `send()` → `onSent` + `onClose` (`MatchRequestDialog.tsx:79-82`) | El usuario no está seguro de haber enviado y repite o abandona |
| El mismo texto aparece dos veces | `NeedBriefCard` (vista previa) + `Textarea` con el mismo `summary` | El diálogo es muy alto: en celular hay scroll dentro de un 90dvh |
| Jerga | "Texto de la ficha", "match" | El productor no sabe qué es una "ficha" |
| Datos estructurados que no se corrigen | Actividad, ha y urgencia salen de la IA y en el diálogo no se pueden cambiar (*Asistida* tenía segmentados) | Si la IA se equivocó con las hectáreas, se envía mal |
| Estado de envío mudo | El botón sigue diciendo "Enviar solicitud" con spinner | No se anuncia "Enviando…" |
| `conflict` se trata en silencio como enviado | `MatchRequestDialog.tsx:79` | El usuario no se entera de que ya lo había pedido |
| En celular se pierde el contexto | Sheet → se cierra → Dialog → se cierra → lista | Termina en la lista sin saber qué pasó |

**Después del envío · `/matches`**

- No hay navegación de ida y vuelta con la búsqueda (ver crítico #3).
- El productor ve "Aceptado" sin una acción siguiente (contacto, dashboard).
- El estado vacío del productor no tiene botón para ir a buscar.

### 2.2 Heurísticas a priorizar para el usuario agro (hipótesis)

1. **Verificabilidad antes que estética.** En el campo la confianza se arma con referencias: matrícula del colegio, "trabaja con gente de mi zona", "lo conoce el vecino". La matrícula (con número), la zona y la experiencia tienen que verse **en la fila**, no solo en el detalle.
2. **Costo de equivocarse explícito.** Hay que decir que pedir match es gratis, que no compromete, que el teléfono se comparte solo si acepta y que tiene 48 h para responder. Esto ya está en los artifacts y se perdió en el código.
3. **Cercanía física = relevancia.** La distancia en km y "Cubre tu zona" importan más que cualquier puntaje abstracto.
4. **Entrada por voz como en WhatsApp.** El dictado tiene que ser una opción de primer nivel, con texto.
5. **Transparencia del algoritmo.** "Por qué aparece" es el mejor activo del flujo. Hay que sumarle "cómo ordenamos" en una línea.
6. **Honestidad con lo nuevo.** Sin reseñas, mostrar "Nuevo en AgroNexo" y no esconderlo (lo hacía *Asistida*).
7. **Cierre del ciclo.** Toda acción importante termina con un estado claro y un próximo paso: aviso por WhatsApp y dónde ver la respuesta.

**Para validar con 5–6 productores (test moderado, 30 min):** (a) ¿qué escriben sin ayuda?, (b) ¿con qué dato de la fila eligen a quién abrir?, (c) ¿entienden qué pasa al tocar "Solicitar match"?, (d) ¿encuentran después el pedido enviado?

---

## 3. Crítica de diseño y sistema (`design-critique` + `design-system`)

### 3.1 Layout, jerarquía, spacing, densidad

**Búsqueda**
- ✅ Buena jerarquía: titular `text-display`, prompt protagonista, ejemplos que completan el campo sin buscar.
- ⚠️ El prompt (`max-w-[560px]`) es angosto al lado de un titular de 14ch a 72 px. *Asistida* usaba 760. Probar 640–680 para que el campo pese visualmente como el titular.
- ⚠️ Los saltos verticales no siguen la escala del board (4/8/12/16/24/32/48/64): `mt-5`=20, `mt-10`=40, `pt-10`=40. Usar 24/32/48.
- ⚠️ El pie "Los profesionales con matrícula verificada aparecen primero" queda chico y lejos (`mt-10`). Subirlo como badge de confianza y sacar "Búsqueda asistida".

**Resultados**
- ✅ El split 380 px / ficha sticky funciona en desktop.
- ⚠️ La fila tiene poca densidad: rol, nombre, fit y dos líneas. Falta una **fila de metadatos** (ícono matrícula · distancia · cupo) en `text-caption`, que no hace más alta la card.
- ⚠️ `NeedSummary` usa tres niveles ("Buscaste" + cita `heading-md`, chips "Entendí", ToggleGroup) y le roba altura a los resultados. La cita va en `text-body-lg` con `line-clamp-2`, y la profesión como **primer chip** (o el ToggleGroup en la misma fila).
- ⚠️ Avatar `lg` de 48 px + `heading-lg` de 30 px en la ficha: el nombre compite con "Por qué aparece", que es lo que convence. Bajarlo a `heading-md`.

**Diálogo**
- ⚠️ Es demasiado alto por la duplicación vista previa + textarea. Propuesta: **vista previa editable**, con `NeedBriefCard` y un botón "Editar mensaje" que cambia el párrafo por un `Textarea` en el mismo lugar.
- ⚠️ Falta el bloque de confianza con candado que tenía *Asistida*: "Tiene 48 h para aceptar. Tu teléfono se comparte recién cuando acepta".

**Microinteracciones**
- ✅ `motion/react` entre fases y respeta `useReducedMotion`.
- ❌ El envío no tiene transición de éxito. Propuesta: el diálogo pasa a un estado "Enviada" con check animado (scale 0.8→1, 200 ms) y se cierra solo, o bien un toast persistente con acción.
- ⚠️ La selección de una fila no anima el cambio de ficha. Un fade corto (`key` + `motion`) ayuda a notar el cambio.
- ⚠️ `transition-all` en `ResultItem`: usar `transition-[border-color,box-shadow]`.

### 3.2 Coherencia con el Brand Board

| Token / patrón | Estado | Detalle |
|---|---|---|
| Tipografía Geist / Geist Mono para cifras | ✅ | Bien usado en ha, años, cupos y conteo |
| Escala tipográfica | ✅ | `text-heading-*`, `text-body*`, `text-caption` |
| Paleta Pine/Oliva | ✅ | Bien |
| Tags de estado | ❌ | C1 + contraste (§4) |
| Radios | ⚠️ | 12 / 16 / pill están bien. **`rounded-[22px]` está hardcodeado 4 veces** (`Card`, `PromptBox`, `SheetContent`, `MatchRequestsEmpty`): crear `--radius-shell: 22px` |
| Tintes | ⚠️ | `bg-pine/[0.035]`, `ring-pine/8`, `border-pine/10`, `border-pine/25`, `border-pine/30`, `bg-olive/12`, `bg-neutral-warm/10` repartidos por todos lados. Hacen falta tokens semánticos: `--surface-sunken`, `--border-strong`, `--fill-positive`, `--fill-caution` |
| Sombras | ✅ | `shadow-raised` es un token; no hay `shadow-md/lg` |
| Iconos | ✅ | Phosphor regular (no Lucide), como pide agent.md |
| Botón outline | ❌ | Borde al 12 %, ver C6 |

### 3.3 Estados interactivos de botones

| Estado | Hoy | Propuesta |
|---|---|---|
| default | `bg-primary` | = |
| hover | `bg-primary/80` (aclara) | `hover:bg-pine-hover` en primario; en outline, `hover:bg-secondary` |
| focus | `ring-3 ring-ring/50` ✅ | = |
| active | `translate-y-px` ✅ | = |
| disabled | `opacity-50` | = (WCAG exime los disabled), pero en el CTA principal sumar la razón visible (ya existe la ayuda "Escribí al menos…") |
| **loading** | Se arma a mano en 3 lugares (`Spinner` + `disabled`) | **Agregar `loading` prop a `Button`**: `aria-busy`, spinner `inline-start`, `disabled`, y texto opcional `loadingText` |

### 3.4 Componentes a modularizar

| Nuevo / refactor | Sale de | Uso |
|---|---|---|
| `ProfessionalSummary` (identidad: avatar + rol + nombre + fit) | `ResultItem`, `ProfessionalDetail` (header duplicado) | Fila, ficha, diálogo, `/matches` |
| `ProfessionalMeta` (matrícula · distancia · cupo · años) | `ProfessionalDetail` `<dl>` | Fila (compacto) y ficha (completo) |
| `ReasonList` (checks ✓ + "Falta validar") | `ProfessionalDetail:101-117` | Ficha; a futuro, perfil |
| `StatusNote` (aviso con borde punteado + ícono) | "Solicitud enviada" en ficha y fila | Ficha, fila, `/matches` |
| `TrustNote` (candado + 48 h + teléfono) | No existe (estaba en *Asistida*) | Detalle bajo el CTA, diálogo |
| `EmptyState` | `ResultsSection:98`, `MatchRequestsEmpty` (dos estilos distintos) | Todo vacío. Usar `Empty` de shadcn |
| `AppHeader` con nav | `MatchDiscoveryHeader` + header de `/matches` | Todas las pantallas autenticadas |
| `Avatar` único | `Avatar.tsx` (custom) + `AvatarShadcn.tsx` | Consolidar en el de shadcn con variantes `tone` |
| `Button loading` | 3 lugares | Global |

---

## 4. Accesibilidad WCAG 2.1 AA (`accessibility-review`)

### 4.1 Contraste (medido)

| Par | Ratio | Mínimo | Estado |
|---|---|---|---|
| Badge `success` (green-600 sobre tinte 10 %) | **2,96** | 4,5 (texto 12 px) | ❌ |
| Badge `warning` (amber-600 sobre tinte 10 %) | **2,86** | 4,5 | ❌ |
| Badge `destructive` (`#8C4A34`) | 5,78 | 4,5 | ✅ |
| Badge `secondary` (Pine sobre Pine 8 %) | 12,41 | 4,5 | ✅ |
| Olive sobre paper / blanco / beige | 5,88 / 6,09 / 5,70 | 4,5 | ✅ |
| Neutral-warm sobre blanco (ícono / borde de input) | 3,45 | 3 (no texto) | ✅ justo |
| Borde outline / card Pine 10–12 % sobre blanco | 1,21 | 3 si es el único indicador del control | ❌ en botón outline |
| Halo de foco Pine 50 % | 3,09 | 3 | ✅ |
| Badge del board "Verificado" | 7,39 | 4,5 | ✅ |
| **Fix propuesto: green-700 / amber-700** | 4,50 / 4,50 | 4,5 | ✅ al límite |
| **Fix propuesto: green-800 / amber-800** | 6,40 / 6,36 | 4,5 | ✅ recomendado |

### 4.2 Teclado, foco y semántica

| # | Problema | Criterio | Fix |
|---|---|---|---|
| A1 | `ResultItem` es un `<button>` con un `<h3>` adentro: el heading se aplana y la navegación por headings se pierde | 1.3.1 | `<article>` con `<h3>` + botón "Ver ficha" con `after:absolute after:inset-0` (patrón stretched), o un `Item` de shadcn |
| A2 | `aria-current="true"` para la selección | 4.1.2 | `aria-pressed` en el botón, o `aria-controls="professional-detail"` + región `aria-live="polite"` en el header de la ficha |
| A3 | En desktop, cambiar la ficha no se anuncia | 4.1.3 | `<section id="professional-detail" aria-live="polite" aria-labelledby=…>` |
| A4 | El "01" de posición se lee como "cero uno" | 1.3.1 | `aria-hidden` (el `<ol>` ya da la posición) |
| A5 | `aria-invalid={!canSend}` mientras la IA está redactando: se anuncia como inválido sin que el usuario haya tocado nada | 3.3.1 | `aria-invalid` solo si `touched && !valid`; `aria-busy={composing}` |
| A6 | Envío sin anuncio | 4.1.3 | `loadingText="Enviando…"` + región `role="status"` con "Solicitud enviada a {nombre}" |
| A7 | ✕ de chips de 28 px | 2.5.5 (AAA) / meta propia de 44 | Área táctil de 44 con pseudo-elemento sin cambiar el tamaño visual |
| A8 | Ayuda con `line-clamp-2` puede cortar el texto dictado provisorio | 1.4.10 | Quitar el clamp cuando está escuchando |
| A9 | `SheetTitle` en `sr-only`: el sheet no tiene un título visible | 2.4.6 | Título visible (el nombre ya está en la ficha: usarlo como `SheetTitle` real) |
| A10 | En celular, cerrar el diálogo devuelve el foco a un trigger que ya no está montado (el sheet se cerró) | 2.4.3 | Reabrir el sheet al cerrar el diálogo o mover el foco a la fila del profesional |
| ✅ | Botón "Buscar" `focusableWhenDisabled` + `aria-describedby`, `role="alert"` en errores, labels "Quitar {tema}", `aria-label` del dictado, `role="status"` en "Escuchando", `prefers-reduced-motion` | — | Bien resuelto |

---

## 5. UX copy (`ux-copy`)

Voz AgroNexo: **"nosotros" de equipo, voseo, frases cortas, sin jerga técnica ni de app.**

| Dónde | Actual | Propuesta | Por qué |
|---|---|---|---|
| Badge del hero | Búsqueda asistida | Profesionales con matrícula verificada | Confianza antes que una etiqueta de feature |
| Subtítulo | ¿Qué necesitás? Contalo como se lo dirías a un vecino. | Contalo como se lo dirías a un vecino. Te mostramos quién encaja y por qué. | Promete el beneficio: la explicación |
| Ayuda visible bajo el prompt | (oculta) | Sumá qué hacés, cuántas hectáreas y para cuándo. | Guía sin forzar un formulario |
| Placeholder | Ej.: necesito un contador que sepa de retenciones de granos. Tengo 350 ha de soja. | = ✅ | Concreto y local |
| Botón dictado | (ícono) | Dictar | Primer nivel, como un audio |
| CTA búsqueda | Buscar | Buscar profesionales | Dice qué se obtiene |
| Ejemplos | Probá con: | Por ejemplo: | Más neutro |
| Progreso | Entendiendo tu pedido / Buscando profesionales en tu zona / Ordenando por afinidad | Leyendo tu pedido / Buscando cerca de {lugar} / Ordenando por quién encaja mejor | Concreto y sin "afinidad" |
| Encabezado de chips | Entendí | Entendimos | Voz "nosotros" |
| Lugar no ubicado | No pude ubicar "X": busqué cerca de tu campo. | No encontramos "X" en el mapa. Buscamos cerca de tu campo. | Voz "nosotros"; aclara qué falló |
| Conteo | 5 profesionales, ordenados por afinidad | 5 profesionales · primero los que mejor encajan [¿Cómo ordenamos?] | Quita la jerga y abre la explicación |
| Vacío | No encontramos profesionales para esto en tu zona | Todavía no hay profesionales para esto cerca de {lugar} | "Todavía" baja la frustración + botones: "Incluir atención remota", "Cambiar profesión" |
| Falta validar | Falta validar: su especialidad no menciona…; su matrícula… | **Para consultarle:** (lista con viñetas, mayúscula inicial) | Lo pone como acción del productor, no como defecto |
| Cupo | Sin cupo por ahora | Sin lugar para clientes nuevos por ahora | Claro; + CTA desactivado "Avisarme cuando tenga lugar" (futuro) |
| CTA ficha | Solicitar match | Pedir match | Más directo |
| Bajo el CTA | — | Es gratis y no te compromete. Tu teléfono se comparte solo si acepta. | Baja el costo percibido |
| Título del diálogo | Solicitar match con {nombre} | Pedile el match a {nombre} | Directo, segunda persona |
| Descripción del diálogo | Esto es lo que va a recibir {nombre}. Podés ajustar el texto antes de enviarlo; si acepta, el match queda activo y se abre el espacio de trabajo compartido. | Esto es lo que le va a llegar a {nombre}. Revisalo antes de enviarlo. | Corto; la consecuencia va al `TrustNote` |
| Label del textarea | Texto de la ficha | Mensaje para {nombre} | Sin jerga |
| Ayuda redactando | Redactando la ficha… | Estamos armando el mensaje con lo que contaste… | Voz "nosotros" |
| TrustNote del diálogo | — | Tiene 48 h para responder. Te avisamos por WhatsApp. | Cierra la expectativa |
| Botón pending | Enviar solicitud (+spinner) | Enviando… | Estado claro |
| **Éxito** | — | **Listo, le llegó tu pedido a {nombre}.** Te avisamos por WhatsApp cuando responda. [Ver mis pedidos] [Seguir buscando] | Cierre del ciclo |
| Conflict | (silencioso) | Ya le habías enviado un pedido a {nombre}. Está esperando respuesta. | Honesto |
| Error unavailable | No pudimos enviar la solicitud. Probá de nuevo en unos minutos. | = ✅ | — |
| Error invalid | La ficha no es válida. Revisá el texto e intentá de nuevo. | El mensaje tiene un problema. Revisalo y probá de nuevo. | Sin "ficha" |
| `/matches` productor | Los pedidos que enviaste y cómo respondió cada profesional. | = ✅ + estado vacío con [Buscar un profesional] | — |
| Rechazar (profesional) | No vas a poder deshacerlo. El productor va a ver que no aceptaste el pedido. | = ✅ | — |

> Consistencia de vocabulario: elegir **"pedido"** o **"solicitud"**. Hoy conviven "Solicitud enviada" (búsqueda) y "Pedidos de match" (`/matches`). Recomiendo **"pedido"**: más llano y ya está en `/matches`.

---

## 6. Handoff · checklist técnico (`design-handoff`)

### P0 · antes de mergear

- [ ] **`globals.css`**: tokens de texto de estado con AA.
  ```css
  --color-status-green: #16a34a;      /* tinte y punto */
  --color-status-green-ink: #166534;  /* texto: 6,4:1 sobre el tinte */
  --color-status-amber: #d97706;
  --color-status-amber-ink: #92400e;  /* texto: 6,4:1 */
  /* :root */
  --success-foreground: var(--color-status-green-ink);
  --warning-foreground: var(--color-status-amber-ink);
  /* @theme inline */
  --color-success-foreground: var(--success-foreground);
  --color-warning-foreground: var(--warning-foreground);
  ```
- [ ] **`Badge.tsx`**: `success: 'bg-success/10 text-success-foreground …'`, `warning: 'bg-warning/10 text-warning-foreground …'`. `BadgeDot` sigue en `bg-current`; si se quiere el punto más vivo, `[&>[data-slot=badge-dot]]:bg-success`.
- [ ] **Toast**: instalar `sonner` (shadcn), montar `<Toaster position="bottom-center" />` en el layout autenticado y borrar `ui/components/Toast.tsx` (TODO).
- [ ] **`MatchRequestDialog.tsx`**: agregar `stage: 'form' | 'sent'`. En `created`, pasar a `sent` (check + copy de éxito + [Ver mis pedidos] → `ROUTES.matches`, [Seguir buscando] → cerrar). En `conflict`, mostrar el mismo estado con el copy de "Ya le habías enviado…". Pasar `onSent` al cerrar.
- [ ] **`AppHeader`** (nuevo en `ui/layouts/` o `shared/`): logo, nav `Buscar` / `Mis pedidos (n pendientes)` y menú de usuario de `MatchDiscoveryHeader`. Usarlo en `match-discovery` y en `/matches` (sacar "Volver" + `LogoutButton`).
- [ ] **`ProfessionalDetail.tsx`**: si `!hasCapacity(r)`, CTA `disabled` + nota "Sin lugar para clientes nuevos por ahora". Agregar `TrustNote` bajo el CTA.

### P1 · confianza y comparación

- [ ] **`ResultItem.tsx`**: reestructurar como `<article>` + botón stretched (A1). Sumar la fila de metadatos:
  ```tsx
  <ul className="text-caption text-olive mt-3 flex flex-wrap gap-x-4 gap-y-1">
    {r.isVerified && <li className="flex items-center gap-1"><SealCheckIcon size={14} aria-hidden />Matrícula verificada</li>}
    <li className="flex items-center gap-1"><MapPinIcon size={14} aria-hidden />{result.proximityShort}</li>
    <li className="font-mono">{r.yearsExperience} años</li>
  </ul>
  ```
  `aria-hidden` en el número de posición. `aria-pressed={selected}` + `aria-controls="professional-detail"`. Cambiar "Solicitud enviada" por `<Badge variant="warning"><BadgeDot />Pedido enviado</Badge>`. Cambiar `transition-all` por `transition-[border-color,box-shadow]`.
- [ ] **`build-results.ts`**: agregar `proximityShort` ("A 12 km" / "Cubre tu zona") para la fila.
- [ ] **`ResultsSection.tsx`**: contenedor de la ficha con `id="professional-detail"` y `aria-live="polite"`; `max-h-[calc(100dvh-7rem)] overflow-y-auto` (o `ScrollArea`) con el CTA en un footer sticky. Vacío con `Empty` + acciones.
- [ ] **`NeedSummary.tsx`**: profesión como primer chip (o ToggleGroup en la misma fila); actividad, ha y urgencia removibles igual que los temas; "Entendí" → "Entendimos"; cita en `text-body-lg line-clamp-2`.
- [ ] **`MatchRequestDialog.tsx`**: vista previa editable (sin textarea duplicado); `aria-invalid` solo si `touched`; `aria-busy={composing}`; `TrustNote`; label "Mensaje para {nombre}"; chips editables de actividad / ha / urgencia (`ToggleGroup` segmented + `NumberField`, que ya existen).
- [ ] **`Button.tsx`**: prop `loading` + `loadingText`; hover del primario `hover:bg-pine-hover`; outline `border-pine/40`.
- [ ] **Mobile (`MatchDiscoveryScreen.tsx`)**: al cerrar el diálogo sin enviar, reabrir el sheet del mismo profesional (A10). Evaluar `Drawer` (vaul) para la ficha, con el pedido como segundo paso dentro del mismo drawer.

### P2 · sistema y pulido

- [ ] Token `--radius-shell: 22px` y reemplazar los 4 `rounded-[22px]`.
- [ ] Tokens semánticos de tinte (`--surface-sunken`, `--border-strong`, `--fill-positive`, `--fill-caution`) y reemplazar los `/[0.035]`, `/8`, `/10`, `/12`, `/25`, `/30`.
- [ ] Extraer `ProfessionalSummary`, `ProfessionalMeta`, `ReasonList`, `StatusNote`, `TrustNote` (§3.4).
- [ ] Consolidar `Avatar.tsx` en `AvatarShadcn`.
- [ ] `SearchHero`: badge de confianza arriba, ayuda visible, botón "Dictar" con texto, CTA "Buscar profesionales", prompt de 640–680 px, spacing en la escala del board.
- [ ] `SearchingState`: mostrar el pedido arriba, mínimo de 900 ms, el último paso queda en "pulse" sin marcarse como completo hasta que llegan los datos.
- [ ] `PromptBox`: mostrar "Ctrl/⌘ + Enter" solo con `(pointer: fine)` y con `Kbd`.
- [ ] Copy completo de §5 y unificar "pedido".
- [ ] **Brand Board**: actualizar con C1, C2, C4, C5, C6 (tags, paper/surface, bisel, foco, outline).
- [ ] **Backend** (fuera del front): sumar a `MatchRecommendation` `rating`, `reviewsCount`, `completedMatches` y `licenseNumber` para mostrar reputación y matrícula con número.

---

## 7. Componentes para que me pases (mini informe)

Ya tenemos: `Button`, `Badge`, `Card` (custom), `Dialog`, `Sheet`, `InputGroup`, `Textarea`, `ToggleGroup`, `Tooltip`, `DropdownMenu`, `Avatar` (×2), `Alert`, `Skeleton`, `Spinner`, `NumberField`, `Separator`, `Field`.

Buscá estos (shadcn, `npx shadcn view <nombre>` o la doc) y pasámelos tal cual. Los adapto solo a tokens:

| Prioridad | Componente | Para qué | Dónde reemplaza |
|---|---|---|---|
| P0 | **`sonner`** (Toast) | Confirmación de envío, errores no bloqueantes | `Toast.tsx` (TODO), éxito del diálogo |
| P0 | **`navigation-menu`** *o* **`tabs`** (variante line) | Nav del `AppHeader`: Buscar / Mis pedidos | `MatchDiscoveryHeader`, header de `/matches` |
| P1 | **`item`** (shadcn Item: `Item`, `ItemMedia`, `ItemContent`, `ItemTitle`, `ItemDescription`, `ItemActions`) | Filas de resultados y checks de "por qué aparece" | `ResultItem`, lista de checks, `ReasonList` |
| P1 | **`empty`** (shadcn Empty) | Estados vacíos coherentes | `ResultsSection` vacío, `MatchRequestsEmpty` |
| P1 | **`drawer`** (vaul) | Ficha + pedido en mobile con gesto de arrastre | `Sheet` bottom en `MatchDiscoveryScreen` |
| P1 | **`scroll-area`** | Ficha sticky con scroll propio y CTA fijo | Contenedor de la ficha en `ResultsSection` |
| P1 | **`card`** (shadcn oficial: `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`, `CardAction`) | Estructura semántica estándar; le pongo el bisel como variante | `ui/components/Card.tsx`, `NeedBriefCard` |
| P2 | **`hover-card`** *o* **`popover`** | "¿Cómo ordenamos?" junto al conteo | `ResultsSection` |
| P2 | **`collapsible`** | "Para consultarle" plegable en la ficha | `ProfessionalDetail` |
| P2 | **`kbd`** | Atajo Ctrl/⌘ + Enter | `PromptBox` |
| P2 | **`button-group`** | Acciones Pedir match + Guardar | `ProfessionalDetail` |
| P2 | **`progress`** *o* un stepper de reactbits/aceternity | Estado de búsqueda más honesto | `SearchingState` |

**No hace falta Breadcrumb:** el flujo es de una sola pantalla con fases, y el breadcrumb agrega ruido. La orientación la dan la nav del header y el botón "Editar búsqueda".
