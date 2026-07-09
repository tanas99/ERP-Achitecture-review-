import Link from "next/link";

/** Offset pagination footer. `hrefFor` builds a URL for a target page. */
export function Pagination({
  page,
  pageSize,
  total,
  hrefFor,
}: {
  page: number;
  pageSize: number;
  total: number;
  hrefFor: (page: number) => string;
}) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  if (totalPages <= 1) return null;

  const from = (page - 1) * pageSize + 1;
  const to = Math.min(total, page * pageSize);

  return (
    <div className="flex items-center justify-between text-sm text-muted-foreground">
      <span>
        {from}–{to} de {total}
      </span>
      <div className="flex gap-2">
        <Link
          aria-disabled={page <= 1}
          href={hrefFor(Math.max(1, page - 1))}
          className={`rounded-md border border-border px-3 py-1 ${
            page <= 1 ? "pointer-events-none opacity-50" : "hover:bg-muted"
          }`}
        >
          Anterior
        </Link>
        <Link
          aria-disabled={page >= totalPages}
          href={hrefFor(Math.min(totalPages, page + 1))}
          className={`rounded-md border border-border px-3 py-1 ${
            page >= totalPages ? "pointer-events-none opacity-50" : "hover:bg-muted"
          }`}
        >
          Siguiente
        </Link>
      </div>
    </div>
  );
}
