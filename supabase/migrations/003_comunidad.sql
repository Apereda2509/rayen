-- ============================================================
-- RAYEN — Migración 003: Comunidad
-- Tablas: photos, photo_favorites, species_favorites, area_photos
-- Columnas adicionales en users
-- ============================================================

-- Tabla photos (fotos de avistamientos subidas por usuarios)
CREATE TABLE IF NOT EXISTS photos (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                 UUID REFERENCES users(id) ON DELETE SET NULL,
  species_id              UUID REFERENCES species(id) ON DELETE SET NULL,
  sighting_id             UUID REFERENCES sightings(id) ON DELETE SET NULL,
  protected_area_id       UUID REFERENCES protected_areas(id) ON DELETE SET NULL,
  url                     TEXT NOT NULL,
  license                 TEXT DEFAULT 'CC BY-SA 4.0',
  caption                 TEXT,
  favorites_count         INTEGER DEFAULT 0,
  is_species_candidate    BOOLEAN DEFAULT FALSE,
  candidate_approved      BOOLEAN DEFAULT FALSE,
  candidate_approved_by   UUID REFERENCES users(id) ON DELETE SET NULL,
  candidate_approved_at   TIMESTAMPTZ,
  created_at              TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla photo_favorites (toggle me gusta en fotos)
CREATE TABLE IF NOT EXISTS photo_favorites (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  photo_id   UUID NOT NULL REFERENCES photos(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (photo_id, user_id)
);

-- Tabla species_favorites (especies guardadas por usuario)
CREATE TABLE IF NOT EXISTS species_favorites (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID REFERENCES users(id) ON DELETE CASCADE,
  species_id UUID REFERENCES species(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, species_id)
);

-- Tabla area_photos (fotos de áreas protegidas subidas por usuarios)
CREATE TABLE IF NOT EXISTS area_photos (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID REFERENCES users(id) ON DELETE SET NULL,
  protected_area_id UUID REFERENCES protected_areas(id) ON DELETE CASCADE,
  url               TEXT NOT NULL,
  caption           TEXT,
  approved          BOOLEAN DEFAULT FALSE,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

-- Campos faltantes en tabla users
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS username             TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS bio                  TEXT,
  ADD COLUMN IF NOT EXISTS instagram            TEXT,
  ADD COLUMN IF NOT EXISTS linkedin             TEXT,
  ADD COLUMN IF NOT EXISTS inaturalist          TEXT,
  ADD COLUMN IF NOT EXISTS twitter              TEXT,
  ADD COLUMN IF NOT EXISTS website              TEXT,
  ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE;

-- Índices
CREATE INDEX IF NOT EXISTS idx_photos_user_id     ON photos(user_id);
CREATE INDEX IF NOT EXISTS idx_photos_species_id  ON photos(species_id);
CREATE INDEX IF NOT EXISTS idx_photos_sighting_id ON photos(sighting_id);
CREATE INDEX IF NOT EXISTS idx_photos_created_at  ON photos(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_photo_favorites_photo ON photo_favorites(photo_id);
CREATE INDEX IF NOT EXISTS idx_photo_favorites_user  ON photo_favorites(user_id);

CREATE INDEX IF NOT EXISTS idx_species_favorites_user    ON species_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_species_favorites_species ON species_favorites(species_id);

CREATE INDEX IF NOT EXISTS idx_area_photos_area_id    ON area_photos(protected_area_id);
CREATE INDEX IF NOT EXISTS idx_area_photos_approved   ON area_photos(approved) WHERE approved = TRUE;
CREATE INDEX IF NOT EXISTS idx_area_photos_created_at ON area_photos(created_at DESC);
