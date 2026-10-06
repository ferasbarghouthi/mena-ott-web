// Markup helpers safe to use from server components.

export function PageHeaderServer({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="mb-8">
      <h1 className="text-3xl font-bold tracking-tight text-fg sm:text-4xl">{title}</h1>
      {sub && <p className="mt-2 text-muted">{sub}</p>}
    </div>
  );
}
