import { z } from "zod";

/** Form schemas for the Customer detail milestone (validated client + server). */
const emptyToUndef = (v: unknown) => (v === "" || v == null ? undefined : v);
const optionalText = z.preprocess(emptyToUndef, z.string().trim().optional());
const optionalEmail = z.preprocess(
  emptyToUndef,
  z.string().trim().email().optional(),
);

export const IDENTIFICATION_TYPES = [
  "RUC",
  "CEDULA",
  "PASAPORTE",
  "CONSUMIDOR_FINAL",
] as const;

export const addAddressSchema = z.object({
  label: z.string().trim().min(1, "Ponle una etiqueta (Casa, Oficina…)").max(60),
  address: z.string().trim().min(1, "La dirección es obligatoria").max(300),
  zone: optionalText,
  reference: optionalText,
  isDefault: z.coerce.boolean().default(false),
});
export type AddAddressInput = z.infer<typeof addAddressSchema>;

export const addNoteSchema = z.object({
  body: z.string().trim().min(1, "Escribe una nota").max(2000),
});
export type AddNoteInput = z.infer<typeof addNoteSchema>;

export const updateCustomerSchema = z
  .object({
    name: z.string().trim().min(1).max(160),
    identificationType: z.enum(IDENTIFICATION_TYPES),
    identification: optionalText,
    email: optionalEmail,
    phone: optionalText,
    notes: optionalText,
  })
  .partial()
  .refine((d) => Object.keys(d).length > 0, {
    message: "No hay cambios que guardar",
  });
export type UpdateCustomerInput = z.infer<typeof updateCustomerSchema>;
