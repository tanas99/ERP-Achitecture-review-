"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import type {
  ProductionStatus,
  ProductionTaskStatus,
  ProductionTaskView,
} from "@/modules/production/domain/types";
import {
  PRODUCTION_STATUSES,
  PRODUCTION_TASK_STATUSES,
  PRODUCTION_TASK_TYPES,
} from "@/modules/production/domain/types";
import { PROD_STATUS_LABELS, TASK_STATUS_LABELS, TASK_TYPE_LABELS } from "./labels";
import {
  addTaskAction,
  removeTaskAction,
  setProductionStatusAction,
  setTaskStatusAction,
} from "@/app/(app)/produccion/actions";

export function ProductionStatusControl({
  id,
  status,
}: {
  id: string;
  status: ProductionStatus;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <Select
      aria-label="Cambiar estado de producción"
      defaultValue={status}
      disabled={pending}
      onChange={(e) =>
        start(async () => {
          await setProductionStatusAction(id, e.target.value as ProductionStatus);
          router.refresh();
        })
      }
    >
      {PRODUCTION_STATUSES.map((s) => (
        <option key={s} value={s}>{PROD_STATUS_LABELS[s]}</option>
      ))}
    </Select>
  );
}

export function TaskList({ id, tasks }: { id: string; tasks: ProductionTaskView[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const ref = useRef<HTMLFormElement>(null);

  const done = (s: ProductionTaskStatus) => s === "FINALIZADO";

  return (
    <div className="space-y-3" aria-busy={pending}>
      <ul className="space-y-2">
        {tasks.map((t) => (
          <li key={t.id} className="flex items-center gap-2 rounded-[var(--radius)] border border-border p-2">
            <span className={`flex-1 text-sm ${done(t.status) ? "text-muted-foreground line-through" : ""}`}>
              {t.name}
            </span>
            <Select
              aria-label={`Estado de ${t.name}`}
              defaultValue={t.status}
              disabled={pending}
              onChange={(e) =>
                start(async () => {
                  await setTaskStatusAction(t.id, e.target.value as ProductionTaskStatus);
                  router.refresh();
                })
              }
            >
              {PRODUCTION_TASK_STATUSES.map((s) => (
                <option key={s} value={s}>{TASK_STATUS_LABELS[s]}</option>
              ))}
            </Select>
            <button
              type="button"
              aria-label="Quitar tarea"
              className="rounded-[var(--radius)] border border-border px-2 text-muted-foreground hover:bg-muted"
              onClick={() =>
                start(async () => {
                  await removeTaskAction(t.id);
                  router.refresh();
                })
              }
            >
              ×
            </button>
          </li>
        ))}
        {tasks.length === 0 && <li className="text-sm text-muted-foreground">Sin tareas.</li>}
      </ul>

      <form
        ref={ref}
        className="flex flex-col gap-2 sm:flex-row"
        onSubmit={(e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          start(async () => {
            await addTaskAction(id, { type: String(fd.get("type")), name: String(fd.get("name") ?? "") });
            ref.current?.reset();
            router.refresh();
          });
        }}
      >
        <Select name="type" aria-label="Tipo de tarea" defaultValue="OTRO">
          {PRODUCTION_TASK_TYPES.map((t) => (
            <option key={t} value={t}>{TASK_TYPE_LABELS[t]}</option>
          ))}
        </Select>
        <input
          name="name"
          required
          placeholder="Nueva tarea…"
          className="h-9 flex-1 rounded-[var(--radius)] border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
        <Button type="submit" size="sm" disabled={pending}>Agregar</Button>
      </form>
    </div>
  );
}
