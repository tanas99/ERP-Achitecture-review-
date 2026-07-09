import Link from "next/link";
import type { CustomerListItem, TagRef } from "@/modules/crm/domain/types";
import { TagChips } from "./badges";
import { CustomerQuickActions } from "./customer-quick-actions";
import { ID_TYPE_LABELS } from "./labels";

/** Responsive customers list: table on >=md, cards on mobile. */
export function CustomersList({
  items,
  tags,
}: {
  items: CustomerListItem[];
  tags: TagRef[];
}) {
  return (
    <>
      <div className="hidden overflow-x-auto rounded-lg border border-border md:block">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left text-muted-foreground">
            <tr>
              <th className="px-4 py-2 font-medium">Nombre</th>
              <th className="px-4 py-2 font-medium">Identificación</th>
              <th className="px-4 py-2 font-medium">Contacto</th>
              <th className="px-4 py-2 font-medium">Etiquetas</th>
              <th className="px-4 py-2 font-medium">Acción rápida</th>
            </tr>
          </thead>
          <tbody>
            {items.map((c) => (
              <tr key={c.id} className="border-t border-border">
                <td className="px-4 py-3">
                  <Link href={`/clientes/${c.id}`} className="font-medium hover:underline">
                    {c.name}
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <div>{ID_TYPE_LABELS[c.identificationType]}</div>
                  <div className="text-xs text-muted-foreground">
                    {c.identification ?? "—"}
                  </div>
                </td>
                <td className="px-4 py-3">{c.phone ?? c.email ?? "—"}</td>
                <td className="px-4 py-3">
                  <TagChips tags={c.tags} />
                </td>
                <td className="px-4 py-3">
                  <CustomerQuickActions customerId={c.id} tags={tags} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="space-y-3 md:hidden">
        {items.map((c) => (
          <li key={c.id} className="rounded-[var(--radius)] border border-border bg-card p-4">
            <Link href={`/clientes/${c.id}`} className="font-medium hover:underline">
              {c.name}
            </Link>
            <div className="text-xs text-muted-foreground">
              {ID_TYPE_LABELS[c.identificationType]} · {c.phone ?? c.email ?? "—"}
            </div>
            <div className="mt-2">
              <TagChips tags={c.tags} />
            </div>
            <div className="mt-3">
              <CustomerQuickActions customerId={c.id} tags={tags} />
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
