import { useStats, useLeads } from "@/lib/queries";
import { LeadStatusBadge } from "@/components/ui/LeadStatusBadge";
import { Spinner } from "@/components/ui/Spinner";
import { timeAgo } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import {
  Users,
  UserPlus,
  PhoneCall,
  TrendingUp,
} from "lucide-react";

function StatCard({
  icon: Icon,
  label,
  value,
  color,
  onClick,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  color: string;
  onClick?: () => void;
}) {
  return (
    <div
      className={`rounded-xl border bg-white p-5 shadow-sm ${onClick ? "cursor-pointer hover:shadow-md transition-shadow" : ""}`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{label}</p>
          <p className="mt-1 text-3xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`rounded-full p-3 ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </div>
  );
}

export function Dashboard() {
  const navigate = useNavigate();
  const { data: stats, isLoading: statsLoading } = useStats();
  const { data: recentLeads, isLoading: leadsLoading } = useLeads({
    page: 1,
    page_size: 10,
    sort_by: "created_at",
    sort_order: "desc",
  });

  if (statsLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Dashboard</h1>

      {/* KPI Cards */}
      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          icon={Users}
          label="Total leads"
          value={stats?.total ?? 0}
          color="bg-blue-500"
          onClick={() => navigate("/leads")}
        />
        <StatCard
          icon={UserPlus}
          label="Nouveaux aujourd'hui"
          value={stats?.new_today ?? 0}
          color="bg-emerald-500"
        />
        <StatCard
          icon={PhoneCall}
          label="À rappeler aujourd'hui"
          value={stats?.to_call_today ?? 0}
          color="bg-orange-500"
          onClick={() => navigate("/to-call")}
        />
        <StatCard
          icon={TrendingUp}
          label="Convertis"
          value={stats?.converted ?? 0}
          color="bg-purple-500"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Pipeline by status */}
        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500">
            Pipeline
          </h2>
          <div className="space-y-2">
            {stats?.by_status &&
              Object.entries(stats.by_status).map(([status, count]) => (
                <div
                  key={status}
                  className="flex items-center justify-between cursor-pointer hover:bg-gray-50 rounded p-1"
                  onClick={() =>
                    navigate(`/leads?status=${status}`)
                  }
                >
                  <LeadStatusBadge status={status as any} />
                  <span className="text-sm font-semibold text-gray-700">
                    {count}
                  </span>
                </div>
              ))}
          </div>
        </div>

        {/* By source */}
        {stats?.by_source && Object.keys(stats.by_source).length > 0 && (
          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500">
              Par source
            </h2>
            <div className="space-y-2">
              {Object.entries(stats.by_source)
                .sort(([, a], [, b]) => b - a)
                .map(([source, count]) => (
                  <div
                    key={source}
                    className="flex items-center justify-between"
                  >
                    <span className="text-sm text-gray-600">{source}</span>
                    <span className="text-sm font-semibold text-gray-700">
                      {count}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Recent leads */}
        <div className="rounded-xl border bg-white p-5 shadow-sm lg:col-span-1">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500">
            Leads récents
          </h2>
          {leadsLoading ? (
            <Spinner />
          ) : (
            <div className="space-y-3">
              {recentLeads?.items.map((lead) => (
                <div
                  key={lead.id}
                  className="flex cursor-pointer items-start justify-between rounded-md p-2 hover:bg-gray-50"
                  onClick={() => navigate(`/leads/${lead.id}`)}
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-gray-900">
                      {lead.prenom} {lead.nom}
                    </p>
                    <p className="text-xs text-gray-400">
                      {timeAgo(lead.created_at)}
                    </p>
                  </div>
                  <LeadStatusBadge status={lead.status} className="ml-2 flex-shrink-0" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
