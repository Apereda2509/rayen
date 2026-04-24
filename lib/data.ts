import sql from '@/lib/db'

export async function getAllEspecies() {
  return sql<{ slug: string }[]>`SELECT slug FROM species WHERE published = TRUE`
}

export async function getAllAreas() {
  return sql<{ slug: string }[]>`SELECT slug FROM protected_areas`
}
