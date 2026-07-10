"use server";

import { revalidatePath } from "next/cache";
import { getRequestContext } from "@/server/auth/context";
import {
  createOrderFromQuotation,
  registerPayment,
  setOrderStatus,
  updateDelivery,
  type OrderStatus,
} from "@/modules/orders";

export type ActionResult =
  | { ok: true; id?: string }
  | { ok: false; message: string; fieldErrors?: Record<string, string> };

export async function createOrderFromQuotationAction(input: unknown): Promise<ActionResult> {
  const ctx = await getRequestContext();
  const res = await createOrderFromQuotation(ctx, input);
  if (!res.ok) return { ok: false, message: res.error.message, fieldErrors: res.error.fields };
  revalidatePath("/pedidos");
  return { ok: true, id: res.data.id };
}

export async function registerPaymentAction(orderId: string, input: unknown): Promise<ActionResult> {
  const ctx = await getRequestContext();
  const res = await registerPayment(ctx, orderId, input);
  if (!res.ok) return { ok: false, message: res.error.message };
  revalidatePath(`/pedidos/${orderId}`);
  return { ok: true };
}

export async function updateDeliveryAction(orderId: string, input: unknown): Promise<ActionResult> {
  const ctx = await getRequestContext();
  const res = await updateDelivery(ctx, orderId, input);
  if (!res.ok) return { ok: false, message: res.error.message };
  revalidatePath(`/pedidos/${orderId}`);
  return { ok: true };
}

export async function setOrderStatusAction(orderId: string, status: OrderStatus) {
  const ctx = await getRequestContext();
  const res = await setOrderStatus(ctx, orderId, { status });
  if (!res.ok) throw new Error(res.error.message);
  revalidatePath(`/pedidos/${orderId}`);
  revalidatePath("/pedidos");
}
