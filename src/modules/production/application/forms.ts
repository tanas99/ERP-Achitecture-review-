import { z } from "zod";
import {
  PRODUCTION_STATUSES,
  PRODUCTION_TASK_STATUSES,
  PRODUCTION_TASK_TYPES,
} from "@/modules/production/domain/types";

const emptyToUndef = (v: unknown) => (v === "" || v == null ? undefined : v);
const optionalText = z.preprocess(emptyToUndef, z.string().trim().optional());

export const setProductionStatusSchema = z.object({
  status: z.enum(PRODUCTION_STATUSES as [string, ...string[]]),
});

export const addTaskSchema = z.object({
  type: z.enum(PRODUCTION_TASK_TYPES as [string, ...string[]]).default("OTRO"),
  name: z.string().trim().min(1, "Ponle un nombre a la tarea").max(120),
});
export type AddTaskInput = z.infer<typeof addTaskSchema>;

export const setTaskStatusSchema = z.object({
  taskId: z.string().min(1),
  status: z.enum(PRODUCTION_TASK_STATUSES as [string, ...string[]]),
});

export const productionFiltersSchema = z.object({
  q: optionalText,
  status: z.enum(PRODUCTION_STATUSES as [string, ...string[]]).optional(),
  includeFinished: z.coerce.boolean().default(false),
});
export type ProductionFilters = z.infer<typeof productionFiltersSchema>;

export function parseProductionFilters(input: unknown): ProductionFilters {
  return productionFiltersSchema.parse(input ?? {});
}
