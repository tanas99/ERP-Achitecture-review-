"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createLeadSchema, type CreateLeadInput } from "@/modules/crm";
import type { AssignedUser } from "@/modules/crm/domain/types";
import { LEAD_SOURCES, LEAD_STATUSES } from "@/modules/crm/domain/types";
import { LEAD_SOURCE_LABELS, LEAD_STATUS_LABELS } from "./labels";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import {
  createLeadAction,
  updateLeadAction,
  type ActionResult,
} from "@/app/(app)/leads/actions";

type Mode = { kind: "create" } | { kind: "edit"; leadId: string };

const inputCls =
  "h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

export function LeadForm({
  mode,
  users,
  defaults,
}: {
  mode: Mode;
  users: AssignedUser[];
  defaults?: Partial<Record<keyof CreateLeadInput, string>>;
}) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateLeadInput>({
    resolver: zodResolver(createLeadSchema),
    defaultValues: defaults as Partial<CreateLeadInput>,
  });

  async function onSubmit(values: CreateLeadInput) {
    setServerError(null);
    const res: ActionResult =
      mode.kind === "create"
        ? await createLeadAction(values)
        : await updateLeadAction(mode.leadId, values);

    if (!res.ok) {
      setServerError(res.message);
      return;
    }
    if (mode.kind === "create" && res.id) {
      router.push(`/leads/${res.id}`);
    } else {
      router.push(`/leads/${(mode as { leadId: string }).leadId}`);
      router.refresh();
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Nombre" error={errors.name?.message} className="sm:col-span-2">
          <input className={inputCls} {...register("name")} />
        </Field>

        <Field label="Fuente">
          <Select className="w-full" {...register("source")}>
            {LEAD_SOURCES.map((s) => (
              <option key={s} value={s}>
                {LEAD_SOURCE_LABELS[s]}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Estado">
          <Select className="w-full" {...register("status")}>
            {LEAD_STATUSES.map((s) => (
              <option key={s} value={s}>
                {LEAD_STATUS_LABELS[s]}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Teléfono / WhatsApp">
          <input className={inputCls} {...register("phone")} />
        </Field>

        <Field label="Correo" error={errors.email?.message}>
          <input className={inputCls} type="email" {...register("email")} />
        </Field>

        <Field label="Usuario en redes (IG/TikTok)">
          <input className={inputCls} {...register("socialHandle")} />
        </Field>

        <Field label="Referido por">
          <input className={inputCls} {...register("referredBy")} />
        </Field>

        <Field label="Vendedora asignada">
          <Select className="w-full" {...register("assignedToId")}>
            <option value="">Sin asignar</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Próximo seguimiento">
          <input className={inputCls} type="date" {...register("nextFollowUpAt")} />
        </Field>

        <Field label="Notas" className="sm:col-span-2">
          <textarea className={`${inputCls} h-24 py-2`} {...register("notes")} />
        </Field>
      </div>

      {serverError && (
        <p role="alert" className="text-sm text-destructive">
          {serverError}
        </p>
      )}

      <div className="flex gap-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? "Guardando…"
            : mode.kind === "create"
              ? "Crear lead"
              : "Guardar cambios"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}

function Field({
  label,
  error,
  className,
  children,
}: {
  label: string;
  error?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`space-y-1 ${className ?? ""}`}>
      <label className="text-sm font-medium">{label}</label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
