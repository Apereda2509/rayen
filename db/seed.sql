-- ============================================================
-- RAYEN — Datos semilla iniciales
-- Ejecutar después de schema.sql
-- ============================================================

-- ── Regiones de Chile ────────────────────────────────────────
INSERT INTO regions (name, code, number, capital) VALUES
  ('Arica y Parinacota',        'AP', 'XV',  'Arica'),
  ('Tarapacá',                  'TA', 'I',   'Iquique'),
  ('Antofagasta',               'AN', 'II',  'Antofagasta'),
  ('Atacama',                   'AT', 'III', 'Copiapó'),
  ('Coquimbo',                  'CO', 'IV',  'La Serena'),
  ('Valparaíso',                'VA', 'V',   'Valparaíso'),
  ('Región Metropolitana',      'RM', 'XIII','Santiago'),
  ('O''Higgins',                'LI', 'VI',  'Rancagua'),
  ('Maule',                     'ML', 'VII', 'Talca'),
  ('Ñuble',                     'NB', 'XVI', 'Chillán'),
  ('Biobío',                    'BI', 'VIII','Concepción'),
  ('La Araucanía',              'AR', 'IX',  'Temuco'),
  ('Los Ríos',                  'LR', 'XIV', 'Valdivia'),
  ('Los Lagos',                 'LL', 'X',   'Puerto Montt'),
  ('Aysén',                     'AI', 'XI',  'Coyhaique'),
  ('Magallanes y la Antártica', 'MA', 'XII', 'Punta Arenas');

-- ── Ecosistemas ──────────────────────────────────────────────
INSERT INTO ecosystems (name, slug, climate_type, description) VALUES
  ('Desierto de Atacama',         'desierto_atacama',        'árido',          'El desierto más árido del mundo. Alta radiación UV, suelos salinos, fauna extremófila.'),
  ('Altiplano y Puna',            'altiplano',               'frío seco',      'Meseta andina sobre 3.500 m s.n.m. Bofedales, flamencos y caméli-dos.'),
  ('Matorral Esclerófilo',        'matorral_esclerofilo',    'mediterráneo',   'Zona central. Vegetación adaptada a sequías estivales. Quillayes, boldos, peumos.'),
  ('Bosque Valdiviano',           'bosque_valdiviano',       'templado lluvioso','Bosque lluvioso del sur. Alta biodiversidad, suelo húmedo, epifitas.'),
  ('Bosque Andino Patagónico',    'bosque_andino_patagonico','frío húmedo',    'Lenga, ñirre, coihue. Hábitat del huemul y del cóndor andino.'),
  ('Estepa Patagónica',           'estepa_patagonica',       'frío seco',      'Vientos constantes, vegetación baja, guanacos y pumas.'),
  ('Litoral Rocoso',              'litoral_rocoso',          'costero',        'Intermareal rocoso. Hábitat del chungungo. Bosques de kelp.'),
  ('Ecosistema Marino',           'marino',                  'oceánico',       'Aguas del Pacífico Sur. Corriente de Humboldt. Alta productividad.'),
  ('Canales Patagónicos',         'canales_patagonicos',     'frío húmedo',    'Archipiélagos australes. Lluvia constante. Fauna marina única.'),
  ('Cordillera de los Andes',     'andes',                   'variable',       'Eje montañoso de norte a sur. Glaciares, volcanes, hábitats verticales.'),
  ('Humedales y Bofedales',       'humedales',               'variable',       'Ecosistemas de agua. Flamencos, taguas, anfibios. Alta sensibilidad.'),
  ('Bosque de Araucarias',        'bosque_araucarias',       'subalpino',      'Pehuenerías andinas. Sustento de la cultura pehuenche.'),
  ('Antártica e Islas Oceánicas', 'antartica',               'polar',          'Ambiente extremo. Pingüinos, leopardos marinos, aves pelágicas.');

-- ── Leyes de protección ───────────────────────────────────────
INSERT INTO laws (name, number, year, type, description, url) VALUES
  ('Ley de Caza',
   '19.473', 1996, 'ley',
   'Regula la caza y captura de fauna silvestre. Prohíbe la caza de especies protegidas.',
   'https://www.bcn.cl/leychile/navegar?idNorma=76813'),

  ('Ley de Bosque Nativo',
   '20.283', 2008, 'ley',
   'Regula la recuperación del bosque nativo y el fomento forestal.',
   'https://www.bcn.cl/leychile/navegar?idNorma=277813'),

  ('Decreto Monumento Natural Araucaria',
   'DS-43-1990', 1990, 'decreto',
   'Declara a la araucaria (Araucaria araucana) Monumento Natural. Prohíbe su tala en todo el territorio.',
   'https://clasificacionespecies.mma.gob.cl'),

  ('Clasificación de Especies Silvestres',
   'DS-41-2023', 2023, 'decreto',
   'Clasificación oficial más reciente de especies en categorías de conservación.',
   'https://clasificacionespecies.mma.gob.cl'),

  ('Sistema Nacional de Áreas Silvestres Protegidas (SNASPE)',
   '18.362', 1984, 'ley',
   'Crea el SNASPE. Define parques nacionales, reservas y monumentos naturales.',
   'https://www.bcn.cl/leychile/navegar?idNorma=29892'),

  ('Ley de Humedales Urbanos',
   '21.202', 2020, 'ley',
   'Protección de humedales urbanos y su biodiversidad asociada.',
   'https://www.bcn.cl/leychile/navegar?idNorma=1142629'),

  ('Convenio sobre Diversidad Biológica',
   'CBD-1994', 1994, 'convenio_internacional',
   'Tratado internacional ratificado por Chile. Marco global para la conservación.',
   'https://www.cbd.int'),

  ('CITES — Apéndices I, II y III',
   'CITES-1975', 1975, 'convenio_internacional',
   'Convención sobre el comercio internacional de especies amenazadas.',
   'https://cites.org');

-- ── Organizaciones iniciales ──────────────────────────────────
INSERT INTO organizations (name, type, url, email, description, national) VALUES
  ('CONAF — Corporación Nacional Forestal',
   'gobierno',
   'https://conaf.cl', 'conaf@conaf.cl',
   'Administra las áreas silvestres protegidas del SNASPE y lidera la conservación forestal en Chile.',
   TRUE),

  ('Wildlife Conservation Society Chile',
   'ong',
   'https://chile.wcs.org', NULL,
   'Conservación de fauna silvestre en la Patagonia chilena. Investigación y monitoreo de huemul, chungungo y puma.',
   FALSE),

  ('Instituto de Ecología y Biodiversidad (IEB)',
   'universidad',
   'https://www.ieb-chile.cl', 'ieb@ieb-chile.cl',
   'Centro de investigación científica en biodiversidad. Produce datos y herramientas para la conservación.',
   TRUE),

  ('Tompkins Conservation Chile',
   'fundacion',
   'https://tompkinsconservation.org/chile', NULL,
   'Restauración y protección de la Patagonia chilena. Donó millones de hectáreas al Estado de Chile.',
   FALSE),

  ('Oceana Chile',
   'ong',
   'https://chile.oceana.org', NULL,
   'Conservación de ecosistemas marinos. Campañas por áreas marinas protegidas y pesca sostenible.',
   FALSE),

  ('Aves Chile',
   'ong',
   'https://aveschile.cl', NULL,
   'Sociedad chilena de ornitología. Monitoreo, educación y conservación de aves nativas.',
   TRUE),

  ('Fundación Bosque Nativo',
   'fundacion',
   'https://fundacionbosquenativo.cl', NULL,
   'Restauración y protección del bosque nativo chileno. Programas de reforestación con especies autóctonas.',
   TRUE),

  ('Universidad Austral de Chile — IES',
   'universidad',
   'https://www.uach.cl', NULL,
   'Instituto de Ciencias Ambientales y Evolutivas. Referente en investigación del bosque valdiviano y fauna del sur.',
   TRUE);
