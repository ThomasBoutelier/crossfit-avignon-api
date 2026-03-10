import { useNavigate } from "react-router-dom";
import { formatDate, timeAgo } from "@/lib/utils";
import { LeadStatusSelect } from "./ui/LeadStatusSelect";
import { useUpdateLead } from "@/lib/queries";
import type { Lead, LeadStatus } from "@/types/lead";
import { Phone, ChevronUp, ChevronDown } from "lucide-react";
import { isToday, isPast, parseISO } from "date-fns";

interface SortConfig {
  column: string;
  order: "asc" | "desc";
}

interface LeadTableProps {
  leads: Lead[];
  sort: SortConfig;
  onSort: (column: string) => void;
}

function SortIcon({
  column,
  sort,
}: {
  column: string;
  sort: SortConfig;
}) {
  if (sort.column !== column)
    return <ChevronUp className="h-3.5 w-3.5 text-gray-300" />;
  return sort.order === "asc" ? (
    <ChevronUp className="h-3.5 w-3.5 text-blue-500" />
  ) : (
    <ChevronDown className="h-3.5 w-3.5 text-blue-500" />
  );
}

function NextActionCell({ date }: { date: string | null }) {
  if (!date) return <span className="text-gray-300">—</span>;
  const d = parseISO(date);
  const overdue = isPast(d) && !isToday(d);
  const today = isToday(d);
  return (
    <span
      className={
        overdue
          ? "font-medium text-red-600"
          : today
            ? "font-medium text-orange-500"
            : "text-gray-700"
      }
    >
      {formatDate(date)}
      {today && (
        <span className="ml-1 rounded bg-orange-100 px-1 py-0.5 text-xs text-orange-700">
          Aujourd'hui
        </span>
      )}
      {overdue && (
        <span className="ml-1 rounded bg-red-100 px-1 py-0.5 text-xs text-red-700">
          En retard
        </span>
      )}
    </span>
  );
}

export function LeadTable({ leads, sort, onSort }: LeadTableProps) {
  const navigate = useNavigate();
  const { mutate: updateLead, isPending } = useUpdateLead();

  const th = (label: string, col: string) => (
    <th
      className="cursor-pointer select-none whitespace-nowrap px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 hover:text-gray-800"
      onClick={() => onSort(col)}
    >
      <span className="inline-flex items-center gap-1">
        {label}
        <SortIcon column={col} sort={sort} />
      </span>
    </th>
  );

  if (leads.length === 0) {
    return (
      <div className="rounded-lg border bg-white p-10 text-center text-gray-500">
        Aucun lead trouvé.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border bg-white shadow-sm">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {th("Prénom", "prenom")}
            {th("Nom", "nom")}
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Téléphone
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Source
            </th>
            {th("Statut", "status")}
            {th("Créé", "created_at")}
            {th("Prochaine action", "next_action_date")}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 bg-white">
          {leads.map((lead) => (
            <tr
              key={lead.id}
              className="cursor-pointer hover:bg-blue-50 transition-colors"
              onClick={() => navigate(`/leads/${lead.id}`)}
            >
              <td className="px-4 py-3 text-sm font-medium text-gray-900">
                {lead.prenom}
              </td>
              <td className="px-4 py-3 text-sm text-gray-700">{lead.nom}</td>
              <td className="px-4 py-3 text-sm text-gray-600">
                {lead.telephone ? (
                  <a
                    href={`tel:${lead.telephone}`}
                    className="inline-flex items-center gap-1 text-blue-600 hover:underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Phone className="h-3.5 w-3.5" />
                    {lead.telephone}
                  </a>
                ) : (
                  <span className="text-gray-300">—</span>
                )}
              </td>
              <td className="px-4 py-3 text-sm text-gray-600">
                {lead.source ?? <span className="text-gray-300">—</span>}
              </td>
              <td
                className="px-4 py-3"
                onClick={(e) => e.stopPropagation()}
              >
                <LeadStatusSelect
                  value={lead.status}
                  onChange={(status: LeadStatus) =>
                    updateLead({ id: lead.id, data: { status } })
                  }
                  disabled={isPending}
                />
              </td>
              <td className="px-4 py-3 text-sm text-gray-500">
                {timeAgo(lead.created_at)}
              </td>
              <td className="px-4 py-3 text-sm">
                <NextActionCell date={lead.next_action_date} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
