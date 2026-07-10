import type {
  ProductionStatus,
  ProductionTaskStatus,
  ProductionTaskType,
} from "@/modules/production/domain/types";

export const PROD_STATUS_LABELS: Record<ProductionStatus, string> = {
  PENDIENTE: "Pendiente",
  PREPARANDO_MEZCLA: "Preparando mezcla",
  HORNEANDO: "Horneando",
  ENFRIANDO: "Enfriando",
  RELLENANDO: "Rellenando",
  CUBRIENDO: "Cubriendo",
  DECORANDO: "Decorando",
  EMPACANDO: "Empacando",
  FINALIZADO: "Finalizado",
};

export const TASK_STATUS_LABELS: Record<ProductionTaskStatus, string> = {
  PENDIENTE: "Pendiente",
  EN_PROGRESO: "En progreso",
  FINALIZADO: "Hecho",
  OMITIDO: "Omitido",
};

export const TASK_TYPE_LABELS: Record<ProductionTaskType, string> = {
  PREPARAR_MEZCLA: "Preparar mezcla",
  HORNEAR: "Hornear",
  ENFRIAR: "Enfriar",
  RELLENAR: "Rellenar",
  CRUMB_COAT: "Crumb coat",
  DECORACION_FINAL: "Decoración final",
  EMPAQUE: "Empaque",
  OTRO: "Otro",
};

export function formatDate(d: Date | null): string {
  if (!d) return "—";
  return new Intl.DateTimeFormat("es-EC", { day: "2-digit", month: "short" }).format(d);
}
