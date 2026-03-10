import { useLeadsToCall } from "@/lib/queries";
import { LeadTable } from "@/components/LeadTable";
import { Spinner } from "@/components/ui/Spinner";
import { useState } from "react";
import { PhoneCall, CheckCircle } from "lucide-react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function ToCall() {
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState({
    column: "next_action_date",
    order: "asc" as "asc" | "desc",
  });

  const { data, isLoading } = useLeadsToCall({ page, page_size: 20 });
  const total = data?.total ?? 0;
  const pages = data?.pages ?? 1;

  function handleSort(column: string) {
    setSort((prev) =>
      prev.column === column
        ? { column, order: prev.order === "asc" ? "desc" : "asc" }
        : { column, order: "asc" }
    );
  }

  // Client-side sort since the API always returns sorted by next_action_date
  const leads = [...(data?.items ?? [])].sort((a, b) => {
    const valA = (a as any)[sort.column] ?? "";
    const valB = (b as any)[sort.column] ?? "";
    const cmp = valA < valB ? -1 : valA > valB ? 1 : 0;
    return sort.order === "asc" ? cmp : -cmp;
  });

  return (
    <div className="p-6">
      <div className="mb-5 flex items-center gap-3">
        <div className="rounded-full bg-orange-100 p-2">
          <PhoneCall className="h-5 w-5 text-orange-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">À rappeler</h1>
          <p className="text-sm text-gray-500">
            Liste de travail — leads à contacter aujourd'hui
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex h-40 items-center justify-center">
          <Spinner />
        </div>
      ) : total === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border bg-white py-16 text-center shadow-sm">
          <CheckCircle className="mb-3 h-10 w-10 text-green-400" />
          <p className="text-lg font-semibold text-gray-700">
            Aucun rappel pour aujourd'hui !
          </p>
          <p className="mt-1 text-sm text-gray-400">
            Tous les leads sont à jour.
          </p>
        </div>
      ) : (
        <>
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              {total} lead{total !== 1 ? "s" : ""} à rappeler
            </p>
          </div>

          <LeadTable leads={leads} sort={sort} onSort={handleSort} />

          {pages > 1 && (
            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-gray-500">
                Page {page} / {pages}
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
