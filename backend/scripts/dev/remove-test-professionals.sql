-- Borra SOLO los profesionales de prueba cargados por seed-test-professionals.sql (Auth0UserId 'seed|%'),
-- junto con las recomendaciones y pedidos de match que apunten a ellos. No toca datos reales.
--   docker exec -i agroconnect-db-1 psql -U agronexo -d agronexo_db < backend/scripts/dev/remove-test-professionals.sql

BEGIN;

DELETE FROM match_recommendations WHERE "ProfessionalId" IN (SELECT "Id" FROM professionals WHERE "Auth0UserId" LIKE 'seed|%');
DELETE FROM matches               WHERE "ProfessionalId" IN (SELECT "Id" FROM professionals WHERE "Auth0UserId" LIKE 'seed|%');
DELETE FROM professionals         WHERE "Auth0UserId" LIKE 'seed|%';
DELETE FROM tenants               WHERE "Name" = 'SEED - Profesionales de prueba';

COMMIT;
