"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  updateCustomerSchema,
  IDENTIFICATION_TYPES,
  type UpdateCustomerInput,
} from "@/modules/crm";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { ID_TYPE_LABELS } from "./labels";
import { updateCustomerAction } from "@/app/(app)/clientes/actions";

const inputCls =
  "h-9 w-full rounded-[var(--radius)] border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

export function CustomerEditForm({
  customerId,
  defaults,
}: {
  customerId: string;
  defaults: Partial<Record<keyof UpdateCustomerInput, string>>;
}) {
  const router = useRouter();
  const [msg, setMsg] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<UpdateCustomerInput>({
    resolver: zodResolver(updateCustomerSchema),
    defaultValues: defaults as Partial<UpdateCustomerInput>,
  });

  return (
    <form
      className="space-y-3"
      onSubmit={handleSubmit(async (values) => {
        setMsg(null);
        const res = await updateCustomerAction(customerId, values);
        if (!res.ok) {
          setMsg(res.message);
          return;
        }
        setMsg("Guardado");
        router.refresh();
      })}
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1 sm:col-span-2">
          <label className="text-sm font-medium">Nombre</label>
          <input className={inputCls} {...register("name")} />
          {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">Tipo de identificación</label>
          <Select className="w-full" {...register("identificationType")}>
            {IDENTIFICATION_TYPES.map((t) => (
              <option key={t} value={t}>
                {ID_TYPE_LABELS[t]}
              </option>
            ))}
          </Select>
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">Identificación</label>
          <input className={inputCls} {...register("identification")} />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">Teléfono / WhatsApp</label>
          <input className={inputCls} {...register("phone")} />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">Correo</label>
          <input className={inputCls} type="email" {...register("email")} />
          {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
        </div>
        <div className="space-y-1 sm:col-span-2">
          <label className="text-sm font-medium">Notas</label>
          <textarea className={`${inputCls} h-20 py-2`} {...register("notes")} />
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Guardando…" : "Guardar cambios"}
        </Button>
        {msg && <span className="text-sm text-muted-foreground">{msg}</span>}
      </div>
    </form>
  );
}
