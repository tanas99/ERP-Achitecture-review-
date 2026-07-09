import type {
  IdentificationType,
  LeadActivityType,
  LeadSource,
  LeadStatus,
  LostReason,
} from "@/modules/crm/domain/types";

/** es-EC display labels & badge styles for CRM enums (ARCHITECTURE.md §8). */
export const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  NUEVO: "Nuevo",
  CONTACTADO: "Contactado",
  COTIZADO: "Cotizado",
  EN_NEGOCIACION: "En negociación",
  GANADO: "Ganado",
  PERDIDO: "Perdido",
};

export const LEAD_STATUS_STYLES: Record<LeadStatus, string> = {
  NUEVO: "bg-blue-500/15 text-blue-500",
  CONTACTADO: "bg-amber-500/15 text-amber-500",
  COTIZADO: "bg-violet-500/15 text-violet-500",
  EN_NEGOCIACION: "bg-orange-500/15 text-orange-500",
  GANADO: "bg-emerald-500/15 text-emerald-500",
  PERDIDO: "bg-rose-500/15 text-rose-500",
};

export const LEAD_SOURCE_LABELS: Record<LeadSource, string> = {
  INSTAGRAM: "Instagram",
  TIKTOK: "TikTok",
  FACEBOOK: "Facebook",
  GOOGLE: "Google",
  WEBSITE: "Sitio web",
  WHATSAPP: "WhatsApp",
  REFERIDO: "Referido",
  WALK_IN: "Vino al local",
  EVENTO: "Evento",
  CORPORATIVO: "Corporativo",
  OTRO: "Otro",
};

export const ID_TYPE_LABELS: Record<IdentificationType, string> = {
  RUC: "RUC",
  CEDULA: "Cédula",
  PASAPORTE: "Pasaporte",
  CONSUMIDOR_FINAL: "Consumidor final",
};

export const LEAD_ACTIVITY_LABELS: Record<LeadActivityType, string> = {
  LLAMADA: "Llamada",
  WHATSAPP: "WhatsApp",
  MENSAJE: "Mensaje",
  CORREO: "Correo",
  REUNION: "Reunión",
  NOTA: "Nota",
  OTRO: "Otro",
};

export const LEAD_ACTIVITY_ICONS: Record<LeadActivityType, string> = {
  LLAMADA: "📞",
  WHATSAPP: "💬",
  MENSAJE: "✉️",
  CORREO: "📧",
  REUNION: "🤝",
  NOTA: "📝",
  OTRO: "•",
};

export const LOST_REASON_LABELS: Record<LostReason, string> = {
  PRECIO: "Precio",
  SIN_RESPUESTA: "No respondió",
  COMPRO_EN_OTRO_LADO: "Compró en otro lado",
  EVENTO_CANCELADO: "Evento cancelado",
  OTRO: "Otro",
};

export function formatDate(d: Date | null): string {
  if (!d) return "—";
  return new Intl.DateTimeFormat("es-EC", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(d);
}

export function formatDateTime(d: Date | null): string {
  if (!d) return "—";
  return new Intl.DateTimeFormat("es-EC", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}
