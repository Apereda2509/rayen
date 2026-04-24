-- ============================================================
-- RAYEN — Migración 004: Educación
-- Tablas: articulos, presentaciones, glosario
-- ============================================================

CREATE TABLE IF NOT EXISTS articulos (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug           TEXT UNIQUE NOT NULL,
  titulo         TEXT NOT NULL,
  subtitulo      TEXT,
  contenido      TEXT NOT NULL,
  imagen_url     TEXT,
  tiempo_lectura INTEGER DEFAULT 5,
  published      BOOLEAN DEFAULT FALSE,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS presentaciones (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug       TEXT UNIQUE NOT NULL,
  titulo     TEXT NOT NULL,
  species_id UUID REFERENCES species(id) ON DELETE SET NULL,
  nivel      TEXT NOT NULL CHECK (nivel IN ('kinder', 'basica', 'media_baja', 'media_alta')),
  slides     JSONB NOT NULL,
  published  BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS glosario (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  termino    TEXT NOT NULL,
  definicion TEXT NOT NULL,
  nivel      TEXT DEFAULT 'general',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_presentaciones_nivel   ON presentaciones(nivel);
CREATE INDEX IF NOT EXISTS idx_presentaciones_species ON presentaciones(species_id);
CREATE INDEX IF NOT EXISTS idx_articulos_published    ON articulos(published);

-- ── Seed: Presentaciones del Huemul ─────────────────────────
-- species_id se resuelve por slug para mantener el seed portable entre entornos.
-- ON CONFLICT DO UPDATE garantiza que un re-run actualiza species_id si antes era NULL.

INSERT INTO presentaciones (slug, titulo, nivel, species_id, slides) VALUES
('huemul-kinder', 'El Huemul', 'kinder',
 (SELECT id FROM species WHERE slug = 'huemul'),
 '[
  {"titulo": "El huemul", "texto": "El huemul es un ciervo que vive en las montañas de Chile. Es grande, café y tiene cuernos.", "imagen_url": "https://static.inaturalist.org/photos/236504721/large.jpeg"},
  {"titulo": "En el escudo de Chile", "texto": "El huemul está en el escudo de Chile. ¡Es uno de los animales más importantes del país!", "imagen_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/78/Escudo_de_armas_de_Chile.svg/800px-Escudo_de_armas_de_Chile.svg.png"},
  {"titulo": "Necesita ayuda", "texto": "Hoy quedan muy pocos huemules. Necesitan nuestra ayuda para sobrevivir.", "imagen_url": "https://static.inaturalist.org/photos/236504721/large.jpeg"},
  {"titulo": "¡Dibuja un huemul!", "texto": "¿Puedes dibujar un huemul? Coloréalo de café con el paisaje de montaña.", "tipo": "actividad"}
]'::jsonb),

('huemul-basica', 'El Huemul', 'basica',
 (SELECT id FROM species WHERE slug = 'huemul'),
 '[
  {"titulo": "¿Dónde vive?", "texto": "El huemul vive en la Patagonia chilena y argentina. Le gustan los bosques fríos y las montañas nevadas.", "imagen_url": "https://static.inaturalist.org/photos/236504721/large.jpeg"},
  {"titulo": "En el escudo de Chile", "texto": "Está en el escudo de Chile junto al cóndor. Pero hoy está en peligro de desaparecer.", "imagen_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/78/Escudo_de_armas_de_Chile.svg/800px-Escudo_de_armas_de_Chile.svg.png"},
  {"titulo": "¿Por qué está en peligro?", "texto": "Perdió su hogar cuando los bosques fueron talados. Los perros domésticos también los atacan.", "imagen_url": "https://static.inaturalist.org/photos/236504721/large.jpeg"},
  {"titulo": "Quedan muy pocos", "texto": "Quedan menos de 2.000 huemules en el mundo. Científicos y guardaparques trabajan para protegerlos.", "imagen_url": "https://static.inaturalist.org/photos/236504721/large.jpeg"},
  {"titulo": "¿Qué puedes hacer tú?", "texto": "¿Qué podrías hacer para ayudar a proteger al huemul?", "tipo": "pregunta"}
]'::jsonb),

('huemul-media-baja', 'El Huemul', 'media_baja',
 (SELECT id FROM species WHERE slug = 'huemul'),
 '[
  {"titulo": "Hippocamelus bisulcus", "texto": "Estado UICN: En Peligro (EN). Población estimada: menos de 2.000 individuos.", "imagen_url": "https://static.inaturalist.org/photos/236504721/large.jpeg"},
  {"titulo": "Distribución", "texto": "Andes patagónicos entre el Biobío y Magallanes. Hábitat: bosque templado, matorrales de alta montaña, zonas de nieve.", "imagen_url": "https://static.inaturalist.org/photos/236504721/large.jpeg"},
  {"titulo": "Amenazas", "lista": ["Pérdida y fragmentación del hábitat", "Depredación por perros domésticos", "Enfermedades transmitidas por ganado", "Caza histórica (hoy prohibida)"], "imagen_url": "https://static.inaturalist.org/photos/236504721/large.jpeg"},
  {"titulo": "Protección legal", "texto": "Protegido por la Ley de Caza (Ley 19.473). Programas de monitoreo en Torres del Paine y Lago Cochrane.", "imagen_url": "https://static.inaturalist.org/photos/236504721/large.jpeg"},
  {"titulo": "Para analizar", "texto": "¿Por qué la fragmentación del hábitat es tan dañina para una especie como el huemul?", "tipo": "pregunta"}
]'::jsonb),

('huemul-media-alta', 'El Huemul', 'media_alta',
 (SELECT id FROM species WHERE slug = 'huemul'),
 '[
  {"titulo": "Taxonomía y estado", "texto": "Hippocamelus bisulcus (Molina, 1782). Orden: Artiodactyla — Familia: Cervidae. Estado IUCN: EN — Tendencia: decreciente.", "imagen_url": "https://static.inaturalist.org/photos/236504721/large.jpeg"},
  {"titulo": "Colapso poblacional", "texto": "La población se redujo más del 90% en el siglo XX. El ganado transmite Neospora caninum y otras enfermedades al huemul sin inmunidad adaptada.", "imagen_url": "https://static.inaturalist.org/photos/236504721/large.jpeg"},
  {"titulo": "Marco legal", "lista": ["Ley 19.473: especie prohibida de cazar", "DS 151/2007: clasificado En Peligro por el MMA", "Apéndice I del CITES: comercio internacional prohibido"], "imagen_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/78/Escudo_de_armas_de_Chile.svg/800px-Escudo_de_armas_de_Chile.svg.png"},
  {"titulo": "Indicador ecosistémico", "texto": "Su presencia indica bosques templados intactos. Su desaparición señala colapso del ecosistema andino-patagónico.", "imagen_url": "https://static.inaturalist.org/photos/236504721/large.jpeg"},
  {"titulo": "Debate", "texto": "¿Es suficiente la protección legal sin recuperación del hábitat? ¿Qué rol juega la comunidad local en la conservación efectiva?", "tipo": "debate"}
]'::jsonb)

ON CONFLICT (slug) DO UPDATE SET
  species_id = EXCLUDED.species_id,
  slides     = EXCLUDED.slides;

-- ── Seed: Glosario ───────────────────────────────────────────

INSERT INTO glosario (termino, definicion, nivel) VALUES
('Biodiversidad',            'La variedad de vida en la Tierra — incluye todas las especies de plantas, animales, hongos y microorganismos.',                                                                     'general'),
('Ecosistema',               'Conjunto de seres vivos y su ambiente físico que interactúan entre sí. Por ejemplo, un bosque, un humedal o un arrecife.',                                                         'general'),
('En Peligro Crítico',       'El estado más grave antes de la extinción. La especie enfrenta un riesgo extremadamente alto de desaparecer.',                                                                     'general'),
('Endémica',                 'Especie que solo existe en un lugar específico del mundo y en ningún otro lugar.',                                                                                                  'general'),
('Especie invasora',         'Especie introducida fuera de su lugar de origen que se expande y daña al ecosistema local.',                                                                                        'general'),
('Fragmentación del hábitat','División del hábitat de una especie en partes pequeñas y aisladas, generalmente por actividad humana como carreteras o ciudades.',                                                 'avanzado'),
('Hábitat',                  'El lugar donde vive una especie. Incluye el espacio físico, el clima, los alimentos y las otras especies con las que convive.',                                                    'general'),
('Lista Roja',               'Inventario del estado de conservación de miles de especies elaborado por la UICN. Va desde Preocupación Menor hasta Extinta.',                                                     'general'),
('Sitio Ramsar',             'Humedal de importancia internacional protegido por el Convenio de Ramsar, un tratado internacional de conservación.',                                                               'avanzado'),
('UICN',                     'Unión Internacional para la Conservación de la Naturaleza. Organización que evalúa el estado de conservación de las especies a nivel mundial.',                                    'general')

ON CONFLICT DO NOTHING;

-- ── Seed: Artículos ──────────────────────────────────────────

INSERT INTO articulos (slug, titulo, subtitulo, contenido, tiempo_lectura, published) VALUES

('por-que-desaparece-el-huemul',
 'Por qué el huemul está desapareciendo',
 'El animal del escudo de Chile podría extinguirse en pocas décadas. Estas son las razones.',
 'El huemul (Hippocamelus bisulcus) aparece en el escudo nacional desde 1834, pero hoy quedan menos de 2.000 individuos en la naturaleza. En el siglo XX su población colapsó más de un 90% por una combinación de factores que persisten hasta hoy.

La expansión ganadera hacia el sur de Chile durante el siglo XIX y XX fue el primer golpe. Los terrenos donde vivía el huemul fueron transformados en praderas. Pero el daño más silencioso vino con el ganado mismo: los animales domésticos portan enfermedades como Neospora caninum a las que el huemul no tiene inmunidad. El contacto entre ganado y huemul ha sido devastador.

A eso se suma la depredación por perros domésticos y asilvestrados, que en áreas rurales y periurbanas de la Patagonia representan una amenaza directa especialmente para las crías.

Hoy el huemul está protegido por la Ley de Caza y figura en el Apéndice I del CITES. Existen programas de monitoreo en Torres del Paine, la Reserva Nacional Lago Cochrane y el Parque Patagonia. Pero los especialistas advierten que sin recuperación del hábitat y control del ganado en zonas aledañas a las áreas protegidas, la especie seguirá en retroceso.',
 5, TRUE),

('que-significa-estado-uicn',
 'Cómo leer el estado de conservación de una especie',
 'LC, VU, EN, CR — estas siglas determinan el futuro de miles de especies. Aquí te explicamos qué significa cada una.',
 'Cuando entras a la ficha de una especie en Rayen y ves un badge que dice "En Peligro" o "Preocupación Menor", ese dato viene de la Lista Roja de la UICN — la Unión Internacional para la Conservación de la Naturaleza.

La UICN evalúa cada especie según criterios científicos precisos: tamaño de la población, tasa de declive, extensión del hábitat y probabilidad de extinción. El resultado es una categoría que va de menos a más grave.

Preocupación Menor (LC) significa que la especie es abundante y su población está estable. No está amenazada en el corto plazo. Casi Amenazado (NT) indica que la especie está cerca de calificar como amenazada — hay que tenerla en el radar.

Vulnerable (VU), En Peligro (EN) y En Peligro Crítico (CR) son las tres categorías de amenaza. En Peligro Crítico es la más grave antes de la extinción — la especie enfrenta un riesgo extremadamente alto de desaparecer en estado silvestre.

Extinta en Estado Silvestre (EW) significa que la especie ya no existe en la naturaleza, solo en cautiverio o en cultivo. Extinta (EX) es el final: ningún individuo conocido sigue vivo.

En Chile, el Ministerio del Medio Ambiente publica su propio proceso de clasificación de especies, que sigue criterios similares a los de la UICN y se actualiza periódicamente mediante decretos supremos.',
 6, TRUE),

('ecosistemas-chilenos',
 'Los ecosistemas de Chile y por qué son únicos',
 'Chile tiene 7 zonas climáticas en menos de 4.300 kilómetros. Cada una alberga vida que no existe en ningún otro lugar.',
 'Chile es uno de los países con mayor biodiversidad por kilómetro cuadrado del planeta, y gran parte de esa riqueza se explica por su geografía extraordinaria. El desierto más árido del mundo al norte, la Antártica al sur, el Pacífico al oeste y los Andes al este crean barreras naturales que han aislado poblaciones de especies durante millones de años, generando una cantidad excepcional de especies endémicas.

El desierto de Atacama, aunque parece inhóspito, alberga vida adaptada a condiciones extremas. Las lomas costeras — ecosistemas que dependen de la neblina del Pacífico — florecen en invierno con plantas que solo existen ahí. El Parque Nacional Pan de Azúcar protege parte de este ecosistema único.

La zona mediterránea de Chile central es uno de los 36 hotspots de biodiversidad identificados a nivel mundial. El bosque esclerófilo — con quillayes, litres y boldos — es el hogar de especies como el degú, el chungungo y el zorro culpeo. Más del 70% de las plantas de esta zona son endémicas.

Hacia el sur, el bosque valdiviano o bosque templado lluvioso es el segundo bosque templado más grande del hemisferio sur. Con más de 3.000 mm de lluvia anuales en algunas zonas, alberga el alerce — el segundo árbol más longevo del mundo — y especies como el monito del monte, un marsupial considerado un fósil viviente.

La Patagonia y Tierra del Fuego completan el mosaico con estepas, turberas y canales australes de importancia global para la captura de carbono y la regulación del clima.',
 8, TRUE)

ON CONFLICT (slug) DO NOTHING;
