import type { RequestContext } from "@/server/context";
import type {
  ProductionDetail,
  ProductionListItem,
  ProductionStatus,
  ProductionTaskStatus,
} from "@/modules/production/domain/types";
import type { AddTaskInput, ProductionFilters } from "./forms";

export interface ProductionRepository {
  list(ctx: RequestContext, filters: ProductionFilters): Promise<ProductionListItem[]>;
  findById(ctx: RequestContext, productionOrderId: string): Promise<ProductionDetail | null>;
  setStatus(ctx: RequestContext, productionOrderId: string, status: ProductionStatus): Promise<void>;
  addTask(ctx: RequestContext, productionOrderId: string, input: AddTaskInput): Promise<void>;
  setTaskStatus(ctx: RequestContext, taskId: string, status: ProductionTaskStatus): Promise<void>;
  removeTask(ctx: RequestContext, taskId: string): Promise<void>;
}
