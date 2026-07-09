"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Select } from "@/components/ui/select";
import type { TagRef } from "@/modules/crm/domain/types";
import { addCustomerTagAction } from "@/app/(app)/clientes/actions";

/** Quick action per customer row: add an existing tag. */
export function CustomerQuickActions({
  customerId,
  tags,
}: {
  customerId: string;
  tags: TagRef[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  if (tags.length === 0) {
    return <span className="text-xs text-muted-foreground">Sin etiquetas</span>;
  }

  return (
    <Select
      aria-label="Agregar etiqueta"
      defaultValue=""
      disabled={pending}
      aria-busy={pending}
      onChange={(e) => {
        const tagId = e.target.value;
        if (!tagId) return;
        startTransition(async () => {
          await addCustomerTagAction(customerId, tagId);
          router.refresh();
        });
        e.target.value = "";
      }}
    >
      <option value="">+ Etiqueta…</option>
      {tags.map((t) => (
        <option key={t.id} value={t.id}>
          {t.name}
        </option>
      ))}
    </Select>
  );
}
