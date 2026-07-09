import type {
  CustomerTimelineItem,
  CustomerTimelineType,
} from "@/modules/crm/domain/types";
import { formatDateTime } from "./labels";

const TL_LABELS: Record<CustomerTimelineType, string> = {
  LEAD: "Lead",
  COTIZACION: "Cotización",
  PEDIDO: "Pedido",
  PAGO: "Pago",
  ENTREGA: "Entrega",
  DOCUMENTO: "Documento",
  NOTA: "Nota",
  ADJUNTO: "Adjunto",
  ACTIVIDAD: "Actividad",
  LLAMADA: "Llamada",
  MENSAJE: "Mensaje",
  CORREO: "Correo",
  NOTA_INTERNA: "Nota interna",
};

/** Business timeline of a customer (leads, quotes, orders, payments, notes…). */
export function CustomerTimeline({ items }: { items: CustomerTimelineItem[] }) {
  if (items.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        La línea de tiempo se irá llenando con las cotizaciones, pedidos, pagos y
        entregas del cliente.
      </p>
    );
  }
  return (
    <ol className="space-y-3">
      {items.map((t) => (
        <li key={t.id} className="flex gap-3">
          <div className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-primary" aria-hidden />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                {TL_LABELS[t.type]}
              </span>
              <span className="text-xs text-muted-foreground">
                {formatDateTime(t.occurredAt)}
              </span>
            </div>
            <p className="text-sm">{t.title}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
