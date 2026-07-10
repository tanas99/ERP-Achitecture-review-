"use server";

import { revalidatePath } from "next/cache";
import { getRequestContext } from "@/server/auth/context";
import {
  setProductionStatus,
  addProductionTask,
  setTaskStatus,
  removeProductionTask,
  type ProductionStatus,
} from "@/modules/production";

export async function setProductionStatusAction(id: string, status: ProductionStatus) {
  const ctx = await getRequestContext();
  const res = await setProductionStatus(ctx, id, { status });
  if (!res.ok) throw new Error(res.error.message);
  revalidatePath("/produccion");
  revalidatePath(`/produccion/${id}`);
}

export async function addTaskAction(id: string, input: unknown) {
  const ctx = await getRequestContext();
  const res = await addProductionTask(ctx, id, input);
  if (!res.ok) throw new Error(res.error.message);
  revalidatePath(`/produccion/${id}`);
}

export async function setTaskStatusAction(taskId: string, status: string) {
  const ctx = await getRequestContext();
  const res = await setTaskStatus(ctx, { taskId, status });
  if (!res.ok) throw new Error(res.error.message);
}

export async function removeTaskAction(taskId: string) {
  const ctx = await getRequestContext();
  const res = await removeProductionTask(ctx, taskId);
  if (!res.ok) throw new Error(res.error.message);
}
