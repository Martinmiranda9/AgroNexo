# Qué pasa después del match

Análisis de investigación de usuarios y plan de producto · 2026-10-09

## La pregunta

Cuando el profesional acepta la solicitud, ¿qué sigue? Hay tres caminos posibles:

| | A. Todo afuera | B. Espacio de trabajo + WhatsApp | C. Todo adentro |
|---|---|---|---|
| Conversación | WhatsApp / teléfono | WhatsApp, con enlace prellenado | Chat propio en la app |
| Registro del trabajo | No existe | En AgroNexo (acuerdo, visitas, documentos, cierre) | En AgroNexo |
| Esfuerzo de construcción | Mínimo | Medio | Alto (chat en tiempo real, adjuntos, notificaciones push, moderación) |
| Qué ve AgroNexo | Nada después del "sí" | Si el trabajo arrancó, avanzó y cerró | Todo |
| Riesgo | AgroNexo pasa a ser una guía telefónica | Que el registro se sienta como trámite | Competir contra WhatsApp y perder |

**Recomendación: B.** Que la charla vaya por WhatsApp y que el trabajo quede registrado en AgroNexo.

## Dónde estamos hoy (lo que dice el código)

- `Match` tiene los estados `Pending → Active → Completed`, más `Rejected` y `Cancelled`. `Complete()` existe en el dominio, pero ninguna pantalla lo usa.
- Cuando el profesional acepta, recibe el teléfono y el correo del productor (`MatchContactResponse`). **El contacto va en una sola dirección:** el productor no recibe el del profesional.
- La auditoría ya lo había marcado: *"El productor ve 'Aceptado' sin una acción siguiente (contacto, dashboard)"* (`docs/design/auditoria-flujo-match.md`).
- Ya existe `Farm`: un campo del productor dentro de su tenant, con `PublicId` legible (200001…), hectáreas y ubicación. No tiene pantalla, no tiene campañas ni lotes y no está vinculado al `Match`.
- No hay notificaciones (ni correo ni WhatsApp), notas, documentos ni reseñas.

Hoy el match termina en un callejón: el profesional tiene un teléfono y el productor no tiene nada.

## Qué muestran los comparables

- **Tegu, Clickie y Malevo** dejan de intervenir cuando el cliente elige. **LinkedIn Services** cierra el acuerdo afuera y no ve el resultado, así que su reputación depende de la identidad y de reseñas invitadas.
- **Upwork** se queda con todo: workroom, contrato, hitos y pago. Por eso puede calcular reputación por resultados. Sus términos obligan a trabajar dentro de la plataforma los primeros dos años ([Upwork Help](https://support.upwork.com/hc/en-us/articles/360043723533)). AgroNexo no cobra la transacción, así que no tiene con qué imponer algo así.
- **AGROdisponible** sumó una mensajería interna "tipo WhatsApp". Es el ejemplo de C en el agro, y no hay evidencia de que haya ganado tracción por eso.
- **Auravant y FieldView** son las herramientas donde el agrónomo ya trabaja: el productor comparte su campo y sus lotes con el asesor ([Forbes AR](https://www.forbesargentina.com/especiales/auravant-detras-escena-empresa-monitorea-52-millones-hectareas-todo-mundo-n4097); [FAO](https://agritechobservatory.review.fao.org/ar/climate-fieldview)). Esto importa: AgroNexo **no** debería intentar ser un software de gestión agronómica (mapas, NDVI, recetas), porque el agrónomo ya tiene uno.
- **Fuga de la plataforma (disintermediation):** la causa principal es evitar comisiones, y le sigue la sensación de que, después del primer trabajo, la plataforma ya no aporta nada ([Sharetribe](https://sharetribe.com/marketplace-glossary/disintermediation-platform-leakage)). Un estudio de Kellogg sobre una app de limpieza no encontró fuga ([Kellogg](https://www.kellogg.northwestern.edu/faculty/bray/doc/disintermediation/disintermediation.pdf)). La lectura más útil: *si la gente se va, es porque la plataforma no agrega valor* ([AAPL](https://www.physicianleaders.org/articles/why-customers-leave-platforms-and-how-to-retain-them)). La salida no es encerrar al usuario. Es que quedarse sea lo más cómodo.
- La investigación previa (`docs/research/reports/Matchmaking profesional agro.md`) ya llegaba a lo mismo: WhatsApp después del match, con un enlace wa.me prellenado, y el seguimiento en el dashboard. El diferencial de AgroNexo **no es el match, es lo que se abre después.**

## Por qué B y no C

1. **WhatsApp ya ganó la conversación.** Tiene entre 90 y 93 % de penetración en Argentina. Un chat propio obliga a abrir otra app, depende de notificaciones push que el usuario rural apaga o no recibe y, además, es caro de construir bien.
2. **Lo que AgroNexo necesita no es la charla, son los hitos.** Para construir reputación por resultados alcanza con saber: ¿hubo primer contacto? ¿se acordó el alcance? ¿hubo visitas o entregas? ¿se cerró? ¿volvieron a trabajar juntos la campaña siguiente? Todo eso son eventos, no mensajes.
3. **Le resuelve algo real a cada parte.**
   - Productor: tener en un solo lugar *quién trabaja en mi campo, qué se acordó y qué me entregaron*. Hoy eso vive perdido en chats y mails.
   - Profesional: un historial que lo respalde, cartera de clientes y reseñas que solo pueden dejar clientes reales.
4. **No cierra la puerta a C.** Si las entrevistas muestran que quieren hablar adentro (por ejemplo, para no dar el número personal), se agregan comentarios en la bitácora del mismo espacio.

## Decisiones tomadas (2026-10-09)

- **El espacio de trabajo es del campo y lo maneja el productor.** Los profesionales entran por match y pueden irse cuando quieran, pero **solo el productor cierra el espacio**.
- **El profesional ve el campo completo**, no solo los lotes que le tocan.
- **No existe el "trabajo cancelado".** La relación puede durar semanas o varias campañas y los profesionales trabajan juntos en el mismo campo. Lo que termina es la participación de un profesional (se va o el productor lo desvincula), no un trabajo.
- **Cada parte ve el WhatsApp y el mail de la otra** cuando se acepta el match.
- **El productor crea el campo** (nombre y breve descripción; el ID lo genera `Farm`) e **invita desde una lista** de profesionales con match aceptado, que se puede filtrar por rol y muestra nombre, especialidad y matrícula.
- **Cada campo tiene una sección General** (para todo el equipo) **y una sección privada por profesional** (solo ese profesional y el productor). El abogado no ve la del contador. Los espacios entre dos profesionales quedan para más adelante.
- **Va a haber cobro**, pero todavía no está definido cómo. La recomendación está en [Cómo cobrar](#cómo-cobrar).

## El espacio de trabajo por campo

Era la idea original ("Lote Soja 2027 – ID") y, con las decisiones de arriba, es el modelo correcto: la unidad es el **campo**, no cada contratación.

```
Productor (dueño, el único que cierra)
 └─ Espacio "La Esperanza" · ID 200001   ← sobre Farm, que ya existe
     ├─ Campañas: 2025/26 · 2026/27 (actual)
     │   └─ Lotes: "Lote 4 · soja 1ra · 120 ha" …
     ├─ Equipo
     │   ├─ Ing. Pérez · agrónomo   · desde 10/2026 · activo
     │   ├─ Cr. Ruiz · contador     · desde 03/2025 · activo
     │   └─ Dra. Gómez · abogada    · 05/2026–08/2026 · se fue
     ├─ Bitácora (visitas, recomendaciones, novedades; de todo el equipo)
     └─ Documentos
```

Reglas:

1. **Cómo se entra:** al pedir el match, el productor elige el campo ("¿Para qué campo es?"), o crea uno nuevo con dos datos: nombre y hectáreas. Cuando el profesional acepta, entra al equipo de ese espacio automáticamente. El productor no arma nada a mano antes de empezar.
2. **Cómo se sale:** el profesional toca "Dejar este campo" o el productor toca "Desvincular". La historia queda: lo que cargó en la bitácora y en documentos sigue visible y su nombre aparece como "se fue".
3. **Cierre:** solo el productor puede archivar el espacio (vendió el campo, terminó el arrendamiento). Al archivarlo, todos salen y el espacio queda en solo lectura.
4. **Campaña:** en Argentina se dice **campaña 2026/27**, no "2027". La campaña es un período **dentro** del espacio (para filtrar la bitácora y los lotes), no un espacio nuevo. Así la relación sigue de una campaña a la otra sin que haya que volver a invitar a nadie.
5. **Trabajo de toda la empresa:** el contador que hace el balance o el abogado que ve un tema societario no trabajan sobre un campo. Para eso hay un espacio especial, "Mi empresa", que se crea siempre, con las mismas reglas.

## Cómo sería la pantalla

`/campos/{id}`: la usan el productor y todo el equipo.

1. **Encabezado:** nombre del campo, ID, hectáreas, campaña actual y las caras del equipo.
2. **Equipo:** una tarjeta por profesional con rol, desde cuándo trabaja ahí, "Escribir por WhatsApp" (mensaje prellenado), teléfono y correo. El productor tiene además "Sumar profesional", que lo lleva a la búsqueda con el campo ya elegido.
3. **Acuerdo de cada profesional:** alcance en una o dos líneas, frecuencia ("visita quincenal", "liquidación mensual") y honorario. Lo propone una de las partes y la otra lo confirma con un toque. Se puede revisar en cada campaña.
4. **Bitácora:** entradas cortas de cualquiera del equipo ("Visita 12/11, lote 4: 15 % de defoliación…"), con foto o archivo y filtros por campaña, lote y profesional. **No es un chat:** es el registro de lo que pasó, compartido por todos.
5. **Documentos:** análisis de suelo, contratos, balances, informes.
6. **Reseñas:** no se piden por "trabajo terminado", porque las relaciones son largas. Se piden en dos momentos:
   - cuando un profesional **sale** del equipo (por cualquiera de los dos lados);
   - al **cierre de cada campaña**, para los que siguen ("¿Cómo fue la campaña 2026/27 con el Ing. Pérez?").

   Cada reseña es por aspectos (claridad, puntualidad, resultado) e incluye un comentario privado para AgroNexo. La continuidad (tres campañas seguidas con el mismo productor) también es una señal de reputación, quizás la más fuerte.

Avisos: correo desde el día uno; WhatsApp Business más adelante. Cada aviso lleva directo al espacio.

## Cómo cobrar

### Opciones

| Modelo | Quién paga | Ejemplos | Encaja con AgroNexo |
|---|---|---|---|
| **Comisión sobre el honorario** | Productor o profesional, un % de cada pago | Upwork, Clickie | **Mal.** Las relaciones duran años y los honorarios se pagan por transferencia, en quintales o en dólares. Para cobrar la comisión habría que meterse en el pago, y después del primer mes nadie ve para qué pagarla. Es el caso típico de fuga de la plataforma. |
| **Pago por contacto o solicitud aceptada** | Profesional, al aceptar | Thumbtack, Bark | **Bien para arrancar.** Ya tenemos el doble opt-in: el profesional paga cuando acepta y recibe el contacto, que es justo el momento en que obtiene valor. Es simple y no toca el honorario. |
| **Suscripción del profesional** | Profesional, mensual | LinkedIn Premium, Auravant | **Bien a mediano plazo.** Cuando el espacio de trabajo le sirva para manejar su cartera (varios campos, bitácora, informes, perfil con reputación), paga por la herramienta y no por cada cliente. |
| **Suscripción del productor** | Productor | Software de gestión agro | **Más adelante.** Por ejemplo, más de N campos, almacenamiento o informes por campaña. Cobrarle al productor al principio frena la demanda, que es lo más difícil de conseguir. |

### Recomendación

1. **Ahora: gratis para todos.** Primero hay que demostrar que se concretan matches y que los espacios se usan. Cobrar antes de tener liquidez mata un marketplace nuevo.
2. **Primer cobro: al profesional, por solicitud aceptada,** con las primeras 3 gratis. Es el modelo que mejor encaja con el flujo que ya existe y no obliga a manejar dinero de terceros.
3. **Después: plan mensual para el profesional** que reemplaza el pago por solicitud: solicitudes ilimitadas, espacios ilimitados e informes. Es lo que hace sostenible el negocio con relaciones largas, porque se cobra por la herramienta que se usa todos los días y no por un contacto que se hace una sola vez.
4. **No cobrar comisión sobre honorarios**, salvo que algún día AgroNexo agregue algo que justifique estar en el medio del pago (cobro con Mercado Pago, factura automática, financiación del honorario a cosecha). En ese caso, la comisión pagaría un servicio y no sería un peaje.

Consecuencia para el diseño: como el honorario no pasa por la plataforma, en el acuerdo es **texto libre**. Igual conviene modelarlo como entidad propia (y no como un string dentro de `Match`), para poder sumarle pagos más adelante sin migrar todo.

> Hay que validar la disposición a pagar en las entrevistas: *"Si cada solicitud aceptada te costara el equivalente a X, ¿la aceptarías? ¿Y un plan mensual de Y?"*. Para no inventar precios, X e Y se definen como porcentaje de un honorario típico.

## Plan

### Fase 0 · Cerrar el circuito (1 sprint, muy chico)

Que el "Aceptado" lleve a algún lado.

- Backend: devolver el contacto del **profesional** al productor cuando el match está `Active`, con la misma regla de privacidad.
- Frontend: en "Mis solicitudes", el estado Aceptado muestra el contacto del profesional y "Escribir por WhatsApp" (wa.me prellenado con la ficha). Lo mismo del lado del profesional.
- Correo de aviso a las dos partes cuando se acepta.
- Medir: % de matches aceptados con clic en WhatsApp dentro de las 48 h.

### Fase 1 · Espacio de trabajo v1 (2–3 sprints)

- Backend:
  - `Farm` pasa a ser el espacio (suma `ArchivedAt`). Se crea siempre el espacio especial "Mi empresa".
  - `CreateMatchRequest` recibe `farmId`.
  - Entidad nueva **`FarmMember`** (FarmId, ProfessionalId, MatchId, JoinedAt, LeftAt, LeftBy): al aceptar el match se crea el miembro. Acceso entre tenants: el miembro activo ve el campo completo.
  - Entidad **`Agreement`** por miembro (alcance, frecuencia, honorario en texto, propuesto por, confirmado en).
- Frontend: `/campos` (lista) y `/campos/{id}` con encabezado, equipo, contacto y acuerdo. "Elegí el campo" en el Drawer de solicitud. Botones "Dejar este campo", "Desvincular" y "Archivar".
- Medir: % de miembros con acuerdo confirmado y productores con 2 o más profesionales en un mismo campo.

### Fase 2 · Registro y reputación (2–3 sprints)

- Bitácora y documentos compartidos (necesita almacenamiento de archivos).
- Campañas y lotes dentro del espacio.
- Reseñas al salir y al cierre de campaña. Señal de continuidad en la tarjeta del profesional.

### Fase 3 · Cobro y lo que pidan los datos

- Pago por solicitud aceptada y, después, plan mensual del profesional.
- Avisos por WhatsApp Business.
- Comentarios en la bitácora, solo si las entrevistas o los datos piden hablar adentro.

## Lo que hay que validar con usuarios antes de la fase 1

Las fases 0 y 1 se apoyan en evidencia de otras plataformas, no en nuestros usuarios. Antes de construir la bitácora conviene validarlas.

**Método:** 8 entrevistas de unos 45 minutos con prueba de concepto. 4 productores (2 medianos y 2 grandes) y 4 profesionales (2 agrónomos, 1 contador y 1 abogado). En 2 semanas.

**Guion:**

1. **Arranque (5′):** quién es, qué produce o atiende, cuántos campos o clientes tiene.
2. **Contexto (10′):** *"Contame la última vez que empezaste a trabajar con un asesor nuevo. ¿Cómo fue el primer contacto? ¿Dónde quedó lo que acordaron?"* Repreguntas: ¿en qué app?, ¿quién guarda los informes?, ¿los profesionales de un mismo campo hablan entre ellos?
3. **Profundización (15′):** *"¿Dónde tenés hoy la información de qué hizo cada profesional en tu campo?"* *"¿Qué le pasaría a tu trabajo si ese chat de WhatsApp desapareciera?"* (al profesional: *"¿cómo le mostrás a un cliente nuevo lo que hiciste en otros campos?"*, *"¿cuánto pagarías por conseguir un cliente nuevo?"*).
4. **Reacción (10′):** mostrar la pantalla del campo con el equipo. *"¿Qué usarías la próxima semana? ¿Qué te molestaría?"* ¿Le parece bien que el contador vea el campo completo? ¿El acuerdo de un toque le resulta útil o burocrático?
5. **Cierre (5′):** *"¿Te molestaría darle tu número a alguien que aceptó tu solicitud?"* y las preguntas de precio. *"¿Hay algo que no te pregunté?"*

**Hipótesis para confirmar o descartar:**

- H1: los productores prefieren hablar por WhatsApp antes que por un chat propio.
- H2: el acuerdo de un toque se siente útil, no burocrático.
- H3: ver a todo el equipo de un campo en un solo lugar es valioso para productores con más de un profesional.
- H4: a los productores no les molesta que cualquier profesional del equipo vea el campo completo (decidido así; hay que confirmar que no genera rechazo, sobre todo con datos económicos).
- H5: los profesionales pagarían por solicitud aceptada; falta saber cuánto.

**Para sintetizar:** mapa de afinidad por hipótesis y un journey map desde la solicitud hasta la segunda campaña.

## Preguntas abiertas

- ¿Los documentos económicos (balance, contratos) también los ve todo el equipo, o se pueden marcar como privados para un profesional?
- ¿El productor puede sumar a su equipo a un profesional que ya conoce, sin pasar por el match? Sería bueno para la adopción, pero implica invitar a alguien que no está en la plataforma.
