import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useLeads } from "@/lib/queries";
import { LeadTable } from "@/components/LeadTable";
import { LeadFilters, type Filters } from "@/components/LeadFilters";
import { Spinner } from "@/components/ui/Spinner";
import type { LeadStatus } from "@/types/lead";
import { ChevronLeft, ChevronRight } from "lucide-react";

const PAGE_SIZE = 20;

function useSources(leads: { source: string | null }[] = []): string[] {
  const set = new Set<string>();
  for (const l of leads) {
    if (l.source) set.add(l.source);
  }
  return Array.from(set).sort();
}

export function LeadsList() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [filters, setFilters] = useState<Filters>({
    search: searchParams.get("search") ?? "",
    status: (searchParams.get("status") as LeadStatus | "") ?? "",
    source: searchParams.get("source") ?? "",
  });

  const [page, setPage] = useState(1);
  const [sort, setSort] = useState({
    column: "created_at",
    order: "desc" as "asc" | "desc",
  });

  // Sync filters → URL
  useEffect(() => {
    const p = new URLSearchParams();
    if (filters.search) p.set("search", filters.search);
    if (filters.status) p.set("status", filters.status);
    if (filters.source) p.set("source", filters.source);
    setSearchParams(p, { replace: true });
    setPage(1);
  }, [filters]);

  const { data, isLoading, isFetching } = useLeads({
    page,
    page_size: PAGE_SIZE,
    status: filters.status || undefined,
    source: filters.source || undefined,
    search: filters.search || undefined,
    sort_by: sort.column,
    sort_order: sort.order,
  });

  // Collect all sources from loaded leads for filter
  const { data: allLeadsData } = useLeads({ page_size: 100 });
  const sources = useSources(allLeadsData?.items);

  function handleSort(column: string) {
    setSort((prev) =>
      prev.column === column
        ? { column, order: prev.order === "asc" ? "desc" : "asc" }
        : { column, order: "desc" }
    );
  }

  const total = data?.total ?? 0;
  const pages = data?.pages ?? 1;

  return (
    <div className="p-6">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Leads</h1>
          {!isLoading && (
            <p className="mt-0.5 text-sm text-gray-500">
              {total} lead{total !== 1 ? "s" : ""}
            </p>
          )}
        </div>
        {isFetching && !isLoading && (
          <Spinner className="text-blue-500" />
        )}
      </div>

      <div className="mb-4">
        <LeadFilters
          filters={filters}
          onChange={setFilters}
          sources={sources}
        />
      </div>

      {isLoading ? (
        <div className="flex h-40 items-center justify-center">
          <Spinner />
        </div>
      ) : (
        <>
          <LeadTable
            leads={data?.items ?? []}
            sort={sort}
            onSort={handleSort}
          />

          {/* Pagination */}
          {pages > 1 && (
            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-gray-500">
                Page {page} / {pages} — {total} résultats
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="flex items-center gap-1 rounded-md border px-3 py-1.5 text-sm disabled:opacity-40 hover:bg-gray-50"
                >
                  <ChevronLeft className="h-4 w-4" /> Précédent
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(pages, p + 1))}
                  disabled={page >= pages}
                  className="flex items-center gap-1 rounded-md border px-3 py-1.5 text-sm disabled:opacity-40 hover:bg-gray-50"
                >
                  Suivant <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
