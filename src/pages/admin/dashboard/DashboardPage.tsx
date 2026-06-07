export function DashboardPage() {
  return (
    <section className="space-y-4">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">
          Tableau de bord
        </h1>
        <p className="text-muted-foreground">
          Zone d&apos;administration — les modules métier seront ajoutés ici.
        </p>
      </div>
      <div className="rounded-lg border border-border bg-card p-6 text-card-foreground">
        <p className="text-sm text-muted-foreground">
          Aucune donnée pour le moment.
        </p>
      </div>
    </section>
  )
}
