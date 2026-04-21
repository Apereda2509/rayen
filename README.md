# Rayen — Fase 2: Setup del proyecto

> Chile florece cuando lo conocemos.

## Requisitos previos

- Node.js 20+
- PostgreSQL 15+ con extensión PostGIS instalada
- Cuenta en [Supabase](https://supabase.com) (recomendado) o PostgreSQL propio
- Cuenta en [Mapbox](https://mapbox.com) (tier gratuito cubre el MVP)
- Cuenta en [Vercel](https://vercel.com) para deploy (tier gratuito)

## Setup inicial

### 1. Clonar e instalar dependencias

```bash
git clone https://github.com/tu-usuario/rayen.git
cd rayen
npm install
```

### 2. Configurar variables de entorno

```bash
cp .env.local.example .env.local
# Editar .env.local con tus credenciales
```

### 3. Crear la base de datos

**Opción A — Supabase (recomendado para el MVP):**
1. Crear proyecto en supabase.com
2. Ir a Settings → Database → Connection string
3. Copiar la URL al campo `DATABASE_URL` en `.env.local`
4. En el SQL Editor de Supabase, ejecutar:
   ```sql
   -- Habilitar PostGIS (ya viene incluido en Supabase)
   CREATE EXTENSION IF NOT EXISTS postgis;
   ```

**Opción B — PostgreSQL local:**
```bash
createdb rayen
psql rayen -c "CREATE EXTENSION postgis;"
```

### 4. Ejecutar el schema y seed

```bash
npm run db:push   # Crea todas las tablas
npm run db:seed   # Carga regiones, ecosistemas y leyes
```

### 5. Cargar las fichas piloto

```bash
# Convertir los JSON de las 5 especies piloto a la base de datos
node scripts/import-pilot-species.js
```

### 6. Iniciar el servidor de desarrollo

```bash
npm run dev
# Abrir http://localhost:3000
```

---

## Estructura del proyecto

```
rayen/
├── app/                    # Next.js 14 App Router
│   ├── layout.tsx          # Layout principal con Navbar
│   ├── page.tsx            # Home page
│   ├── mapa/               # Mapa interactivo
│   │   └── page.tsx
│   ├── especies/           # Listado con filtros
│   │   ├── page.tsx
│   │   └── [slug]/         # Ficha de especie
│   │       └── page.tsx
│   ├── comunidad/          # Avistamientos ciudadanos
│   ├── accion/             # Peticiones y legislación
│   ├── educacion/          # Portal educativo
│   └── api/                # API REST
│       ├── species/        # GET /api/species
│       │   └── [slug]/     # GET /api/species/:slug
│       └── sightings/      # POST /api/sightings
│
├── components/
│   ├── map/                # Componentes del mapa (Mapbox)
│   │   ├── RayenMap.tsx
│   │   ├── SpeciesMarker.tsx
│   │   └── MapFilters.tsx
│   ├── species/            # Componentes de especie
│   │   ├── SpeciesCard.tsx
│   │   ├── ConservationBadge.tsx
│   │   ├── SpeciesGallery.tsx
│   │   └── EcosystemChain.tsx
│   ├── ui/                 # Componentes genéricos
│   │   ├── Navbar.tsx
│   │   ├── Footer.tsx
│   │   ├── SearchBar.tsx
│   │   └── FilterPanel.tsx
│   └── community/          # Componentes de comunidad
│       ├── SightingForm.tsx
│       └── SightingCard.tsx
│
├── lib/
│   ├── types.ts            # TypeScript types (fuente de verdad)
│   ├── db.ts               # Conexión y queries PostgreSQL
│   └── utils.ts            # Utilidades (cn, formatDate, etc.)
│
├── hooks/
│   ├── useSpecies.ts       # SWR hook para especies
│   └── useFilters.ts       # Estado de los filtros
│
├── db/
│   ├── schema.sql          # Schema completo PostgreSQL + PostGIS
│   └── seed.sql            # Datos iniciales (regiones, leyes, orgs)
│
└── data/
    └── seed/
        └── species.json    # Las 5 fichas piloto en formato JSON
```

---

## Orden de construcción (Fase 2)

| Paso | Tarea | Dependencias |
|------|-------|-------------|
| 1 | ✅ Schema de base de datos | — |
| 2 | ✅ TypeScript types | Schema |
| 3 | ✅ API routes (GET /species, GET /species/:slug) | DB + Types |
| 4 | ✅ Componentes base (Navbar, ConservationBadge, SpeciesCard) | Types |
| 5 | 🔲 Mapa interactivo con Mapbox | API + Mapbox token |
| 6 | 🔲 Página de listado con filtros | API + SpeciesCard |
| 7 | 🔲 Ficha de especie completa | API + Components |
| 8 | 🔲 Motor de búsqueda | API |
| 9 | 🔲 Subida de fotografías (Cloudinary) | Auth |
| 10 | 🔲 Formulario de avistamiento | Auth + Mapa |
| 11 | 🔲 Deploy en Vercel | Todos |

---

## APIs externas utilizadas

| API | Uso | Auth | Docs |
|-----|-----|------|------|
| Mapbox GL JS | Mapa interactivo | Token público | mapbox.com/docs |
| GBIF | Datos de ocurrencia | Sin auth (básico) | gbif.org/developer |
| iNaturalist | Avistamientos verificados | API key | api.inaturalist.org |
| UICN Red List | Estado de conservación | Token (solicitar) | apiv3.iucnredlist.org |
| Supabase | DB + Auth + Storage | Keys del proyecto | supabase.com/docs |
| Cloudinary | Banco de imágenes | API key | cloudinary.com/docs |

---

## Modelo de sostenibilidad técnica

Todos los servicios tienen tiers gratuitos que cubren el MVP:

- **Vercel**: 100GB bandwidth/mes, proyectos ilimitados
- **Supabase**: 500MB DB, 1GB storage, 50MB archivos
- **Mapbox**: 50.000 loads/mes gratuitos
- **Cloudinary**: 25GB storage gratuito

Para escalar: aplicar a programas para proyectos open source y sin fines de lucro (Mapbox for Good, GitHub Education, etc.)
