import Link from "next/link";
import { getRequestContext } from "@/server/auth/context";
import { listCalendarMonth, type CalendarItem } from "@/modules/calendar";
import { EmptyState } from "@/components/ui/empty-state";

type SP = Record<string, string | string[] | undefined>;

const MONTHS = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

function dayKey(d: Date): string {
  return new Intl.DateTimeFormat("es-EC", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    timeZone: "UTC",
  }).format(d);
}

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<SP>;
}) {
  const ctx = await getRequestContext();
  const sp = await searchParams;
  const now = new Date();
  const year = Number(sp.year) || now.getUTCFullYear();
  const month = Number(sp.month) || now.getUTCMonth() + 1;

  const items = await listCalendarMonth(ctx, year, month);

  // Group by day (UTC date string)
  const groups = new Map<string, CalendarItem[]>();
  for (const it of items) {
    const k = it.date.toISOString().slice(0, 10);
    if (!groups.has(k)) groups.set(k, []);
    groups.get(k)!.push(it);
  }

  const prevMonth = month === 1 ? 12 : month - 1;
  const prevYear = month === 1 ? year - 1 : year;
  const nextMonth = month === 12 ? 1 : month + 1;
  const nextYear = month === 12 ? year + 1 : year;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Calendario</h1>
          <p className="text-sm text-muted-foreground">Entregas y eventos del mes</p>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <Link href={`/calendario?year=${prevYear}&month=${prevMonth}`} className="rounded-full border border-border px-3 py-1 hover:bg-muted">←</Link>
          <span className="font-medium">{MONTHS[month - 1]} {year}</span>
          <Link href={`/calendario?year=${nextYear}&month=${nextMonth}`} className="rounded-full border border-border px-3 py-1 hover:bg-muted">→</Link>
        </div>
      </div>

      {items.length === 0 ? (
        <EmptyState
          title="Sin entregas ni eventos este mes"
          description="Cuando tus pedidos tengan fecha de entrega o evento, aparecerán aquí."
        />
      ) : (
        <div className="space-y-4">
          {[...groups.entries()].map(([key, dayItems]) => (
            <section key={key} className="rounded-[var(--radius)] border border-border bg-card p-4">
              <h2 className="mb-2 text-sm font-semibold capitalize">
                {dayKey(dayItems[0]!.date)}
              </h2>
              <ul className="space-y-2">
                {dayItems.map((it, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm">
                    <span
                      className={`inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                        it.kind === "ENTREGA"
                          ? "bg-primary/15 text-primary"
                          : "bg-amber-500/15 text-amber-500"
                      }`}
                    >
                      {it.kind === "ENTREGA" ? "Entrega" : "Evento"}
                    </span>
                    <Link href={`/pedidos/${it.orderId}`} className="hover:underline">
                      {it.title}
                    </Link>
                    <span className="text-muted-foreground">· {it.customerName}</span>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
