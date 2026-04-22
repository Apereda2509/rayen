-- ============================================================
-- Migración 001: Mejoras a tabla protected_areas
-- Agrega slug, centroide, descripción y región en texto
-- ============================================================

-- Campos adicionales necesarios para las nuevas funcionalidades
ALTER TABLE protected_areas
  ADD COLUMN IF NOT EXISTS slug          TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS centroid      GEOMETRY(POINT, 4326),
  ADD COLUMN IF NOT EXISTS description   TEXT,
  ADD COLUMN IF NOT EXISTS region_name   TEXT,
  ADD COLUMN IF NOT EXISTS photo_url     TEXT;

-- Índice espacial en centroide para consultas rápidas
CREATE INDEX IF NOT EXISTS idx_protected_areas_centroid ON protected_areas USING GIST (centroid);

-- Función para generar slug desde nombre
CREATE OR REPLACE FUNCTION slugify(text) RETURNS TEXT AS $$
  SELECT lower(
    regexp_replace(
      regexp_replace(
        translate($1,
          'áàäâéèëêíìïîóòöôúùüûñÁÀÄÂÉÈËÊÍÌÏÎÓÒÖÔÚÙÜÛÑ',
          'aaaaeeeeiiiioooouuuunAAAAEEEEIIIIOOOOUUUUNN'
        ),
        '[^a-z0-9\s-]', '', 'g'
      ),
      '[\s]+', '-', 'g'
    )
  );
$$ LANGUAGE SQL IMMUTABLE;
