// ============================================================
// RAYEN — TypeScript Types
// Generados desde el schema de base de datos
// ============================================================

// ── Enums ────────────────────────────────────────────────────

export type SpeciesType =
  | 'mamifero' | 'ave' | 'reptil' | 'anfibio' | 'pez'
  | 'insecto' | 'planta' | 'hongo' | 'alga' | 'otro'

export type UICNStatus = 'EX' | 'EW' | 'CR' | 'EN' | 'VU' | 'NT' | 'LC' | 'DD' | 'NE'

export type ChileStatus =
  | 'extinto' | 'en_peligro_critico' | 'en_peligro'
  | 'vulnerable' | 'rara' | 'fuera_de_peligro' | 'insuficientemente_conocida'

export type PopulationTrend = 'aumentando' | 'estable' | 'disminuyendo' | 'desconocida'
export type SizeCategory = 'micro' | 'pequeno' | 'mediano' | 'grande' | 'muy_grande'
export type DangerLevel = 'ninguno' | 'bajo' | 'moderado' | 'alto'
export type ActivePeriod = 'diurno' | 'nocturno' | 'crepuscular' | 'variable'
export type DietType = 'herbivoro' | 'carnivoro' | 'omnivoro' | 'detritívoro' | 'filtrador' | 'autotrofo' | 'parasito' | 'otro'
export type MediaType = 'foto' | 'video' | 'audio' | 'ilustracion'
export type OrgType = 'ong' | 'fundacion' | 'universidad' | 'gobierno' | 'empresa_b' | 'activismo' | 'investigacion'
export type UserRole = 'visitante' | 'colaborador' | 'moderador' | 'editor' | 'admin'
export type ProtectedAreaType = 'parque_nacional' | 'reserva_nacional' | 'monumento_natural' | 'santuario_naturaleza' | 'area_marina' | 'sitio_ramsar' | 'otro'

// ── Geografía ────────────────────────────────────────────────

export interface GeoPoint {
  lat: number
  lng: number
}

export interface Region {
  id: string
  name: string
  code: string
  number: string
  capital: string
}

export interface Ecosystem {
  id: string
  name: string
  slug: string
  climateType: string
  description: string
}

export interface ProtectedArea {
  id: string
  name: string
  type: ProtectedAreaType
  regionId: string
  areaHa?: number
  createdYear?: number
  conafUrl?: string
}

// ── Media ────────────────────────────────────────────────────

export interface Media {
  id: string
  speciesId: string
  type: MediaType
  url: string
  thumbnailUrl?: string
  credit: string
  license?: string
  caption?: string
  isPrimary: boolean
  isCommunity: boolean
  userId?: string
  location?: GeoPoint
  takenAt?: string
  createdAt: string
}

// ── Taxonomía ────────────────────────────────────────────────

export interface Taxonomy {
  kingdom: string
  phylum: string
  class: string
  order: string
  family: string
  genus: string
  species: string
}

export interface IndigenousName {
  language: string   // 'mapudungun', 'aymara', 'quechua', etc.
  name: string
  meaning?: string
}

// ── Datos biológicos ─────────────────────────────────────────

export interface SizeData {
  lengthCm?: number
  heightCm?: number
  weightKg?: number | { min: number; max: number }
  wingspanCm?: number
  note?: string
}

export interface FunFact {
  text: string
  source?: string
}

// ── Amenazas ─────────────────────────────────────────────────

export interface Threat {
  name: string
  magnitude: 'muy_alta' | 'alta' | 'media' | 'baja'
  description: string
  isLocal?: boolean
}

// ── Servicios ecosistémicos ───────────────────────────────────

export interface EcosystemService {
  type: 'regulacion_hidrica' | 'alimentacion' | 'turismo' | 'salud' | 'cultura' | 'captura_carbono' | 'polinizacion' | 'otro'
  description: string
}

export interface TrophicRelations {
  dependsOn: string[]
  feedsOn: string[]
  benefitsTo: string[]
  special?: string
}

// ── Contactos de emergencia ───────────────────────────────────

export interface EmergencyContact {
  region: string
  org: string
  phone?: string
  url?: string
}

// ── ESPECIE (tipo principal) ──────────────────────────────────

export interface Species {
  id: string
  slug: string
  commonName: string
  scientificName: string
  alternativeNames?: string[]
  indigenousNames?: IndigenousName[]
  type: SpeciesType
  taxonomy: Taxonomy

  // Conservación
  uicnStatus?: UICNStatus
  uicnYear?: number
  uicnUrl?: string
  chileStatus?: ChileStatus
  chileDecree?: string
  populationTrend: PopulationTrend
  estimatedPopulation?: string
  isEndemic: boolean
  isNationalSymbol: boolean
  citesAppendix?: 'I' | 'II' | 'III'

  // Distribución
  altitudeMin?: number
  altitudeMax?: number
  countries?: string[]
  regionCodes: string[]
  ecosystemSlugs: string[]
  protectedAreaIds?: string[]

  // Biología
  typeDiet?: DietType
  dietDescription?: string
  sizeData?: SizeData
  sizeCategory?: SizeCategory
  weightKgAvg?: number
  lifespanYears?: number
  activePeriod?: ActivePeriod
  dangerLevel: DangerLevel
  colors: string[]

  // Contenido
  description: string
  funFacts?: FunFact[]
  ecosystemRole?: string
  trophicRelations?: TrophicRelations
  cascadeCollapse?: string
  humanImpactDaily?: string
  ecosystemServices?: EcosystemService[]
  threatsLocal?: Threat[]
  threatsGlobal?: Threat[]
  threatsFuture?: string
  conservationMeasures?: string
  visitorTips?: string
  residentTips?: string
  emergencyContacts?: EmergencyContact[]

  // Relaciones
  media?: Media[]
  organizations?: Organization[]
  laws?: Law[]
  petitions?: Petition[]

  // Meta
  createdAt: string
  updatedAt: string
  published: boolean
  featured: boolean
}

// ── Vista resumida (para listados y mapa) ─────────────────────

export interface SpeciesSummary {
  id: string
  slug: string
  commonName: string
  scientificName: string
  type: SpeciesType
  uicnStatus?: UICNStatus
  chileStatus?: ChileStatus
  isEndemic: boolean
  sizeCategory?: SizeCategory
  dangerLevel: DangerLevel
  colors: string[]
  featured: boolean
  primaryPhoto?: string
  photoCredit?: string
  regionCodes: string[]
  ecosystemSlugs: string[]
  verifiedSightings: number
}

// ── Avistamientos ────────────────────────────────────────────

export interface Sighting {
  id: string
  speciesId: string
  userId?: string
  location: GeoPoint
  regionCode?: string
  observedAt: string
  photoUrl?: string
  notes?: string
  verified: boolean
  verifiedBy?: string
  verifiedAt?: string
  gbifId?: string
  inaturalistId?: string
  createdAt: string

  // Relacionados (opcionales, depende de la query)
  species?: SpeciesSummary
  user?: Pick<User, 'id' | 'name' | 'avatarUrl'>
}

export interface CreateSightingInput {
  speciesId: string
  location: GeoPoint
  observedAt: string
  photoUrl?: string
  notes?: string
}

// ── Organizaciones ───────────────────────────────────────────

export interface Organization {
  id: string
  name: string
  type: OrgType
  url?: string
  email?: string
  description?: string
  logoUrl?: string
  regionId?: string
  national: boolean
}

// ── Leyes ────────────────────────────────────────────────────

export interface Law {
  id: string
  name: string
  number: string
  year: number
  type: string
  description?: string
  url?: string
}

// ── Peticiones ───────────────────────────────────────────────

export interface Petition {
  id: string
  speciesId?: string
  title: string
  description?: string
  url: string
  platform?: string
  target?: string
  signatures?: number
  active: boolean
  createdAt: string
  expiresAt?: string
}

// ── Usuarios ─────────────────────────────────────────────────

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  regionCode?: string
  avatarUrl?: string
  bio?: string
  sightingsCount: number
  createdAt: string
  lastSeen?: string
}

// ── Filtros del motor de búsqueda ────────────────────────────

export interface SpeciesFilters {
  type?: SpeciesType[]
  uicnStatus?: UICNStatus[]
  chileStatus?: ChileStatus[]
  isEndemic?: boolean
  regionCodes?: string[]
  ecosystemSlugs?: string[]
  colors?: string[]
  sizeCategory?: SizeCategory[]
  dangerLevel?: DangerLevel[]
  activePeriod?: ActivePeriod[]
  query?: string
  featured?: boolean
  page?: number
  limit?: number
}

export interface SpeciesSearchResult {
  data: SpeciesSummary[]
  total: number
  page: number
  limit: number
  hasMore: boolean
}

// ── Respuestas API ────────────────────────────────────────────

export interface APIResponse<T> {
  data: T
  error?: string
}

export interface APIError {
  error: string
  code?: string
  details?: unknown
}

// ── Constantes de UI ─────────────────────────────────────────

export const UICN_LABELS: Record<UICNStatus, string> = {
  EX:  'Extinto',
  EW:  'Extinto en la naturaleza',
  CR:  'En peligro crítico',
  EN:  'En peligro',
  VU:  'Vulnerable',
  NT:  'Casi amenazada',
  LC:  'Preocupación menor',
  DD:  'Datos insuficientes',
  NE:  'No evaluada',
}

export const UICN_COLORS: Record<UICNStatus, string> = {
  EX:  '#000000',
  EW:  '#4B1528',
  CR:  '#D85A30',
  EN:  '#D85A30',
  VU:  '#F59E0B',
  NT:  '#78716C',
  LC:  '#00E676',
  DD:  '#888780',
  NE:  '#D3D1C7',
}

export const SPECIES_TYPE_LABELS: Record<SpeciesType, string> = {
  mamifero: 'Mamífero',
  ave:      'Ave',
  reptil:   'Reptil',
  anfibio:  'Anfibio',
  pez:      'Pez',
  insecto:  'Insecto',
  planta:   'Planta',
  hongo:    'Hongo',
  alga:     'Alga',
  otro:     'Otro',
}
