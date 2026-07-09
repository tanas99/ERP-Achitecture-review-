# Workflow — Conversión de Lead a Cliente

**Estado:** Congelado (regla de negocio aprobada) · Fase 1
**Ámbito:** módulo `crm`

## Regla

Un **Lead NO es un Cliente**. Un Lead se convierte en Cliente en el **primero** de estos dos eventos, lo que ocurra primero:

1. Se **acepta su primera cotización**, o
2. Se **recibe el primer anticipo/pago**.

**No** se espera a que un pedido se complete o se entregue.

## Flujo

```
Instagram / TikTok / Facebook / Google / Website / WhatsApp / Referido / Walk-in / Evento / Corporativo
        ↓
      LEAD  (source, status, vendedora asignada, seguimiento)
        ↓  cotización
   COTIZACIÓN
        ↓  (se ACEPTA la cotización)  ──┐
        ↓                                ├──►  se dispara la CONVERSIÓN (lo que pase primero)
        ↓  (se recibe el 1er PAGO)  ─────┘
        ↓
     CLIENTE   (se crea aquí; becameCustomerAt = ahora)
        ↓
      PEDIDO   (guarda snapshot inmutable del cliente)
```

## Efectos de la conversión (en el sistema)

Al dispararse la conversión, el módulo `crm`:

- Crea el registro **Customer**.
- Marca en el Lead: `convertedAt` (fecha) y `convertedCustomerId` (a qué cliente).
- Marca en el Cliente: `becameCustomerAt`.
- **Re-vincula** la cotización y/o el pedido de origen al nuevo Cliente.
- Emite el evento `LeadConverted` (para timeline del cliente, métricas y automatizaciones).

## Garantías

- **Idempotente:** un Lead se convierte **una sola vez**. Si ya tiene `convertedCustomerId`, no se vuelve a convertir aunque después se acepte otra cotización o llegue otro pago.
- **Inmutabilidad:** el pedido siempre guarda su "foto" del cliente (nombre, teléfono, identificación, dirección), así que los pedidos históricos no cambian aunque el cliente edite sus datos luego.
- **Sin cambio de estructura:** esta regla es lógica de negocio; la base de datos ya la soporta con los campos existentes. No requiere una nueva migración.
