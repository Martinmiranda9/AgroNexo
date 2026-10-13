# AgroNexo — instrucciones para Claude

Las convenciones generales del proyecto están en [ia/agent.md](ia/agent.md). Este archivo agrega las reglas de trabajo que aplican a todo pedido.

## Tests E2E en todo pedido (desde 2026-10-09)

Todo cambio que se implemente (feature, fix, rediseño) viene acompañado de tests E2E que lo cubran. No es opcional ni se deja "para después".

**Lo que ya existe no se toca.** No modificar, reemplazar ni borrar tests existentes (`frontend/tests/e2e/registration.spec.ts`, `frontend/tests/unit/*`, `backend/tests/*`) salvo que el usuario lo pida explícitamente. Los E2E nuevos van en archivos nuevos.

### Dónde y cómo

- **Frontend (Playwright):** `frontend/tests/e2e/<feature>.spec.ts`, un archivo por feature o flujo. La config ya está en `frontend/playwright.config.ts` (Chromium, `baseURL` `http://localhost:3000`, levanta `npm run dev` solo).
  - Recorrer el flujo como un usuario: `page.goto` → interacciones → verificación de lo que se ve.
  - Selectores accesibles con el texto en español de la UI: `getByRole`, `getByLabel`, `getByText`. Nada de clases CSS ni selectores frágiles.
  - Si el flujo pega al backend, esperar la respuesta con `page.waitForResponse` y verificar status y payload, como en `registration.spec.ts`. Estos tests requieren la API en `:5000`.
  - Datos de prueba generados en el propio test (únicos por corrida si el backend los persiste), nunca datos reales.
  - Nombres de `describe`/`test` en español describiendo el comportamiento; código en inglés (ver `ia/agent.md` §4).
- **Cambios solo de backend sin UI que los consuma:** el E2E es un test de integración nuevo que recorre el flujo completo por HTTP, en un archivo nuevo dentro de `backend/tests/AgroNexo.IntegrationTests/`. Si hay UI que lo consume, además va el spec de Playwright.

### Verificación

- Correr el spec nuevo: `cd frontend && npx playwright test tests/e2e/<feature>.spec.ts` (o `dotnet test --filter` para backend).
- Reportar el resultado real. Si no se puede correr (por ejemplo, backend o base apagados), decirlo explícitamente y qué hace falta para correrlo; no darlo por pasado.
- Los E2E no corren en CI (`.github/workflows/frontend.yml` solo corre unit tests); no cambiar el CI sin que el usuario lo pida.
