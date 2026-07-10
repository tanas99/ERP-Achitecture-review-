"use server";

import { revalidatePath } from "next/cache";
import { getRequestContext } from "@/server/auth/context";
import {
  createQuotation,
  setQuotationStatus,
  acceptQuotation,
  type QuotationStatus,
} from "@/modules/quotations";

export type ActionResult =
  | { ok: true; id?: string }
  | { ok: false; message: string; fieldErrors?: Record<string, string> };

export async function createQuotationAction(input: unknown): Promise<ActionResult> {
  const ctx = await getRequestContext();
  const res = await createQuotation(ctx, input);
  if (!res.ok) return { ok: false, message: res.error.message, fieldErrors: res.error.fields };
  revalidatePath("/cotizaciones");
  return { ok: true, id: res.data.id };
}

export async function setQuotationStatusAction(
  quotationId: string,
  status: QuotationStatus,
) {
  const ctx = await getRequestContext();
  const res = await setQuotationStatus(ctx, { quotationId, status });
  if (!res.ok) throw new Error(res.error.message);
  revalidatePath(`/cotizaciones/${quotationId}`);
  revalidatePath("/cotizaciones");
}

export async function acceptQuotationAction(quotationId: string) {
  const ctx = await getRequestContext();
  const res = await acceptQuotation(ctx, quotationId);
  if (!res.ok) throw new Error(res.error.message);
  revalidatePath(`/cotizaciones/${quotationId}`);
  revalidatePath("/cotizaciones");
  revalidatePath("/clientes");
  revalidatePath("/leads");
}
