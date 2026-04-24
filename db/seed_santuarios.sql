-- Santuarios de la Naturaleza — seed
INSERT INTO protected_areas (name, slug, type, region_name, centroid, description, photo_url)
VALUES
  (
    'Santuario de la Naturaleza Yerba Loca',
    'santuario-yerba-loca',
    'santuario_naturaleza',
    'Metropolitana',
    ST_SetSRID(ST_MakePoint(-70.47, -33.20), 4326),
    'Ubicado en el cajón del río Yerba Loca, en las comunas de Lo Barnechea y Colina. Protege ecosistemas de alta montaña y una importante diversidad de flora y fauna andina.',
    'https://upload.wikimedia.org/wikipedia/commons/e/e8/Estero_Yerba_loca.jpg'
  ),
  (
    'Santuario de la Naturaleza Laguna El Peral',
    'santuario-laguna-el-peral',
    'santuario_naturaleza',
    'Valparaíso',
    ST_SetSRID(ST_MakePoint(-71.61, -33.58), 4326),
    'Humedal costero ubicado en El Quisco. Refugio de aves acuáticas migratorias y residentes, incluyendo especies amenazadas.',
    'https://upload.wikimedia.org/wikipedia/commons/5/5f/Laguna_el_peral.jpg'
  ),
  (
    'Santuario de la Naturaleza Carlos Anwandter',
    'santuario-carlos-anwandter',
    'santuario_naturaleza',
    'Los Ríos',
    ST_SetSRID(ST_MakePoint(-73.14, -39.77), 4326),
    'Humedal del río Cruces, cerca de Valdivia. Sitio Ramsar y hábitat crítico para el cisne de cuello negro y otras aves acuáticas.',
    'https://upload.wikimedia.org/wikipedia/commons/e/e2/Humedales_de_los_rios_cruces_y_chorocomayo_en_la_ciudad_de_Valdivia%2C_Chile_02.jpg'
  )
ON CONFLICT (slug) DO UPDATE SET
  name        = EXCLUDED.name,
  type        = EXCLUDED.type,
  region_name = EXCLUDED.region_name,
  centroid    = EXCLUDED.centroid,
  description = EXCLUDED.description,
  photo_url   = EXCLUDED.photo_url;
