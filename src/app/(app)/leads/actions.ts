"use server";

import { revalidatePath } from "next/cache";
import { getRequestContext } from "@/server/auth/context";
import {
  changeLeadStatus,
  assignLead,
  createLead,
  updateLead,
  addLeadActivity,
  type LeadStatus,
} from "@/modules/crm";

export type ActionResult =
  | { ok: true; id?: string }
  | { ok: false; message: string; fieldErrors?: Record<string, string> };

/** Create a lead. Returns the new id (client redirects to its detail). */
export async function createLeadAction(input: unknown): Promise<ActionResult> {
  const ctx = await getRequestContext();
  const res = await createLead(ctx, input);
  if (!res.ok) {
    return { ok: false, message: res.error.message, fieldErrors: res.error.fields };
  }
  revalidatePath("/leads");
  return { ok: true, id: res.data.id };
}

export async function updateLeadAction(
  leadId: string,
  input: unknown,
): Promise<ActionResult> {
  const ctx = await getRequestContext();
  const res = await updateLead(ctx, leadId, input);
  if (!res.ok) {
    return { ok: false, message: res.error.message, fieldErrors: res.error.fields };
  }
  revalidatePath(`/leads/${leadId}`);
  revalidatePath("/leads");
  return { ok: true };
}

export async function addLeadActivityAction(
  leadId: string,
  input: unknown,
): Promise<ActionResult> {
  const ctx = await getRequestContext();
  const res = await addLeadActivity(ctx, leadId, input);
  if (!res.ok) {
    return { ok: false, message: res.error.message, fieldErrors: res.error.fields };
  }
  revalidatePath(`/leads/${leadId}`);
  return { ok: true };
}

/** Quick-action server actions for the Leads list (§7). */
export async function changeLeadStatusAction(
  leadId: string,
  status: LeadStatus,
) {
  const ctx = await getRequestContext();
  const res = await changeLeadStatus(ctx, { leadId, status });
  if (!res.ok) throw new Error(res.error.message);
  revalidatePath("/leads");
}

export async function assignLeadAction(leadId: string, userId: string | null) {
  const ctx = await getRequestContext();
  const res = await assignLead(ctx, { leadId, userId });
  if (!res.ok) throw new Error(res.error.message);
  revalidatePath("/leads");
}
