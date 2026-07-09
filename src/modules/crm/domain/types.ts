/**
 * CRM domain types (pure — no framework/Prisma imports, per ARCHITECTURE.md §1).
 * Enum unions mirror the Prisma enums; the infrastructure layer maps 1:1.
 */
export type LeadStatus =
  | "NUEVO"
  | "CONTACTADO"
  | "COTIZADO"
  | "EN_NEGOCIACION"
  | "GANADO"
  | "PERDIDO";

export type LeadSource =
  | "INSTAGRAM"
  | "TIKTOK"
  | "FACEBOOK"
  | "GOOGLE"
  | "WEBSITE"
  | "WHATSAPP"
  | "REFERIDO"
  | "WALK_IN"
  | "EVENTO"
  | "CORPORATIVO"
  | "OTRO";

export type IdentificationType =
  | "RUC"
  | "CEDULA"
  | "PASAPORTE"
  | "CONSUMIDOR_FINAL";

export type LeadActivityType =
  | "LLAMADA"
  | "WHATSAPP"
  | "MENSAJE"
  | "CORREO"
  | "REUNION"
  | "NOTA"
  | "OTRO";

export type LostReason =
  | "PRECIO"
  | "SIN_RESPUESTA"
  | "COMPRO_EN_OTRO_LADO"
  | "EVENTO_CANCELADO"
  | "OTRO";

export const LEAD_ACTIVITY_TYPES: LeadActivityType[] = [
  "LLAMADA",
  "WHATSAPP",
  "MENSAJE",
  "CORREO",
  "REUNION",
  "NOTA",
  "OTRO",
];

export const LOST_REASONS: LostReason[] = [
  "PRECIO",
  "SIN_RESPUESTA",
  "COMPRO_EN_OTRO_LADO",
  "EVENTO_CANCELADO",
  "OTRO",
];

export const LEAD_STATUSES: LeadStatus[] = [
  "NUEVO",
  "CONTACTADO",
  "COTIZADO",
  "EN_NEGOCIACION",
  "GANADO",
  "PERDIDO",
];

export const LEAD_SOURCES: LeadSource[] = [
  "INSTAGRAM",
  "TIKTOK",
  "FACEBOOK",
  "GOOGLE",
  "WEBSITE",
  "WHATSAPP",
  "REFERIDO",
  "WALK_IN",
  "EVENTO",
  "CORPORATIVO",
  "OTRO",
];

export interface AssignedUser {
  id: string;
  name: string;
}

export interface TagRef {
  id: string;
  name: string;
  color: string | null;
}

export interface LeadListItem {
  id: string;
  name: string;
  source: LeadSource;
  status: LeadStatus;
  phone: string | null;
  email: string | null;
  assignedTo: AssignedUser | null;
  lastContactAt: Date | null;
  nextFollowUpAt: Date | null;
  createdAt: Date;
}

export interface CustomerListItem {
  id: string;
  name: string;
  identificationType: IdentificationType;
  identification: string | null;
  phone: string | null;
  email: string | null;
  tags: TagRef[];
  createdAt: Date;
}

export interface LeadActivityItem {
  id: string;
  type: LeadActivityType;
  summary: string;
  occurredAt: Date;
  createdById: string | null;
}

export interface LeadDetail {
  id: string;
  name: string;
  source: LeadSource;
  status: LeadStatus;
  phone: string | null;
  email: string | null;
  socialHandle: string | null;
  referredBy: string | null;
  notes: string | null;
  assignedTo: AssignedUser | null;
  lastContactAt: Date | null;
  nextFollowUpAt: Date | null;
  lostReason: LostReason | null;
  lostReasonNote: string | null;
  convertedAt: Date | null;
  convertedCustomerId: string | null;
  createdAt: Date;
  activities: LeadActivityItem[];
}

export interface CustomerAddressItem {
  id: string;
  label: string;
  address: string;
  zone: string | null;
  reference: string | null;
  isDefault: boolean;
}

export interface CustomerNoteItem {
  id: string;
  body: string;
  createdAt: Date;
  createdById: string | null;
}

export type CustomerTimelineType =
  | "LEAD"
  | "COTIZACION"
  | "PEDIDO"
  | "PAGO"
  | "ENTREGA"
  | "DOCUMENTO"
  | "NOTA"
  | "ADJUNTO"
  | "ACTIVIDAD"
  | "LLAMADA"
  | "MENSAJE"
  | "CORREO"
  | "NOTA_INTERNA";

export interface CustomerTimelineItem {
  id: string;
  type: CustomerTimelineType;
  title: string;
  occurredAt: Date;
}

export interface CustomerDetail {
  id: string;
  name: string;
  identificationType: IdentificationType;
  identification: string | null;
  email: string | null;
  phone: string | null;
  notes: string | null;
  becameCustomerAt: Date | null;
  createdAt: Date;
  addresses: CustomerAddressItem[];
  tags: TagRef[];
  customerNotes: CustomerNoteItem[];
  timeline: CustomerTimelineItem[];
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}
