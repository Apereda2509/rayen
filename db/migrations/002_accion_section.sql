-- ============================================================
-- RAYEN — Migración 002: Sección Acción
-- Peticiones nativas, firmas, mejoras en organizations
-- ============================================================

-- ── 1. Mejoras a tabla petitions ────────────────────────────

ALTER TABLE petitions
  ADD COLUMN IF NOT EXISTS slug            TEXT,
  ADD COLUMN IF NOT EXISTS goal            INT,
  ADD COLUMN IF NOT EXISTS signed_count    INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS image_url       TEXT,
  ADD COLUMN IF NOT EXISTS ends_at         TIMESTAMPTZ;

-- Hacemos url nullable (peticiones nativas no tienen URL externa)
ALTER TABLE petitions ALTER COLUMN url DROP NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_petitions_slug
  ON petitions (slug) WHERE slug IS NOT NULL;

-- ── 2. Mejoras a tabla organizations ────────────────────────

ALTER TABLE organizations
  ADD COLUMN IF NOT EXISTS slug    TEXT,
  ADD COLUMN IF NOT EXISTS website TEXT,
  ADD COLUMN IF NOT EXISTS phone   TEXT,
  ADD COLUMN IF NOT EXISTS active  BOOLEAN NOT NULL DEFAULT TRUE;

-- Copiar url existente a website
UPDATE organizations
  SET website = url
WHERE website IS NULL AND url IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_organizations_slug
  ON organizations (slug) WHERE slug IS NOT NULL;

-- ── 3. Tabla petition_signatures ────────────────────────────

CREATE TABLE IF NOT EXISTS petition_signatures (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  petition_id UUID NOT NULL REFERENCES petitions(id)  ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES users(id)      ON DELETE CASCADE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (petition_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_petition_sigs_petition
  ON petition_signatures (petition_id);

CREATE INDEX IF NOT EXISTS idx_petition_sigs_user
  ON petition_signatures (user_id);

-- ── 4. Trigger: sincronizar signed_count automáticamente ────

CREATE OR REPLACE FUNCTION sync_petition_signed_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE petitions SET signed_count = signed_count + 1 WHERE id = NEW.petition_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE petitions SET signed_count = GREATEST(signed_count - 1, 0) WHERE id = OLD.petition_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_petition_signed_count ON petition_signatures;

CREATE TRIGGER trigger_petition_signed_count
  AFTER INSERT OR DELETE ON petition_signatures
  FOR EACH ROW EXECUTE FUNCTION sync_petition_signed_count();
