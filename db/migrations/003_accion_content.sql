-- ============================================================
-- Migration 003: Actualización de contenido de /accion
-- Ejecutar con: psql $DATABASE_URL -f db/migrations/003_accion_content.sql
-- ============================================================

-- ── Logos de organizaciones existentes ───────────────────────
UPDATE organizations
SET logo_url = 'https://www.conaf.cl/wp-content/uploads/2011/10/logo-conaf.png'
WHERE name ILIKE '%CONAF%' AND logo_url IS NULL;

UPDATE organizations
SET logo_url = 'https://chile.wcs.org/favicon.ico'
WHERE name ILIKE '%Wildlife Conservation%' AND logo_url IS NULL;

UPDATE organizations
SET logo_url = 'https://www.ieb-chile.cl/favicon.ico'
WHERE name ILIKE '%Ecología y Biodiversidad%' AND logo_url IS NULL;

UPDATE organizations
SET logo_url = 'https://aveschile.cl/favicon.ico'
WHERE name ILIKE '%Aves Chile%' AND logo_url IS NULL;

-- ── Nuevas organizaciones (MMA y SBAP) ───────────────────────
INSERT INTO organizations (name, type, website, description, national, active, slug)
VALUES
  (
    'Ministerio del Medio Ambiente de Chile',
    'gobierno',
    'https://mma.gob.cl',
    'Organismo gubernamental a cargo de la política ambiental de Chile. Gestiona la clasificación de especies, las áreas protegidas y los programas de conservación.',
    TRUE,
    TRUE,
    'ministerio-medio-ambiente'
  ),
  (
    'SBAP — Servicio de Biodiversidad y Áreas Protegidas',
    'gobierno',
    'https://sbap.gob.cl',
    'Servicio público creado por la Ley 21.600 para administrar las áreas protegidas del Estado y proteger la biodiversidad de Chile.',
    TRUE,
    TRUE,
    'sbap'
  )
ON CONFLICT (slug) DO NOTHING;

-- ── Peticiones: limpiar y re-insertar con contenido real ─────
-- ADVERTENCIA: esto elimina firmas existentes.
-- Comentar las líneas DELETE si hay datos de producción que preservar.

DELETE FROM petition_signatures;
DELETE FROM petitions;

INSERT INTO petitions (slug, title, description, goal, image_url, active, organization_id, ends_at)
VALUES
  (
    'proteger-habitat-huemul-patagonia',
    'Proteger el hábitat del Huemul en la Patagonia',
    'El huemul enfrenta la pérdida acelerada de su hábitat por expansión ganadera y fragmentación del territorio. Esta petición exige la ampliación de las zonas de protección en la Región de Aysén y el fortalecimiento de los programas de monitoreo del MMA.',
    5000,
    'https://static.inaturalist.org/photos/236504721/large.jpeg',
    TRUE,
    (SELECT id FROM organizations WHERE slug = 'ministerio-medio-ambiente' LIMIT 1),
    NOW() + INTERVAL '180 days'
  ),
  (
    'prohibir-especies-exoticas-invasoras-areas-protegidas',
    'Prohibir la introducción de especies exóticas invasoras en áreas protegidas',
    'Las especies invasoras como el visón americano y el conejo europeo devastan ecosistemas nativos. Pedimos al Servicio de Biodiversidad y Áreas Protegidas (SBAP) implementar protocolos de control efectivos en parques nacionales y reservas.',
    8000,
    'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1f/Oryctolagus_cuniculus_Rcdo.jpg/1280px-Oryctolagus_cuniculus_Rcdo.jpg',
    TRUE,
    (SELECT id FROM organizations WHERE slug = 'sbap' LIMIT 1),
    NOW() + INTERVAL '180 days'
  ),
  (
    'restaurar-humedal-carlos-anwandter',
    'Restaurar el humedal Carlos Anwandter — primer sitio Ramsar de Chile',
    'El humedal del río Cruces en Valdivia, primer sitio Ramsar de Chile, sigue en recuperación tras el desastre ambiental de 2004. Exigimos un plan de restauración activa con financiamiento público y monitoreo permanente de las poblaciones de cisne de cuello negro.',
    10000,
    'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Humedales_de_los_rios_cruces_y_chorocomayo_en_la_ciudad_de_Valdivia%2C_Chile_01.jpg/1280px-Humedales_de_los_rios_cruces_y_chorocomayo_en_la_ciudad_de_Valdivia%2C_Chile_01.jpg',
    TRUE,
    (SELECT id FROM organizations WHERE slug = 'ministerio-medio-ambiente' LIMIT 1),
    NOW() + INTERVAL '180 days'
  );
