import { ALL_STATUSES, STATUS_LABELS } from "@/lib/utils";
import type { LeadStatus } from "@/types/lead";

interface LeadStatusSelectProps {
  value: LeadStatus;
  onChange: (status: LeadStatus) => void;
  disabled?: boolean;
  className?: string;
}

export function LeadStatusSelect({
  value,
  onChange,
  disabled,
  className,
}: LeadStatusSelectProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as LeadStatus)}
      disabled={disabled}
      className={`rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50 ${className ?? ""}`}
    >
      {ALL_STATUSES.map((s) => (
        <option key={s} value={s}>
          {STATUS_LABELS[s]}
        </option>
      ))}
    </select>
  );
}
