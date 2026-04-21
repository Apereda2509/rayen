-- ============================================================
-- RAYEN — Schema de base de datos
-- PostgreSQL 15+ con extensión PostGIS
-- ============================================================

-- Extensiones requeridas
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS pg_trgm; -- Para búsqueda por similitud

-- ============================================================
-- ENUMS
-- ============================================================

CREATE TYPE species_type AS ENUM (
  'mamifero', 'ave', 'reptil', 'anfibio', 'pez',
  'insecto', 'planta', 'hongo', 'alga', 'otro'
);

CREATE TYPE uicn_status AS ENUM (
  'EX', 'EW', 'CR', 'EN', 'VU', 'NT', 'LC', 'DD', 'NE'
);

CREATE TYPE chile_status AS ENUM (
  'extinto', 'en_peligro_critico', 'en_peligro',
  'vulnerable', 'rara', 'fuera_de_peligro',
  'insuficientemente_conocida'
);

CREATE TYPE population_trend AS ENUM (
  'aumentando', 'estable', 'disminuyendo', 'desconocida'
);

CREATE TYPE size_category AS ENUM (
  'micro', 'pequeno', 'mediano', 'grande', 'muy_grande'
);

CREATE TYPE danger_level AS ENUM (
  'ninguno', 'bajo', 'moderado', 'alto'
);

CREATE TYPE active_period AS ENUM (
  'diurno', 'nocturno', 'crepuscular', 'variable'
);

CREATE TYPE diet_type AS ENUM (
  'herbivoro', 'carnivoro', 'omnivoro', 'detritívoro',
  'filtrador', 'autotrofo', 'parasito', 'otro'
);

CREATE TYPE media_type AS ENUM (
  'foto', 'video', 'audio', 'ilustracion'
);

CREATE TYPE org_type AS ENUM (
  'ong', 'fundacion', 'universidad', 'gobierno',
  'empresa_b', 'activismo', 'investigacion'
);

CREATE TYPE user_role AS ENUM (
  'visitante', 'colaborador', 'moderador', 'editor', 'admin'
);

CREATE TYPE protected_area_type AS ENUM (
  'parque_nacional', 'reserva_nacional', 'monumento_natural',
  'santuario_naturaleza', 'area_marina', 'sitio_ramsar', 'otro'
);

-- ============================================================
-- TABLA: regions
-- Las 16 regiones administrativas de Chile
-- ============================================================

CREATE TABLE regions (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL,
  code        TEXT NOT NULL UNIQUE,  -- e.g. 'RM', 'LR', 'MA'
  number      TEXT,                   -- e.g. 'XV', 'I', 'XIII'
  capital     TEXT,
  boundary    GEOMETRY(MULTIPOLYGON, 4326),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_regions_boundary ON regions USING GIST (boundary);
CREATE INDEX idx_regions_code ON regions (code);

-- ============================================================
-- TABLA: ecosystems
-- Ecosistemas principales de Chile
-- ============================================================

CREATE TABLE ecosystems (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name         TEXT NOT NULL,
  slug         TEXT NOT NULL UNIQUE,
  climate_type TEXT,
  description  TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLA: protected_areas
-- SNASPE: Parques, Reservas, Monumentos Naturales
-- ============================================================

CREATE TABLE protected_areas (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL,
  type        protected_area_type NOT NULL,
  region_id   UUID REFERENCES regions(id),
  area_ha     NUMERIC,               -- Superficie en hectáreas
  created_year INT,
  boundary    GEOMETRY(MULTIPOLYGON, 4326),
  conaf_url   TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_protected_areas_boundary ON protected_areas USING GIST (boundary);
CREATE INDEX idx_protected_areas_region ON protected_areas (region_id);

-- ============================================================
-- TABLA: species  (TABLA CENTRAL)
-- ============================================================

CREATE TABLE species (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug                TEXT NOT NULL UNIQUE,
  common_name         TEXT NOT NULL,
  scientific_name     TEXT NOT NULL,
  alternative_names   TEXT[],
  indigenous_names    JSONB,    -- [{language, name, meaning}]
  type                species_type NOT NULL,
  taxonomy            JSONB NOT NULL,  -- {kingdom, phylum, class, order, family, genus, species}

  -- Estado de conservación
  uicn_status         uicn_status,
  uicn_year           INT,
  uicn_url            TEXT,
  chile_status        chile_status,
  chile_decree        TEXT,            -- Número del decreto DS
  population_trend    population_trend DEFAULT 'desconocida',
  estimated_population TEXT,           -- Descripción libre: "menos de 2.500 individuos"
  is_endemic          BOOLEAN DEFAULT FALSE,
  is_national_symbol  BOOLEAN DEFAULT FALSE,
  cites_appendix      TEXT,            -- 'I', 'II', 'III', NULL

  -- Distribución
  altitude_min        INT,
  altitude_max        INT,
  countries           TEXT[],

  -- Biología
  type_diet           diet_type,
  diet_description    TEXT,
  size_data           JSONB,   -- {height_cm, length_cm, weight_kg, wingspan_cm, ...}
  size_category       size_category,
  weight_kg_avg       NUMERIC,
  lifespan_years      INT,
  active_period       active_period,
  danger_level        danger_level DEFAULT 'ninguno',
  colors              TEXT[],  -- Para filtro visual

  -- Contenido editorial
  description         TEXT NOT NULL,
  fun_facts           JSONB,   -- [{text, source}]
  ecosystem_role      TEXT,
  trophic_relations   JSONB,   -- {depends_on, feeds_on, benefits, special}
  cascade_collapse    TEXT,    -- ¿Qué pasa si desaparece?
  human_impact_daily  TEXT,    -- Impacto en vida cotidiana
  ecosystem_services  JSONB,   -- [{type, description}]
  threats_local       JSONB,   -- [{name, magnitude, description}]
  threats_global      JSONB,   -- [{name, magnitude, description}]
  threats_future      TEXT,
  conservation_measures TEXT,
  visitor_tips        TEXT,
  resident_tips       TEXT,
  emergency_contacts  JSONB,   -- [{region, org, phone, url}]

  -- Metadata
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW(),
  published           BOOLEAN DEFAULT FALSE,
  featured            BOOLEAN DEFAULT FALSE
);

-- Índices para búsqueda
CREATE INDEX idx_species_slug ON species (slug);
CREATE INDEX idx_species_type ON species (type);
CREATE INDEX idx_species_uicn ON species (uicn_status);
CREATE INDEX idx_species_chile ON species (chile_status);
CREATE INDEX idx_species_endemic ON species (is_endemic);
CREATE INDEX idx_species_published ON species (published);

-- Índice de búsqueda por texto (nombre común + científico)
CREATE INDEX idx_species_search ON species
  USING GIN (to_tsvector('spanish', common_name || ' ' || scientific_name));

-- Índice de búsqueda por similitud (para autocompletado)
CREATE INDEX idx_species_trgm_common ON species USING GIN (common_name gin_trgm_ops);
CREATE INDEX idx_species_trgm_scientific ON species USING GIN (scientific_name gin_trgm_ops);

-- ============================================================
-- TABLAS DE UNIÓN: Especie ↔ Región / Ecosistema / Área
-- ============================================================

CREATE TABLE species_regions (
  species_id  UUID REFERENCES species(id) ON DELETE CASCADE,
  region_id   UUID REFERENCES regions(id) ON DELETE CASCADE,
  PRIMARY KEY (species_id, region_id)
);

CREATE TABLE species_ecosystems (
  species_id    UUID REFERENCES species(id) ON DELETE CASCADE,
  ecosystem_id  UUID REFERENCES ecosystems(id) ON DELETE CASCADE,
  PRIMARY KEY (species_id, ecosystem_id)
);

CREATE TABLE species_protected_areas (
  species_id  UUID REFERENCES species(id) ON DELETE CASCADE,
  area_id     UUID REFERENCES protected_areas(id) ON DELETE CASCADE,
  PRIMARY KEY (species_id, area_id)
);

-- ============================================================
-- TABLA: media
-- Fotografías, videos y audios de cada especie
-- ============================================================

CREATE TABLE media (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  species_id     UUID NOT NULL REFERENCES species(id) ON DELETE CASCADE,
  type           media_type NOT NULL DEFAULT 'foto',
  url            TEXT NOT NULL,
  thumbnail_url  TEXT,
  credit         TEXT NOT NULL,           -- Crédito obligatorio
  license        TEXT,                    -- CC-BY, CC-BY-SA, etc.
  caption        TEXT,
  is_primary     BOOLEAN DEFAULT FALSE,   -- Foto principal de la ficha
  is_community   BOOLEAN DEFAULT FALSE,   -- Foto subida por usuario
  user_id        UUID,                    -- Si es community
  location       GEOMETRY(POINT, 4326),  -- Dónde fue tomada
  taken_at       TIMESTAMPTZ,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_media_species ON media (species_id);
CREATE INDEX idx_media_primary ON media (species_id, is_primary);
CREATE INDEX idx_media_location ON media USING GIST (location);

-- ============================================================
-- TABLA: users
-- ============================================================

CREATE TABLE users (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email        TEXT NOT NULL UNIQUE,
  name         TEXT NOT NULL,
  role         user_role DEFAULT 'visitante',
  region_code  TEXT REFERENCES regions(code),
  avatar_url   TEXT,
  bio          TEXT,
  sightings_count INT DEFAULT 0,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  last_seen    TIMESTAMPTZ
);

CREATE INDEX idx_users_email ON users (email);
CREATE INDEX idx_users_role ON users (role);

-- ============================================================
-- TABLA: sightings
-- Avistamientos ciudadanos verificados
-- ============================================================

CREATE TABLE sightings (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  species_id   UUID NOT NULL REFERENCES species(id) ON DELETE CASCADE,
  user_id      UUID REFERENCES users(id),
  location     GEOMETRY(POINT, 4326) NOT NULL,
  region_code  TEXT,
  observed_at  TIMESTAMPTZ NOT NULL,
  photo_url    TEXT,
  notes        TEXT,
  verified     BOOLEAN DEFAULT FALSE,
  verified_by  UUID REFERENCES users(id),
  verified_at  TIMESTAMPTZ,
  gbif_id      TEXT,        -- ID en GBIF si viene de ahí
  inaturalist_id TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_sightings_species ON sightings (species_id);
CREATE INDEX idx_sightings_location ON sightings USING GIST (location);
CREATE INDEX idx_sightings_user ON sightings (user_id);
CREATE INDEX idx_sightings_verified ON sightings (verified);
CREATE INDEX idx_sightings_date ON sightings (observed_at DESC);

-- ============================================================
-- TABLA: organizations
-- Fundaciones, ONG, universidades, activistas
-- ============================================================

CREATE TABLE organizations (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL,
  type        org_type NOT NULL,
  url         TEXT,
  email       TEXT,
  description TEXT,
  logo_url    TEXT,
  region_id   UUID REFERENCES regions(id),
  national    BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE species_organizations (
  species_id  UUID REFERENCES species(id) ON DELETE CASCADE,
  org_id      UUID REFERENCES organizations(id) ON DELETE CASCADE,
  role        TEXT,  -- 'conservacion', 'investigacion', 'rescate', etc.
  PRIMARY KEY (species_id, org_id)
);

-- ============================================================
-- TABLA: laws
-- Leyes y decretos chilenos que protegen especies
-- ============================================================

CREATE TABLE laws (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL,
  number      TEXT NOT NULL UNIQUE,  -- e.g. '19.473', 'DS-41-2023'
  year        INT NOT NULL,
  type        TEXT,   -- 'ley', 'decreto', 'convenio_internacional'
  description TEXT,
  url         TEXT,   -- Enlace a BCN
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE species_laws (
  species_id  UUID REFERENCES species(id) ON DELETE CASCADE,
  law_id      UUID REFERENCES laws(id) ON DELETE CASCADE,
  notes       TEXT,
  PRIMARY KEY (species_id, law_id)
);

-- ============================================================
-- TABLA: petitions
-- Firmas y convocatorias activas
-- ============================================================

CREATE TABLE petitions (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  species_id  UUID REFERENCES species(id) ON DELETE SET NULL,
  title       TEXT NOT NULL,
  description TEXT,
  url         TEXT NOT NULL,
  platform    TEXT,  -- 'change.org', 'avaaz', 'propia', etc.
  target      TEXT,  -- A quién va dirigida
  signatures  INT,
  active      BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  expires_at  TIMESTAMPTZ
);

CREATE INDEX idx_petitions_species ON petitions (species_id);
CREATE INDEX idx_petitions_active ON petitions (active);

-- ============================================================
-- FUNCIÓN: Actualizar updated_at automáticamente
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_species_updated_at
  BEFORE UPDATE ON species
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- FUNCIÓN: Búsqueda de especies
-- Full-text + trigram combinados
-- ============================================================

CREATE OR REPLACE FUNCTION search_species(
  query TEXT,
  limit_n INT DEFAULT 20,
  offset_n INT DEFAULT 0
)
RETURNS TABLE (
  id UUID, slug TEXT, common_name TEXT,
  scientific_name TEXT, type species_type,
  uicn_status uicn_status, rank REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    s.id, s.slug, s.common_name, s.scientific_name, s.type, s.uicn_status,
    GREATEST(
      similarity(s.common_name, query),
      similarity(s.scientific_name, query)
    ) AS rank
  FROM species s
  WHERE
    s.published = TRUE AND (
      s.common_name ILIKE '%' || query || '%' OR
      s.scientific_name ILIKE '%' || query || '%' OR
      similarity(s.common_name, query) > 0.2 OR
      similarity(s.scientific_name, query) > 0.2
    )
  ORDER BY rank DESC
  LIMIT limit_n OFFSET offset_n;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- VISTA: species_summary
-- Vista optimizada para listados y tarjetas del mapa
-- ============================================================

CREATE VIEW species_summary AS
SELECT
  s.id,
  s.slug,
  s.common_name,
  s.scientific_name,
  s.type,
  s.uicn_status,
  s.chile_status,
  s.is_endemic,
  s.size_category,
  s.danger_level,
  s.colors,
  s.featured,
  (SELECT url FROM media WHERE species_id = s.id AND is_primary = TRUE LIMIT 1) AS primary_photo,
  (SELECT credit FROM media WHERE species_id = s.id AND is_primary = TRUE LIMIT 1) AS photo_credit,
  (SELECT array_agg(r.code) FROM species_regions sr JOIN regions r ON r.id = sr.region_id WHERE sr.species_id = s.id) AS region_codes,
  (SELECT array_agg(e.slug) FROM species_ecosystems se JOIN ecosystems e ON e.id = se.ecosystem_id WHERE se.species_id = s.id) AS ecosystem_slugs,
  (SELECT COUNT(*) FROM sightings WHERE species_id = s.id AND verified = TRUE) AS verified_sightings
FROM species s
WHERE s.published = TRUE;
