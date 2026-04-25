export interface Guide {
  slug: string
  title: string
  description: string
  category: 'Naturaleza' | 'Vida cotidiana' | 'Comunidad'
  difficulty: 'Fácil' | 'Moderado' | 'Avanzado'
  estimatedTime: string
  imageUrl: string
  steps: string[]
  contact?: { label: string; href: string }
}

export const guides: Guide[] = [
  {
    slug: 'reportar-avistamiento-especie-amenazada',
    title: 'Cómo reportar un avistamiento de especie amenazada',
    description:
      'Si encuentras un animal herido o ves una especie en peligro, estos son los pasos y contactos correctos para reportarlo y asegurar que la información llegue a quien puede ayudar de verdad.',
    category: 'Naturaleza',
    difficulty: 'Fácil',
    estimatedTime: '10 min',
    imageUrl:
      'https://inaturalist-open-data.s3.amazonaws.com/photos/1865294/medium.jpg',
    steps: [
      'Fotografía el animal sin acercarte ni perturbarlo.',
      'Anota la ubicación exacta con coordenadas GPS.',
      'Llama al SAG: 600 450 4200.',
      'Reporta en Rayen con foto y ubicación para que quede registrado.',
    ],
    contact: { label: 'SAG — 600 450 4200', href: 'tel:6004504200' },
  },
  {
    slug: 'fauna-silvestre-herida',
    title: 'Qué hacer si encuentras fauna silvestre herida',
    description:
      'No toques al animal. Actuar correctamente marca la diferencia entre la vida y la muerte de un animal silvestre. Estas organizaciones de rescate pueden ayudarte en todo Chile.',
    category: 'Naturaleza',
    difficulty: 'Fácil',
    estimatedTime: '5 min',
    imageUrl:
      'https://inaturalist-open-data.s3.amazonaws.com/photos/263624688/medium.jpg',
    steps: [
      'Mantén distancia y evita el contacto directo.',
      'Fotografía al animal y anota su ubicación exacta.',
      'Llama al CONAF (130) para orientación inmediata.',
      'Si está en zona urbana, puedes contenerlo con una caja ventilada mientras llega ayuda.',
    ],
    contact: { label: 'CONAF — conaf.cl/contacto', href: 'https://www.conaf.cl' },
  },
  {
    slug: 'denunciar-tala-ilegal',
    title: 'Cómo denunciar tala ilegal o daño ambiental',
    description:
      'La tala ilegal es uno de los principales daños a la biodiversidad. Puedes denunciarla de forma anónima y efectiva a través de los canales oficiales disponibles en Chile.',
    category: 'Comunidad',
    difficulty: 'Moderado',
    estimatedTime: '15 min',
    imageUrl:
      'https://images.unsplash.com/photo-1448375240586-882707db888b?w=900&q=80',
    steps: [
      'Documenta con fotos y video sin exponerte a riesgos.',
      'Anota coordenadas GPS del lugar afectado.',
      'Denuncia formalmente en la Superintendencia del Medio Ambiente (SMA).',
      'Puedes denunciar de forma anónima por formulario online.',
    ],
    contact: {
      label: 'SMA — sma.gob.cl/denuncias',
      href: 'https://www.sma.gob.cl/index.php/sma/denuncias',
    },
  },
  {
    slug: 'plantas-nativas-jardin',
    title: 'Plantas nativas para tu jardín o balcón',
    description:
      'Plantar especies nativas atrae fauna local, consume menos agua y fortalece el ecosistema de tu barrio. Un acto pequeño con un impacto enorme para la biodiversidad urbana.',
    category: 'Vida cotidiana',
    difficulty: 'Fácil',
    estimatedTime: '30 min',
    imageUrl:
      'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=900&q=80',
    steps: [
      'Elige especies de tu región: Copihue, Quillay, Boldo, Maqui o Peumo.',
      'Consulta el vivero CONAF más cercano para obtener plantas certificadas.',
      'Evita plaguicidas — atrae polinizadores nativos como abejas y mariposas.',
      'Registra las especies que lleguen a tu jardín en iNaturalist.',
    ],
    contact: { label: 'CONAF — viveros', href: 'https://www.conaf.cl' },
  },
  {
    slug: 'ciencia-ciudadana',
    title: 'Cómo participar en ciencia ciudadana',
    description:
      'Tu celular es una herramienta científica. Estas plataformas usan tus observaciones para investigar la biodiversidad. Cada foto que tomas puede convertirse en datos valiosos para la ciencia.',
    category: 'Comunidad',
    difficulty: 'Fácil',
    estimatedTime: '20 min',
    imageUrl:
      'https://images.unsplash.com/photo-1502581827181-9cf3c3ee0106?w=900&q=80',
    steps: [
      'Descarga iNaturalist y fotografía especies en tu entorno cotidiano.',
      'Para aves, usa eBird Chile — muy valorado por la comunidad científica.',
      'Participa en los bioblitz del Museo de Historia Natural de Chile.',
      'Tus registros alimentan bases de datos científicas como GBIF.',
    ],
    contact: {
      label: 'iNaturalist — inaturalist.org',
      href: 'https://www.inaturalist.org/observations?place_id=7259',
    },
  },
  {
    slug: 'voluntariado-organizaciones',
    title: 'Organizaciones donde puedes ser voluntario',
    description:
      'Estas organizaciones buscan voluntarios para trabajo de campo, educación ambiental y conservación activa. Tu tiempo tiene un valor incalculable para la biodiversidad chilena.',
    category: 'Comunidad',
    difficulty: 'Moderado',
    estimatedTime: '60 min',
    imageUrl:
      'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=900&q=80',
    steps: [
      'WWF Chile: campañas de conservación y voluntariado nacional.',
      'Fundación Plantemos para el Planeta: reforestación en zonas quemadas.',
      'CODEFF: defensa legal y rescate de fauna nativa.',
      'Rewilding Chile: restauración de ecosistemas en la Patagonia.',
    ],
    contact: { label: 'WWF Chile — wwf.cl', href: 'https://www.wwf.cl' },
  },
]

export function getGuideBySlug(slug: string): Guide | undefined {
  return guides.find(g => g.slug === slug)
}
