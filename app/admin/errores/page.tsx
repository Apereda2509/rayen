import sql from '@/lib/db'
import { ErrorReportsList, type ErrorReport } from '@/components/admin/ErrorReportsList'

export const metadata = { title: 'Errores — Admin Rayen' }

export default async function AdminErroresPage() {
  // Asegurar columna resolved
  await sql`ALTER TABLE error_reports ADD COLUMN IF NOT EXISTS resolved BOOLEAN NOT NULL DEFAULT FALSE`

  const reports = await sql<ErrorReport[]>`
    SELECT id, user_email AS "userEmail", message, resolved, created_at AS "createdAt"
    FROM error_reports
    ORDER BY resolved ASC, created_at DESC
    LIMIT 200
  `

  const pending = reports.filter((r) => !r.resolved).length

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-stone-900">Errores reportados</h1>
        <p className="text-sm text-stone-500 mt-0.5">
          {pending} sin revisar · {reports.length} total
        </p>
      </div>
      <ErrorReportsList initialReports={reports} />
    </div>
  )
}
