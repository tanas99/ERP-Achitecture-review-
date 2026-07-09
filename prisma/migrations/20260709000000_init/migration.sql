-- ============================================================================
-- Tana's Bakery Shop ERP — Initial migration (Phase 1 · Milestone 1)
-- NOTE: Hand-authored to mirror prisma/schema.prisma because the build sandbox
--       cannot download the Prisma migration engine. In a networked environment,
--       finalize/verify with:  npx prisma migrate dev --name init
-- ============================================================================

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
CREATE TYPE "RoleName" AS ENUM ('ADMINISTRADOR', 'VENTAS', 'PRODUCCION', 'MARKETING', 'CONTABILIDAD', 'REPARTIDOR');
CREATE TYPE "LeadSource" AS ENUM ('INSTAGRAM', 'TIKTOK', 'FACEBOOK', 'GOOGLE', 'WEBSITE', 'WHATSAPP', 'REFERIDO', 'WALK_IN', 'EVENTO', 'CORPORATIVO', 'OTRO');
CREATE TYPE "LeadStatus" AS ENUM ('NUEVO', 'CONTACTADO', 'COTIZADO', 'EN_NEGOCIACION', 'GANADO', 'PERDIDO');
CREATE TYPE "LeadActivityType" AS ENUM ('LLAMADA', 'WHATSAPP', 'MENSAJE', 'CORREO', 'REUNION', 'NOTA', 'OTRO');
CREATE TYPE "LostReason" AS ENUM ('PRECIO', 'SIN_RESPUESTA', 'COMPRO_EN_OTRO_LADO', 'EVENTO_CANCELADO', 'OTRO');
CREATE TYPE "IdentificationType" AS ENUM ('RUC', 'CEDULA', 'PASAPORTE', 'CONSUMIDOR_FINAL');
CREATE TYPE "CustomerTimelineType" AS ENUM ('LEAD', 'COTIZACION', 'PEDIDO', 'PAGO', 'ENTREGA', 'DOCUMENTO', 'NOTA', 'ADJUNTO', 'ACTIVIDAD', 'LLAMADA', 'MENSAJE', 'CORREO', 'NOTA_INTERNA');
CREATE TYPE "ProductCategory" AS ENUM ('PASTEL_PERSONALIZADO', 'VINTAGE_CAKE', 'BENTO_CAKE', 'CUPCAKE', 'GALLETA', 'BROWNIE', 'CHEESECAKE', 'OTRO');
CREATE TYPE "QuotationStatus" AS ENUM ('BORRADOR', 'ENVIADA', 'APROBADA', 'RECHAZADA', 'PERDIDA', 'EXPIRADA');
CREATE TYPE "OrderStatus" AS ENUM ('COTIZACION', 'ESPERANDO_ANTICIPO', 'CONFIRMADO', 'EN_PRODUCCION', 'LISTO', 'EN_ENTREGA', 'ENTREGADO', 'CANCELADO');
CREATE TYPE "OrderPriority" AS ENUM ('LOW', 'NORMAL', 'HIGH', 'URGENT');
CREATE TYPE "PaymentStatus" AS ENUM ('SIN_PAGO', 'RESERVA', 'ANTICIPO', 'PAGADO_TOTAL', 'REEMBOLSADO');
CREATE TYPE "PaymentTier" AS ENUM ('RESERVA', 'ANTICIPO', 'SALDO', 'TOTAL', 'REEMBOLSO');
CREATE TYPE "PaymentMethod" AS ENUM ('EFECTIVO', 'TRANSFERENCIA', 'TARJETA', 'OTRO');
CREATE TYPE "EventType" AS ENUM ('CUMPLEANOS', 'BODA', 'BABY_SHOWER', 'CORPORATIVO', 'GRADUACION', 'OTRO');
CREATE TYPE "DeliveryType" AS ENUM ('PICKUP', 'INTERNAL', 'THIRD_PARTY');
CREATE TYPE "DeliveryStatus" AS ENUM ('PENDIENTE', 'EN_RUTA', 'ENTREGADO', 'FALLIDO');
CREATE TYPE "ProductionStatus" AS ENUM ('PENDIENTE', 'PREPARANDO_MEZCLA', 'HORNEANDO', 'ENFRIANDO', 'RELLENANDO', 'CUBRIENDO', 'DECORANDO', 'EMPACANDO', 'FINALIZADO');
CREATE TYPE "ProductionTaskType" AS ENUM ('PREPARAR_MEZCLA', 'HORNEAR', 'ENFRIAR', 'RELLENAR', 'CRUMB_COAT', 'DECORACION_FINAL', 'EMPAQUE', 'OTRO');
CREATE TYPE "ProductionTaskStatus" AS ENUM ('PENDIENTE', 'EN_PROGRESO', 'FINALIZADO', 'OMITIDO');
CREATE TYPE "CalendarEntryType" AS ENUM ('ENTREGA', 'PRODUCCION', 'EVENTO', 'OTRO');
CREATE TYPE "DocumentType" AS ENUM ('FACTURA', 'NOTA_VENTA', 'NOTA_CREDITO', 'NOTA_DEBITO', 'COMPROBANTE_RETENCION');
CREATE TYPE "DocumentStatus" AS ENUM ('DRAFT', 'GENERATED', 'SIGNED', 'SENT', 'AUTHORIZED', 'REJECTED', 'RETURNED');
CREATE TYPE "SriEnvironment" AS ENUM ('TEST', 'PROD');
CREATE TYPE "MediaVisibility" AS ENUM ('PRIVATE', 'PUBLIC_SIGNED');
CREATE TYPE "NotificationChannel" AS ENUM ('IN_APP', 'EMAIL', 'WHATSAPP', 'PUSH');
CREATE TYPE "NotificationStatus" AS ENUM ('PENDING', 'SENT', 'FAILED', 'READ');
CREATE TYPE "IntegrationType" AS ENUM ('WHATSAPP', 'PAYMENT_GATEWAY', 'ECOMMERCE', 'EMAIL', 'SRI_TRANSPORT');
CREATE TYPE "AuditAction" AS ENUM ('CREATE', 'UPDATE', 'DELETE');

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------
CREATE TABLE "companies" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "companies_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "passwordHash" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "mfaSecret" TEXT,
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "roles" (
    "id" TEXT NOT NULL,
    "name" "RoleName" NOT NULL,
    "description" TEXT,
    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "permissions" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "description" TEXT,
    CONSTRAINT "permissions_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "user_roles" (
    "userId" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    CONSTRAINT "user_roles_pkey" PRIMARY KEY ("userId", "roleId")
);

CREATE TABLE "role_permissions" (
    "roleId" TEXT NOT NULL,
    "permissionId" TEXT NOT NULL,
    CONSTRAINT "role_permissions_pkey" PRIMARY KEY ("roleId", "permissionId")
);

CREATE TABLE "accounts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,
    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "verification_tokens" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

CREATE TABLE "leads" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "source" "LeadSource" NOT NULL DEFAULT 'OTRO',
    "status" "LeadStatus" NOT NULL DEFAULT 'NUEVO',
    "assignedToId" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "socialHandle" TEXT,
    "referredBy" TEXT,
    "lastContactAt" TIMESTAMP(3),
    "nextFollowUpAt" TIMESTAMP(3),
    "convertedAt" TIMESTAMP(3),
    "convertedCustomerId" TEXT,
    "lostReason" "LostReason",
    "lostReasonNote" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdById" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    CONSTRAINT "leads_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "lead_activities" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "type" "LeadActivityType" NOT NULL DEFAULT 'NOTA',
    "summary" TEXT NOT NULL,
    "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "lead_activities_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "customers" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "identificationType" "IdentificationType" NOT NULL DEFAULT 'CONSUMIDOR_FINAL',
    "identification" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "notes" TEXT,
    "becameCustomerAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdById" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedById" TEXT,
    "deletedAt" TIMESTAMP(3),
    CONSTRAINT "customers_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "customer_addresses" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "zone" TEXT,
    "reference" TEXT,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    CONSTRAINT "customer_addresses_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "tags" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "tags_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "customer_tags" (
    "customerId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "customer_tags_pkey" PRIMARY KEY ("customerId", "tagId")
);

CREATE TABLE "customer_notes" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "customer_notes_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "customer_timeline_entries" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "type" "CustomerTimelineType" NOT NULL,
    "title" TEXT NOT NULL,
    "refType" TEXT,
    "refId" TEXT,
    "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "customer_timeline_entries_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "products" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" "ProductCategory" NOT NULL DEFAULT 'OTRO',
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "product_prices" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "priceCents" INTEGER NOT NULL,
    "effectiveFrom" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "effectiveTo" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "product_prices_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "quotations" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "leadId" TEXT,
    "customerId" TEXT,
    "number" INTEGER NOT NULL,
    "status" "QuotationStatus" NOT NULL DEFAULT 'BORRADOR',
    "subtotalCents" INTEGER NOT NULL DEFAULT 0,
    "taxCents" INTEGER NOT NULL DEFAULT 0,
    "totalCents" INTEGER NOT NULL DEFAULT 0,
    "validUntil" TIMESTAMP(3),
    "lostReason" "LostReason",
    "lostReasonNote" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdById" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedById" TEXT,
    "deletedAt" TIMESTAMP(3),
    CONSTRAINT "quotations_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "quotation_items" (
    "id" TEXT NOT NULL,
    "quotationId" TEXT NOT NULL,
    "productId" TEXT,
    "description" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "unitPriceCents" INTEGER NOT NULL,
    "lineTotalCents" INTEGER NOT NULL,
    "attributes" JSONB,
    CONSTRAINT "quotation_items_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "orders" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "leadId" TEXT,
    "customerId" TEXT,
    "customerAddressId" TEXT,
    "quotationId" TEXT,
    "number" INTEGER NOT NULL,
    "status" "OrderStatus" NOT NULL DEFAULT 'ESPERANDO_ANTICIPO',
    "priority" "OrderPriority" NOT NULL DEFAULT 'NORMAL',
    "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'SIN_PAGO',
    "customerNameSnapshot" TEXT NOT NULL,
    "customerPhoneSnapshot" TEXT,
    "customerEmailSnapshot" TEXT,
    "customerIdentificationSnapshot" TEXT,
    "customerIdTypeSnapshot" "IdentificationType",
    "deliveryAddressSnapshot" TEXT,
    "deliveryZoneSnapshot" TEXT,
    "deliveryCourierSnapshot" TEXT,
    "deliveryFeeCentsSnapshot" INTEGER,
    "eventType" "EventType",
    "eventName" TEXT,
    "eventDate" TIMESTAMP(3),
    "eventTime" TEXT,
    "subtotalCents" INTEGER NOT NULL DEFAULT 0,
    "taxCents" INTEGER NOT NULL DEFAULT 0,
    "totalCents" INTEGER NOT NULL DEFAULT 0,
    "paidCents" INTEGER NOT NULL DEFAULT 0,
    "balanceCents" INTEGER NOT NULL DEFAULT 0,
    "dueDate" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdById" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedById" TEXT,
    "deletedAt" TIMESTAMP(3),
    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "order_items" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "productId" TEXT,
    "description" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "unitPriceCents" INTEGER NOT NULL,
    "unitCostCents" INTEGER,
    "lineTotalCents" INTEGER NOT NULL,
    "attributes" JSONB,
    CONSTRAINT "order_items_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "payments" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "tier" "PaymentTier" NOT NULL,
    "method" "PaymentMethod" NOT NULL DEFAULT 'TRANSFERENCIA',
    "amountCents" INTEGER NOT NULL,
    "reference" TEXT,
    "paidAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "confirmedById" TEXT,
    "confirmedAt" TIMESTAMP(3),
    "createdById" TEXT,
    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "deliveries" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "type" "DeliveryType" NOT NULL DEFAULT 'PICKUP',
    "status" "DeliveryStatus" NOT NULL DEFAULT 'PENDIENTE',
    "address" TEXT,
    "zone" TEXT,
    "feeCents" INTEGER NOT NULL DEFAULT 0,
    "scheduledAt" TIMESTAMP(3),
    "deliveredAt" TIMESTAMP(3),
    "courierName" TEXT,
    "assignedToId" TEXT,
    "notes" TEXT,
    CONSTRAINT "deliveries_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "order_status_history" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "fromStatus" "OrderStatus",
    "toStatus" "OrderStatus" NOT NULL,
    "reason" TEXT,
    "changedById" TEXT,
    "changedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "order_status_history_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "production_orders" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "status" "ProductionStatus" NOT NULL DEFAULT 'PENDIENTE',
    "assignedToId" TEXT,
    "startedAt" TIMESTAMP(3),
    "finishedAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "production_orders_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "production_tasks" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "productionOrderId" TEXT NOT NULL,
    "type" "ProductionTaskType" NOT NULL DEFAULT 'OTRO',
    "name" TEXT NOT NULL,
    "status" "ProductionTaskStatus" NOT NULL DEFAULT 'PENDIENTE',
    "sequence" INTEGER NOT NULL DEFAULT 0,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "assignedToId" TEXT,
    "estimatedMinutes" INTEGER,
    "actualMinutes" INTEGER,
    "startedAt" TIMESTAMP(3),
    "finishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "production_tasks_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "production_status_history" (
    "id" TEXT NOT NULL,
    "productionOrderId" TEXT NOT NULL,
    "fromStatus" "ProductionStatus",
    "toStatus" "ProductionStatus" NOT NULL,
    "changedById" TEXT,
    "changedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "production_status_history_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "calendar_entries" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "type" "CalendarEntryType" NOT NULL DEFAULT 'ENTREGA',
    "title" TEXT NOT NULL,
    "refType" TEXT,
    "refId" TEXT,
    "startAt" TIMESTAMP(3) NOT NULL,
    "endAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "calendar_entries_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "electronic_documents" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "orderId" TEXT,
    "type" "DocumentType" NOT NULL DEFAULT 'FACTURA',
    "status" "DocumentStatus" NOT NULL DEFAULT 'DRAFT',
    "environment" "SriEnvironment" NOT NULL DEFAULT 'TEST',
    "customerName" TEXT,
    "customerIdentification" TEXT,
    "subtotalCents" INTEGER NOT NULL DEFAULT 0,
    "taxCents" INTEGER NOT NULL DEFAULT 0,
    "totalCents" INTEGER NOT NULL DEFAULT 0,
    "claveAcceso" TEXT,
    "authorizationNumber" TEXT,
    "authorizationDate" TIMESTAMP(3),
    "sriMessages" JSONB,
    "xmlUrl" TEXT,
    "pdfUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "electronic_documents_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "electronic_document_items" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "unitPriceCents" INTEGER NOT NULL,
    "taxRateCode" TEXT NOT NULL,
    "taxCents" INTEGER NOT NULL DEFAULT 0,
    "lineTotalCents" INTEGER NOT NULL,
    CONSTRAINT "electronic_document_items_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "tax_rates" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "percentage" DECIMAL(5,2) NOT NULL,
    "effectiveFrom" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "effectiveTo" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "tax_rates_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "document_sequences" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "documentType" "DocumentType" NOT NULL,
    "establishment" TEXT NOT NULL,
    "emissionPoint" TEXT NOT NULL,
    "current" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "document_sequences_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "billing_config" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "ruc" TEXT,
    "razonSocial" TEXT,
    "nombreComercial" TEXT,
    "direccionMatriz" TEXT,
    "establishment" TEXT NOT NULL DEFAULT '001',
    "emissionPoint" TEXT NOT NULL DEFAULT '001',
    "environment" "SriEnvironment" NOT NULL DEFAULT 'TEST',
    "obligadoContabilidad" BOOLEAN NOT NULL DEFAULT false,
    "taxpayerRegime" TEXT,
    "certificateRef" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "billing_config_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "media_objects" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "ownerModule" TEXT NOT NULL,
    "ownerType" TEXT,
    "ownerId" TEXT,
    "orderId" TEXT,
    "key" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "checksum" TEXT,
    "visibility" "MediaVisibility" NOT NULL DEFAULT 'PRIVATE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdById" TEXT,
    CONSTRAINT "media_objects_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "notification_templates" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "channel" "NotificationChannel" NOT NULL,
    "locale" TEXT NOT NULL DEFAULT 'es-EC',
    "subject" TEXT,
    "body" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "notification_templates_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "channel" "NotificationChannel" NOT NULL,
    "status" "NotificationStatus" NOT NULL DEFAULT 'PENDING',
    "recipientUserId" TEXT,
    "toAddress" TEXT,
    "templateKey" TEXT,
    "payload" JSONB,
    "sentAt" TIMESTAMP(3),
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "settings" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedById" TEXT,
    CONSTRAINT "settings_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "feature_flags" (
    "id" TEXT NOT NULL,
    "companyId" TEXT,
    "key" TEXT NOT NULL,
    "isEnabled" BOOLEAN NOT NULL DEFAULT false,
    "targeting" JSONB,
    "description" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "feature_flags_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "integrations" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "type" "IntegrationType" NOT NULL,
    "provider" TEXT NOT NULL,
    "isEnabled" BOOLEAN NOT NULL DEFAULT false,
    "config" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "integrations_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "integration_credentials" (
    "id" TEXT NOT NULL,
    "integrationId" TEXT NOT NULL,
    "keyName" TEXT NOT NULL,
    "encryptedValue" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "integration_credentials_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "webhook_events" (
    "id" TEXT NOT NULL,
    "integrationId" TEXT,
    "provider" TEXT NOT NULL,
    "eventType" TEXT,
    "payload" JSONB NOT NULL,
    "processedAt" TIMESTAMP(3),
    "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "webhook_events_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "activity_entries" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "actorId" TEXT,
    "verb" TEXT NOT NULL,
    "entityType" TEXT,
    "entityId" TEXT,
    "summary" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "activity_entries_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "userId" TEXT,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "action" "AuditAction" NOT NULL,
    "before" JSONB,
    "after" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- ---------------------------------------------------------------------------
-- Indexes & unique constraints
-- ---------------------------------------------------------------------------
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
CREATE INDEX "users_companyId_idx" ON "users"("companyId");
CREATE UNIQUE INDEX "roles_name_key" ON "roles"("name");
CREATE UNIQUE INDEX "permissions_key_key" ON "permissions"("key");
CREATE UNIQUE INDEX "accounts_provider_providerAccountId_key" ON "accounts"("provider", "providerAccountId");
CREATE UNIQUE INDEX "sessions_sessionToken_key" ON "sessions"("sessionToken");
CREATE UNIQUE INDEX "verification_tokens_token_key" ON "verification_tokens"("token");
CREATE UNIQUE INDEX "verification_tokens_identifier_token_key" ON "verification_tokens"("identifier", "token");
CREATE UNIQUE INDEX "leads_convertedCustomerId_key" ON "leads"("convertedCustomerId");
CREATE INDEX "leads_companyId_status_idx" ON "leads"("companyId", "status");
CREATE INDEX "leads_companyId_assignedToId_idx" ON "leads"("companyId", "assignedToId");
CREATE INDEX "leads_companyId_nextFollowUpAt_idx" ON "leads"("companyId", "nextFollowUpAt");
CREATE INDEX "lead_activities_leadId_occurredAt_idx" ON "lead_activities"("leadId", "occurredAt");
CREATE INDEX "customers_companyId_idx" ON "customers"("companyId");
CREATE INDEX "customers_companyId_name_idx" ON "customers"("companyId", "name");
CREATE INDEX "customer_addresses_customerId_idx" ON "customer_addresses"("customerId");
CREATE UNIQUE INDEX "tags_companyId_name_key" ON "tags"("companyId", "name");
CREATE INDEX "customer_notes_customerId_createdAt_idx" ON "customer_notes"("customerId", "createdAt");
CREATE INDEX "customer_timeline_entries_customerId_occurredAt_idx" ON "customer_timeline_entries"("customerId", "occurredAt");
CREATE INDEX "products_companyId_idx" ON "products"("companyId");
CREATE INDEX "product_prices_productId_effectiveFrom_idx" ON "product_prices"("productId", "effectiveFrom");
CREATE UNIQUE INDEX "quotations_companyId_number_key" ON "quotations"("companyId", "number");
CREATE INDEX "quotations_companyId_status_idx" ON "quotations"("companyId", "status");
CREATE INDEX "quotation_items_quotationId_idx" ON "quotation_items"("quotationId");
CREATE UNIQUE INDEX "orders_quotationId_key" ON "orders"("quotationId");
CREATE UNIQUE INDEX "orders_companyId_number_key" ON "orders"("companyId", "number");
CREATE INDEX "orders_companyId_status_idx" ON "orders"("companyId", "status");
CREATE INDEX "orders_companyId_priority_idx" ON "orders"("companyId", "priority");
CREATE INDEX "orders_companyId_dueDate_idx" ON "orders"("companyId", "dueDate");
CREATE INDEX "orders_companyId_eventDate_idx" ON "orders"("companyId", "eventDate");
CREATE INDEX "order_items_orderId_idx" ON "order_items"("orderId");
CREATE INDEX "payments_orderId_idx" ON "payments"("orderId");
CREATE INDEX "payments_orderId_confirmedAt_idx" ON "payments"("orderId", "confirmedAt");
CREATE UNIQUE INDEX "deliveries_orderId_key" ON "deliveries"("orderId");
CREATE INDEX "deliveries_status_idx" ON "deliveries"("status");
CREATE INDEX "order_status_history_orderId_idx" ON "order_status_history"("orderId");
CREATE UNIQUE INDEX "production_orders_orderId_key" ON "production_orders"("orderId");
CREATE INDEX "production_orders_companyId_status_idx" ON "production_orders"("companyId", "status");
CREATE INDEX "production_tasks_productionOrderId_sequence_idx" ON "production_tasks"("productionOrderId", "sequence");
CREATE INDEX "production_tasks_companyId_status_idx" ON "production_tasks"("companyId", "status");
CREATE INDEX "production_status_history_productionOrderId_idx" ON "production_status_history"("productionOrderId");
CREATE INDEX "calendar_entries_companyId_startAt_idx" ON "calendar_entries"("companyId", "startAt");
CREATE UNIQUE INDEX "electronic_documents_claveAcceso_key" ON "electronic_documents"("claveAcceso");
CREATE INDEX "electronic_documents_companyId_status_idx" ON "electronic_documents"("companyId", "status");
CREATE INDEX "electronic_document_items_documentId_idx" ON "electronic_document_items"("documentId");
CREATE UNIQUE INDEX "tax_rates_companyId_code_effectiveFrom_key" ON "tax_rates"("companyId", "code", "effectiveFrom");
CREATE INDEX "tax_rates_companyId_isActive_idx" ON "tax_rates"("companyId", "isActive");
CREATE UNIQUE INDEX "document_sequences_companyId_documentType_establishment_emissionPoint_key" ON "document_sequences"("companyId", "documentType", "establishment", "emissionPoint");
CREATE UNIQUE INDEX "billing_config_companyId_key" ON "billing_config"("companyId");
CREATE INDEX "media_objects_companyId_ownerType_ownerId_idx" ON "media_objects"("companyId", "ownerType", "ownerId");
CREATE INDEX "media_objects_orderId_idx" ON "media_objects"("orderId");
CREATE UNIQUE INDEX "notification_templates_key_key" ON "notification_templates"("key");
CREATE INDEX "notifications_companyId_recipientUserId_status_idx" ON "notifications"("companyId", "recipientUserId", "status");
CREATE UNIQUE INDEX "settings_companyId_key_key" ON "settings"("companyId", "key");
CREATE UNIQUE INDEX "feature_flags_companyId_key_key" ON "feature_flags"("companyId", "key");
CREATE UNIQUE INDEX "integrations_companyId_type_provider_key" ON "integrations"("companyId", "type", "provider");
CREATE UNIQUE INDEX "integration_credentials_integrationId_keyName_key" ON "integration_credentials"("integrationId", "keyName");
CREATE INDEX "webhook_events_provider_processedAt_idx" ON "webhook_events"("provider", "processedAt");
CREATE INDEX "activity_entries_companyId_createdAt_idx" ON "activity_entries"("companyId", "createdAt");
CREATE INDEX "activity_entries_companyId_entityType_entityId_idx" ON "activity_entries"("companyId", "entityType", "entityId");
CREATE INDEX "audit_logs_companyId_entityType_entityId_idx" ON "audit_logs"("companyId", "entityType", "entityId");
CREATE INDEX "audit_logs_companyId_createdAt_idx" ON "audit_logs"("companyId", "createdAt");

-- ---------------------------------------------------------------------------
-- Foreign keys
-- ---------------------------------------------------------------------------
ALTER TABLE "users" ADD CONSTRAINT "users_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "permissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "leads" ADD CONSTRAINT "leads_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "leads" ADD CONSTRAINT "leads_convertedCustomerId_fkey" FOREIGN KEY ("convertedCustomerId") REFERENCES "customers"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "lead_activities" ADD CONSTRAINT "lead_activities_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "leads"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "customers" ADD CONSTRAINT "customers_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "customer_addresses" ADD CONSTRAINT "customer_addresses_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "tags" ADD CONSTRAINT "tags_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "customer_tags" ADD CONSTRAINT "customer_tags_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "customer_tags" ADD CONSTRAINT "customer_tags_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "customer_notes" ADD CONSTRAINT "customer_notes_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "customer_notes" ADD CONSTRAINT "customer_notes_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "customer_timeline_entries" ADD CONSTRAINT "customer_timeline_entries_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "customer_timeline_entries" ADD CONSTRAINT "customer_timeline_entries_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "products" ADD CONSTRAINT "products_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "product_prices" ADD CONSTRAINT "product_prices_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "quotations" ADD CONSTRAINT "quotations_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "quotations" ADD CONSTRAINT "quotations_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "leads"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "quotations" ADD CONSTRAINT "quotations_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "quotation_items" ADD CONSTRAINT "quotation_items_quotationId_fkey" FOREIGN KEY ("quotationId") REFERENCES "quotations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "quotation_items" ADD CONSTRAINT "quotation_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "orders" ADD CONSTRAINT "orders_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "orders" ADD CONSTRAINT "orders_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "leads"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "orders" ADD CONSTRAINT "orders_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "orders" ADD CONSTRAINT "orders_customerAddressId_fkey" FOREIGN KEY ("customerAddressId") REFERENCES "customer_addresses"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "orders" ADD CONSTRAINT "orders_quotationId_fkey" FOREIGN KEY ("quotationId") REFERENCES "quotations"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "payments" ADD CONSTRAINT "payments_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "deliveries" ADD CONSTRAINT "deliveries_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "order_status_history" ADD CONSTRAINT "order_status_history_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "production_orders" ADD CONSTRAINT "production_orders_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "production_orders" ADD CONSTRAINT "production_orders_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "production_tasks" ADD CONSTRAINT "production_tasks_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "production_tasks" ADD CONSTRAINT "production_tasks_productionOrderId_fkey" FOREIGN KEY ("productionOrderId") REFERENCES "production_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "production_status_history" ADD CONSTRAINT "production_status_history_productionOrderId_fkey" FOREIGN KEY ("productionOrderId") REFERENCES "production_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "calendar_entries" ADD CONSTRAINT "calendar_entries_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "electronic_documents" ADD CONSTRAINT "electronic_documents_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "electronic_documents" ADD CONSTRAINT "electronic_documents_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "electronic_document_items" ADD CONSTRAINT "electronic_document_items_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "electronic_documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "tax_rates" ADD CONSTRAINT "tax_rates_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "document_sequences" ADD CONSTRAINT "document_sequences_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "billing_config" ADD CONSTRAINT "billing_config_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "media_objects" ADD CONSTRAINT "media_objects_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "media_objects" ADD CONSTRAINT "media_objects_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "settings" ADD CONSTRAINT "settings_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "feature_flags" ADD CONSTRAINT "feature_flags_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "integrations" ADD CONSTRAINT "integrations_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "integration_credentials" ADD CONSTRAINT "integration_credentials_integrationId_fkey" FOREIGN KEY ("integrationId") REFERENCES "integrations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "webhook_events" ADD CONSTRAINT "webhook_events_integrationId_fkey" FOREIGN KEY ("integrationId") REFERENCES "integrations"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "activity_entries" ADD CONSTRAINT "activity_entries_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
