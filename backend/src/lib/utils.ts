import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import type { LeadStatus } from "@/types/lead";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "—";
  try {
    return format(parseISO(dateStr), "dd/MM/yyyy", { locale: fr });
  } catch {
    return dateStr;
  }
}

export function formatDateTime(dateStr: string | null | undefined): string {
  if (!dateStr) return "—";
  try {
    return format(parseISO(dateStr), "dd/MM/yyyy HH:mm", { locale: fr });
  } catch {
    return dateStr;
  }
}

export function timeAgo(dateStr: string | null | undefined): string {
  if (!dateStr) return "—";
  try {
    return formatDistanceToNow(parseISO(dateStr), {
      addSuffix: true,
      locale: fr,
    });
  } catch {
    return dateStr;
  }
}

export const STATUS_LABELS: Record<LeadStatus, string> = {
  new: "Nouveau",
  to_call: "À appeler",
  contacted: "Contacté",
  trial_scheduled: "Essai planifié",
  trial_done: "Essai effectué",
  converted: "Converti",
  lost: "Perdu",
};

export const STATUS_COLORS: Record<LeadStatus, string> = {
  new: "bg-blue-100 text-blue-800",
  to_call: "bg-yellow-100 text-yellow-800",
  contacted: "bg-purple-100 text-purple-800",
  trial_scheduled: "bg-orange-100 text-orange-800",
  trial_done: "bg-indigo-100 text-indigo-800",
  converted: "bg-green-100 text-green-800",
  lost: "bg-gray-100 text-gray-600",
};

export const EXPERIENCE_LABELS: Record<string, string> = {
  debutant: "Débutant",
  sportif: "Sportif",
  confirme: "Confirmé",
  crossfit: "CrossFit",
};

export const ALL_STATUSES: LeadStatus[] = [
  "new",
  "to_call",
  "contacted",
  "trial_scheduled",
  "trial_done",
  "converted",
  "lost",
];

export const EVENT_TYPE_LABELS: Record<string, string> = {
  created: "Lead créé",
  status_changed: "Statut modifié",
  note_added: "Note ajoutée",
};
