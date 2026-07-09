import Link from "next/link";
import { notFound } from "next/navigation";
import { getRequestContext } from "@/server/auth/context";
import { getCustomer, listCrmOptions } from "@/modules/crm";
import { NotFoundError } from "@/modules/shared/domain/errors";
import { CustomerEditForm } from "@/modules/crm/ui/customer-edit-form";
import {
  AddAddressForm,
  AddNoteForm,
  AddressList,
  NotesList,
  TagManager,
} from "@/modules/crm/ui/customer-sections";
import { CustomerTimeline } from "@/modules/crm/ui/customer-timeline";
import { ID_TYPE_LABELS, formatDate } from "@/modules/crm/ui/labels";

function Card({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[var(--radius)] border border-border bg-card p-5">
      <h2 className="mb-3 text-sm font-semibold">{title}</h2>
      {children}
    </section>
  );
}

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const ctx = await getRequestContext();
  const { id } = await params;

  let customer;
  try {
    customer = await getCustomer(ctx, id);
  } catch (e) {
    if (e instanceof NotFoundError) notFound();
    throw e;
  }
  const options = await listCrmOptions(ctx);

  return (
    <div className="space-y-6">
      <div>
        <Link href="/clientes" className="text-sm text-muted-foreground hover:underline">
          ← Clientes
        </Link>
        <h1 className="mt-1 text-2xl font-semibold">{customer.name}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {ID_TYPE_LABELS[customer.identificationType]}
          {customer.identification ? ` · ${customer.identification}` : ""} · Cliente
          desde {formatDate(customer.becameCustomerAt ?? customer.createdAt)}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <Card title="Ficha del cliente">
            <CustomerEditForm
              customerId={customer.id}
              defaults={{
                name: customer.name,
                identificationType: customer.identificationType,
                identification: customer.identification ?? "",
                email: customer.email ?? "",
                phone: customer.phone ?? "",
                notes: customer.notes ?? "",
              }}
            />
          </Card>

          <Card title="Etiquetas">
            <TagManager
              customerId={customer.id}
              tags={customer.tags}
              allTags={options.tags}
            />
          </Card>

          <Card title="Direcciones">
            <div className="space-y-4">
              <AddressList items={customer.addresses} />
              <AddAddressForm customerId={customer.id} />
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card title="Notas">
            <div className="space-y-4">
              <AddNoteForm customerId={customer.id} />
              <NotesList items={customer.customerNotes} />
            </div>
          </Card>

          <Card title="Línea de tiempo">
            <CustomerTimeline items={customer.timeline} />
          </Card>
        </div>
      </div>
    </div>
  );
}
