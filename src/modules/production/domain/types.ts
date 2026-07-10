/** Production domain types (pure). */
export type ProductionStatus =
  | "PENDIENTE"
  | "PREPARANDO_MEZCLA"
  | "HORNEANDO"
  | "ENFRIANDO"
  | "RELLENANDO"
  | "CUBRIENDO"
  | "DECORANDO"
  | "EMPACANDO"
  | "FINALIZADO";

export type ProductionTaskStatus = "PENDIENTE" | "EN_PROGRESO" | "FINALIZADO" | "OMITIDO";
export type ProductionTaskType =
  | "PREPARAR_MEZCLA"
  | "HORNEAR"
  | "ENFRIAR"
  | "RELLENAR"
  | "CRUMB_COAT"
  | "DECORACION_FINAL"
  | "EMPAQUE"
  | "OTRO";
export type OrderPriority = "LOW" | "NORMAL" | "HIGH" | "URGENT";

export const PRODUCTION_STATUSES: ProductionStatus[] = [
  "PENDIENTE",
  "PREPARANDO_MEZCLA",
  "HORNEANDO",
  "ENFRIANDO",
  "RELLENANDO",
  "CUBRIENDO",
  "DECORANDO",
  "EMPACANDO",
  "FINALIZADO",
];
export const PRODUCTION_TASK_STATUSES: ProductionTaskStatus[] = [
  "PENDIENTE",
  "EN_PROGRESO",
  "FINALIZADO",
  "OMITIDO",
];
export const PRODUCTION_TASK_TYPES: ProductionTaskType[] = [
  "PREPARAR_MEZCLA",
  "HORNEAR",
  "ENFRIAR",
  "RELLENAR",
  "CRUMB_COAT",
  "DECORACION_FINAL",
  "EMPAQUE",
  "OTRO",
];

export interface ProductionListItem {
  id: string;
  orderNumber: number;
  customerName: string;
  status: ProductionStatus;
  priority: OrderPriority;
  dueDate: Date | null;
  tasksDone: number;
  tasksTotal: number;
}

export interface ProductionTaskView {
  id: string;
  type: ProductionTaskType;
  name: string;
  status: ProductionTaskStatus;
  sequence: number;
  displayOrder: number;
}

export interface ProductionOrderItemView {
  id: string;
  description: string;
  quantity: number;
}

export interface ProductionDetail {
  id: string;
  orderId: string;
  orderNumber: number;
  customerName: string;
  status: ProductionStatus;
  priority: OrderPriority;
  dueDate: Date | null;
  notes: string | null;
  items: ProductionOrderItemView[];
  tasks: ProductionTaskView[];
}
