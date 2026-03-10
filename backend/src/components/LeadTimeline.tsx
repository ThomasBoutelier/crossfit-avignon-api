import { formatDateTime, EVENT_TYPE_LABELS } from "@/lib/utils";
import type { LeadEvent } from "@/types/lead";
import { CheckCircle, MessageSquare, RefreshCw, UserPlus } from "lucide-react";

const EVENT_ICONS: Record<string, React.ReactNode> = {
  created: <UserPlus className="h-4 w-4 text-blue-500" />,
  status_changed: <RefreshCw className="h-4 w-4 text-purple-500" />,
  note_added: <MessageSquare className="h-4 w-4 text-yellow-500" />,
};

interface LeadTimelineProps {
  events: LeadEvent[];
}

export function LeadTimeline({ events }: LeadTimelineProps) {
  const sorted = [...events].sort(
    (a, b) => new Date(b.event_at).getTime() - new Date(a.event_at).getTime()
  );

  if (sorted.length === 0) {
    return <p className="text-sm text-gray-500">Aucun événement.</p>;
  }

  return (
    <ol className="relative border-l border-gray-200">
      {sorted.map((event, idx) => (
        <li key={event.id} className={`mb-6 ml-6 ${idx === 0 ? "" : ""}`}>
          <span className="absolute -left-3 flex h-6 w-6 items-center justify-center rounded-full bg-white ring-4 ring-white">
            {EVENT_ICONS[event.event_type] ?? (
              <CheckCircle className="h-4 w-4 text-gray-400" />
            )}
          </span>
          <div>
            <p className="text-sm font-medium text-gray-900">
              {EVENT_TYPE_LABELS[event.event_type] ?? event.event_type}
            </p>
            {event.event_note && (
              <p className="mt-0.5 text-sm text-gray-600 whitespace-pre-wrap">
                {event.event_note}
              </p>
            )}
            <time className="mt-0.5 block text-xs text-gray-400">
              {formatDateTime(event.event_at)}
            </time>
          </div>
        </li>
      ))}
    </ol>
  );
}
