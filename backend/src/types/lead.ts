export type LeadStatus =
  | "new"
  | "to_call"
  | "contacted"
  | "trial_scheduled"
  | "trial_done"
  | "converted"
  | "lost";

export type SportExperience =
  | "debutant"
  | "sportif"
  | "confirme"
  | "crossfit";

export interface LeadEvent {
  id: string;
  event_type: string;
  event_note: string | null;
  event_at: string;
}

export interface Lead {
  id: string;
  prenom: string;
  nom: string;
  email: string;
  telephone: string | null;
  experience: SportExperience | null;
  message: string | null;
  source: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  utm_term: string | null;
  referrer: string | null;
  landing_url: string | null;
  status: LeadStatus;
  lost_reason: string | null;
  notes: string | null;
  next_action_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface LeadWithEvents extends Lead {
  events: LeadEvent[];
}

export interface LeadListResponse {
  items: Lead[];
  total: number;
  page: number;
  page_size: number;
  pages: number;
}

export interface LeadUpdate {
  status?: LeadStatus;
  lost_reason?: string | null;
  notes?: string | null;
  next_action_date?: string | null;
}

export interface DashboardStats {
  total: number;
  new_today: number;
  converted: number;
  to_call_today: number;
  by_status: Partial<Record<LeadStatus, number>>;
  by_source: Record<string, number>;
}
