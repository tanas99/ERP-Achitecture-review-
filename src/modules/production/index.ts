/** Production module — PUBLIC API (composition root). */
import {
  makeAddProductionTask,
  makeGetProduction,
  makeListProduction,
  makeRemoveProductionTask,
  makeSetProductionStatus,
  makeSetTaskStatus,
} from "./application/use-cases";
import { PrismaProductionRepository } from "./infrastructure/prisma-production-repository";

const repo = new PrismaProductionRepository();

export const listProduction = makeListProduction(repo);
export const getProduction = makeGetProduction(repo);
export const setProductionStatus = makeSetProductionStatus(repo);
export const addProductionTask = makeAddProductionTask(repo);
export const setTaskStatus = makeSetTaskStatus(repo);
export const removeProductionTask = makeRemoveProductionTask(repo);

export { parseProductionFilters, type ProductionFilters } from "./application/forms";
export {
  PRODUCTION_STATUSES,
  PRODUCTION_TASK_STATUSES,
  PRODUCTION_TASK_TYPES,
  type ProductionStatus,
  type ProductionListItem,
  type ProductionDetail,
} from "./domain/types";
