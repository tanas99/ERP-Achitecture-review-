"use server";

import { revalidatePath } from "next/cache";
import { getRequestContext } from "@/server/auth/context";
import {
  addCustomerTag,
  removeCustomerTag,
  addCustomerAddress,
  addCustomerNote,
  updateCustomer,
} from "@/modules/crm";

export type ActionResult =
  | { ok: true }
  | { ok: false; message: string; fieldErrors?: Record<string, string> };

export async function addCustomerTagAction(customerId: string, tagId: string) {
  const ctx = await getRequestContext();
  const res = await addCustomerTag(ctx, { customerId, tagId });
  if (!res.ok) throw new Error(res.error.message);
  revalidatePath(`/clientes/${customerId}`);
  revalidatePath("/clientes");
}

export async function removeCustomerTagAction(customerId: string, tagId: string) {
  const ctx = await getRequestContext();
  const res = await removeCustomerTag(ctx, { customerId, tagId });
  if (!res.ok) throw new Error(res.error.message);
  revalidatePath(`/clientes/${customerId}`);
}

export async function updateCustomerAction(
  customerId: string,
  input: unknown,
): Promise<ActionResult> {
  const ctx = await getRequestContext();
  const res = await updateCustomer(ctx, customerId, input);
  if (!res.ok) return { ok: false, message: res.error.message, fieldErrors: res.error.fields };
  revalidatePath(`/clientes/${customerId}`);
  revalidatePath("/clientes");
  return { ok: true };
}

export async function addCustomerAddressAction(
  customerId: string,
  input: unknown,
): Promise<ActionResult> {
  const ctx = await getRequestContext();
  const res = await addCustomerAddress(ctx, customerId, input);
  if (!res.ok) return { ok: false, message: res.error.message, fieldErrors: res.error.fields };
  revalidatePath(`/clientes/${customerId}`);
  return { ok: true };
}

export async function addCustomerNoteAction(
  customerId: string,
  input: unknown,
): Promise<ActionResult> {
  const ctx = await getRequestContext();
  const res = await addCustomerNote(ctx, customerId, input);
  if (!res.ok) return { ok: false, message: res.error.message, fieldErrors: res.error.fields };
  revalidatePath(`/clientes/${customerId}`);
  return { ok: true };
}
