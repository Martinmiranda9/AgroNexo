# Plan de implementación · Lotes en el mapa

## Cómo funciona

- **Las hectáreas son siempre las que declara quien carga** el campo o el lote. El sistema no las calcula ni las compara con el dibujo.
- **El dibujo en el mapa es opcional y solo ubica** el campo (perímetro) o el lote. Se ve en el mapa y en "Ver lote".
- **Nada bloquea por superficie ni por ubicación**: los lotes pueden sumar más que el campo, quedar afuera del perímetro o encimarse con otro. El formulario avisa, pero guarda. Lo único que se rechaza es un borde que se cruza consigo mismo (no se puede guardar en PostGIS).
- **Coordenadas**: el usuario pega latitud y longitud (formato de Google Maps, coma decimal o con hemisferio) y el mapa vuela al punto para dibujar desde ahí.
- **Ubicación del campo**: con perímetro dibujado, el backend busca provincia, partido y localidad con la API Georef (gratis y oficial).

## Quién puede hacer qué

| Acción | Productor dueño | Agrónomo activo del equipo | Otro profesional del equipo | Ex miembro / sin acceso |
|---|---|---|---|---|
| Ver el mapa, el perímetro y los lotes | ✅ | ✅ | ✅ | 404 |
| Crear o corregir lotes (nombre, hectáreas, ubicación) | ✅ | ✅ | ❌ 403 | 404 |
| Dar de baja un lote | ✅ | ❌ | ❌ | 404 |
| Cargar o sacar cultivos | ✅ | ❌ | ❌ | 404 |
| Crear el campo y dibujar su perímetro | ✅ | ❌ | ❌ | 404 |

- La regla "productor o agrónomo" vive en `FarmAccess.CanEditLots`; el tablero la recibe como `canEditLots`.
- Los cambios del agrónomo se aplican directo y quedan firmados (`createdBy`, `boundaryEditedBy`, `boundaryEditedAt`).

## Hecho

### Backend

- `Lot`: `Boundary` (`geometry(Polygon,4326)`, índice GIST), `CreatedByProfessionalId`, `BoundaryEditedByProfessionalId`, `BoundaryEditedAt`. Hectáreas siempre declaradas; un borde cruzado se rechaza.
- `Farm`: `Province`, `Department`, `Locality` (`SetPlace`); un perímetro cruzado se rechaza.
- `LotRequest`: `Hectares` obligatorio y `BoundaryCoordinates` opcional (mínimo 3 esquinas). Un `PUT` sin forma saca el dibujo.
- `LotResponse`: `BoundaryCoordinates`, `CreatedBy`, `BoundaryEditedBy`, `BoundaryEditedAt`. `WorkspaceResponse`: perímetro y ubicación. `FarmDashboardResponse.CanEditLots`.
- `LotsController`: crear y editar con `Authenticated` + `CanEditLots`; baja y cultivos solo del productor.
- `IPlaceLookupService` / `GeorefPlaceLookupService` (timeout 3 s; si falla, el campo se guarda sin ubicación) y `FarmPlaceResolver`.
- Migración `AddLotBoundaryAndFarmPlace`.
- Tests: `LotBoundaryDomainTests`, `LotBoundaryIntegrationTests`, `LotTeamEditingIntegrationTests`, `FakePlaceLookupWebApplicationFactory`. En `FarmDashboardIntegrationTests` se actualizaron dos aserciones con autorización: el agrónomo puede crear lotes y los lotes pueden sumar más que el campo.

### Frontend

- `ui/components/FieldMap`: Leaflet sin plugins, satélite de Esri y capa de nombres. Dibujo por esquinas arrastrables, `focus` (vuela a un punto), `highlightId` y tamaños `default` / `fill`. Colores por tokens.
- `ui/components/Dialog`: tamaño `xl`.
- `features/farms/components/map/`: `LazyFieldMap` (`next/dynamic`), `CoordinatesField` ("Ir al punto"), `DrawingMapPanel` (mapa grande, esquinas, deshacer, borrar, errores y avisos).
- "Nuevo lote" (`LotDrawer`) y "Nuevo campo" (`CreateFarmDrawer`) en pantalla completa (`FarmDrawer size="full"`): datos a la izquierda y mapa a la derecha. Toast al guardar, salga bien o mal.
- Avisos que no bloquean: afuera del perímetro, encima de otro lote, lotes que suman más que el campo.
- "Ver lote" en cada lote de `SurfaceCard`: `LotDetailsDialog` con el mapa encuadrado en el lote y sus datos.
- `lot-geometry.ts`: anillo abierto, borde cruzado, afuera del perímetro, superposición y lectura de coordenadas.
- Tests: `tests/unit/lot-geometry.test.ts` y E2E `lot-drawing.spec.ts`, `lot-details.spec.ts`, `farm-map-creation.spec.ts` (necesitan `E2E_SESSION_TOKEN`).

## Pendiente

- **Mapa del campo en el tablero**: una tarjeta con el perímetro y todos los lotes coloreados por estado o cultivo. Falta decidir dónde va en el bento.
- **Corregir la ubicación de un lote existente** (mover esquinas desde "Ver lote") y **dibujar el perímetro de un campo que ya existe**.
- **Buscar por localidad** (Georef `/localidades`) además de por coordenadas.
- Más adelante: importar KML/KMZ, clima y riesgo por lote, NDVI con Sentinel-2, catastro de ARBA.
- Para producción: cuenta gratis de ArcGIS Location Platform y su clave para los mosaicos de Esri.
