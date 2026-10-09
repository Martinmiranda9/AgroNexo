-- Profesionales FICTICIOS para probar la búsqueda asistida (frontend/src/features/match-discovery).
-- Solo desarrollo. Se puede correr las veces que haga falta: borra y vuelve a crear solo lo marcado como seed.
--   Marca:  Auth0UserId = 'seed|...'  ·  Email = '...@seed.agronexo.local'  ·  tenant "SEED - Profesionales de prueba".
--   Cargar: docker exec -i agroconnect-db-1 psql -U agronexo -d agronexo_db < backend/scripts/dev/seed-test-professionals.sql
--   Quitar: backend/scripts/dev/remove-test-professionals.sql
--
-- La zona de cobertura es un círculo (radio en km) alrededor de la ciudad. Reglas de la búsqueda:
--   * Agrónomo (exige presencia en el campo): solo aparece si su zona CONTIENE el punto buscado.
--   * Contador, abogado e inversionista (trabajan a distancia): aparecen siempre, pero ordenados por cercanía a la
--     zona buscada (la proximidad pesa 35 % del puntaje con un radio de 800 km): misma provincia primero.
--   * La distancia se mide al CENTRO de la zona de cada profesional.
-- Distancias desde Berrotarán (Córdoba): Río Cuarto 75 km · Córdoba capital 116 km · Villa María 108 km.
-- PublicId = prefijo * 10^4 + secuencia (agrónomo 12, contador 14, inversionista 16, abogado 18); se usa 9001+
-- para no chocar con la secuencia real.

BEGIN;

-- 1. Limpieza de corridas anteriores (en orden por las claves foráneas).
DELETE FROM match_recommendations WHERE "ProfessionalId" IN (SELECT "Id" FROM professionals WHERE "Auth0UserId" LIKE 'seed|%');
DELETE FROM matches               WHERE "ProfessionalId" IN (SELECT "Id" FROM professionals WHERE "Auth0UserId" LIKE 'seed|%');
DELETE FROM professionals         WHERE "Auth0UserId" LIKE 'seed|%';
DELETE FROM tenants               WHERE "Name" = 'SEED - Profesionales de prueba';

-- 2. Un solo tenant para todos los de prueba.
INSERT INTO tenants ("Id", "Name", "IsActive", "CreatedAt")
VALUES ('5eed0000-0000-4000-8000-000000000001', 'SEED - Profesionales de prueba', true, now());

-- 3. Profesionales. Role: 1 Agrónomo · 2 Contador · 3 Inversionista · 5 Abogado.
WITH seed (seq, role, prefix, first_name, last_name, specialty, years, cap, verified, license, lat, lon, radius_km) AS (
  VALUES
    -- Agrónomos de Córdoba: los que SÍ cubren Berrotarán
    (9001, 1, 12, 'Lucía',     'Fernández', 'Cultivos extensivos: soja y maíz',          14, 15, true,  'MP 4521', -33.1232, -64.3493, 110),
    (9002, 1, 12, 'Gonzalo',   'Peralta',   'Agricultura de precisión y ambientación',     9, 12, true,  'MP 3310', -31.4201, -64.1888, 170),
    (9003, 1, 12, 'Julián',    'Moyano',    'Pasturas y forraje: ganadería de cría',       2, 10, false, 'MP 6677', -33.1232, -64.3493, 100),
    -- Agrónomos de Córdoba que NO cubren Berrotarán (Villa María está a 108 km, su zona llega a 70 km)
    (9004, 1, 12, 'Mariana',   'Quiroga',   'Cultivos extensivos: soja, maíz y trigo',     7, 12, true,  'MP 5102', -32.4075, -63.2409,  70),
    -- Agrónomos de Buenos Aires: tampoco deberían aparecerle a un productor de Córdoba
    (9005, 1, 12, 'Federico',  'Álvarez',   'Cultivos extensivos de la pampa húmeda',     16, 20, true,  'MP 2208', -33.8920, -60.5736, 120),
    (9006, 1, 12, 'Sofía',     'Benítez',   'Pasturas y forraje',                          6, 10, true,  'MP 4890', -34.9205, -57.9536, 100),
    (9007, 1, 12, 'Carolina',  'Sosa',      'Agricultura de precisión',                    8, 10, true,  'MP 3951', -38.7196, -62.2724, 150),
    -- Contadores (trabajan a distancia: aparecen sin importar la zona)
    (9008, 2, 14, 'Ricardo',   'Montenegro','Impuestos agropecuarios: IVA, Ganancias y retenciones', 15, 20, true,  'CPCE 12345', -31.4201, -64.1888,  50),
    (9009, 2, 14, 'Paula',     'Giménez',   'Liquidación de granos y cooperativas',       11, 15, true,  'CPCE 67890', -34.6037, -58.3816,  50),
    (9010, 2, 14, 'Nicolás',   'Herrera',   'Créditos y garantías para productores',       3,  8, false, 'CPCE 24680', -33.1232, -64.3493,  50),
    -- Abogados
    (9011, 5, 18, 'Alejandra', 'Ruiz',      'Arrendamientos rurales y contratos agrarios',12, 12, true,  'MP 1020', -31.4201, -64.1888,  50),
    (9012, 5, 18, 'Martín',    'Domínguez', 'Sucesiones y herencias de campos',           18, 10, true,  'MP 3040', -34.6037, -58.3816,  50),
    -- Inversionista
    (9013, 3, 16, 'Eduardo',   'Villalba',  'Financiamiento de campaña agrícola',         20, 10, true,  NULL,      -34.6037, -58.3816,  50)
)
INSERT INTO professionals (
  "Id", "TenantId", "Auth0UserId", "FirstName", "LastName", "DocumentNumber", "Email", "Role", "Specialty",
  "PhoneNumber", "LicenseNumber", "CoverageArea", "YearsExperience", "MaxCapacity", "IsVerified", "IsActive",
  "PublicId", "CreatedAt"
)
SELECT
  md5('seed|prof|' || seq)::uuid,
  '5eed0000-0000-4000-8000-000000000001',
  'seed|prof-' || seq,
  first_name,
  last_name,
  '00' || seq,
  lower(replace(first_name || '.' || last_name || seq, ' ', '')) || '@seed.agronexo.local',
  role,
  specialty,
  '+54911000' || seq,
  license,
  ST_Buffer(ST_SetSRID(ST_MakePoint(lon, lat), 4326)::geography, radius_km * 1000)::geometry,
  years,
  cap,
  verified,
  true,
  prefix * 10000 + seq,
  now()
FROM seed;

COMMIT;

SELECT "PublicId" AS id, CASE "Role" WHEN 1 THEN 'Agrónomo' WHEN 2 THEN 'Contador' WHEN 3 THEN 'Inversionista' WHEN 5 THEN 'Abogado' END AS rol,
       "FirstName" || ' ' || "LastName" AS nombre, "Specialty" AS especialidad, "IsVerified" AS verificado,
       round((ST_Distance(ST_SetSRID(ST_MakePoint(-64.39, -32.45), 4326)::geography, "CoverageArea"::geography) / 1000)::numeric) AS km_a_berrotaran_desde_su_zona,
       ST_Contains("CoverageArea", ST_SetSRID(ST_MakePoint(-64.39, -32.45), 4326)) AS cubre_berrotaran
FROM professionals WHERE "Auth0UserId" LIKE 'seed|%' ORDER BY "PublicId";
