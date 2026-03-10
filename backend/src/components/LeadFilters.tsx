import { ALL_STATUSES, STATUS_LABELS } from "@/lib/utils";
import type { LeadStatus } from "@/types/lead";
import { Search, X } from "lucide-react";

export interface Filters {
  search: string;
  status: LeadStatus | "";
  source: string;
}

interface LeadFiltersProps {
  filters: Filters;
  onChange: (f: Filters) => void;
  sources: string[];
}

export function LeadFilters({ filters, onChange, sources }: LeadFiltersProps) {
  const set = (partial: Partial<Filters>) =>
    onChange({ ...filters, ...partial });

  const hasActive =
    filters.search !== "" || filters.status !== "" || filters.source !== "";

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Rechercher…"
          value={filters.search}
          onChange={(e) => set({ search: e.target.value })}
          className="h-9 rounded-md border border-gray-300 pl-8 pr-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      {/* Status filter */}
      <select
        value={filters.status}
        onChange={(e) => set({ status: e.target.value as LeadStatus | "" })}
        className="h-9 rounded-md border border-gray-300 bg-white px-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
      >
        <option value="">Tous les statuts</option>
        {ALL_STATUSES.map((s) => (
          <option key={s} value={s}>
            {STATUS_LABELS[s]}
          </option>
        ))}
      </select>

      {/* Source filter */}
      {sources.length > 0 && (
        <select
          value={filters.source}
          onChange={(e) => set({ source: e.target.value })}
          className="h-9 rounded-md border border-gray-300 bg-white px-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="">Toutes les sources</option>
          {sources.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      )}

      {/* Clear */}
      {hasActive && (
        <button
          onClick={() => onChange({ search: "", status: "", source: "" })}
          className="flex h-9 items-center gap-1 rounded-md border border-gray-300 px-3 text-sm text-gray-500 hover:bg-gray-50"
        >
          <X className="h-3.5 w-3.5" />
          Effacer
        </button>
      )}
    </div>
  );
}
