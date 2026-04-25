-- ============================================================
-- Migración 004: Polígonos SNASPE (Sistema Nacional de Áreas
--                Silvestres Protegidas del Estado de Chile)
-- Fuente: GeoJSON oficial con 2.754 polígonos → 76 áreas únicas
-- Datos: ejecutar scripts/import-snaspe.ts después de esta migración
-- ============================================================

-- Extensión PostGIS (debe estar habilitada en Supabase)
CREATE EXTENSION IF NOT EXISTS postgis;

-- Tabla principal de polígonos SNASPE
CREATE TABLE IF NOT EXISTS protected_area_polygons (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre       TEXT        NOT NULL,
  tipo         TEXT,
  region       TEXT,
  superficie_ha NUMERIC,
  geom         GEOMETRY(MULTIPOLYGON, 4326),
  properties   JSONB,
  rayen_slug   TEXT        REFERENCES protected_areas(slug) ON DELETE SET NULL,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- Índice espacial para consultas geográficas
CREATE INDEX IF NOT EXISTS idx_polygons_geom
  ON protected_area_polygons USING GIST(geom);

-- Índice en nombre para agrupación y búsquedas
CREATE INDEX IF NOT EXISTS idx_polygons_nombre
  ON protected_area_polygons (nombre);

-- Índice en tipo para filtros por categoría
CREATE INDEX IF NOT EXISTS idx_polygons_tipo
  ON protected_area_polygons (tipo);

-- Comentarios de columna
COMMENT ON TABLE  protected_area_polygons                 IS 'Polígonos del SNASPE importados desde el GeoJSON oficial de CONAF';
COMMENT ON COLUMN protected_area_polygons.nombre          IS 'Nombre del área (ej: "Villarrica [Parques]")';
COMMENT ON COLUMN protected_area_polygons.tipo            IS 'Categoría SNASPE: Parques | Reservas | Monumentos';
COMMENT ON COLUMN protected_area_polygons.region          IS 'Región administrativa de Chile en mayúsculas';
COMMENT ON COLUMN protected_area_polygons.superficie_ha   IS 'Superficie en hectáreas según el shapefile oficial';
COMMENT ON COLUMN protected_area_polygons.geom            IS 'Geometría MultiPolygon en WGS84 (SRID 4326)';
COMMENT ON COLUMN protected_area_polygons.rayen_slug      IS 'FK a protected_areas.slug si existe coincidencia de nombre';
