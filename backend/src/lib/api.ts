import type {
  DashboardStats,
  LeadListResponse,
  LeadStatus,
  LeadUpdate,
  LeadWithEvents,
} from "@/types/lead";
import { authStore } from "./auth";

const BASE_URL = "/v1/leads";
const AUTH_URL = "/v1/auth";

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const token = authStore.getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(url, { ...options, headers });

  if (res.status === 401) {
    authStore.removeToken();
    window.location.href = "/login";
    throw new Error("Session expirée, veuillez vous reconnecter.");
  }

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: "Erreur réseau" }));
    throw new Error(error.detail ?? `HTTP ${res.status}`);
  }

  return res.json() as Promise<T>;
}

export interface LeadListParams {
  page?: number;
  page_size?: number;
  status?: LeadStatus | "";
  source?: string;
  search?: string;
  sort_by?: string;
  sort_order?: "asc" | "desc";
  [key: string]: string | number | undefined;
}

export function buildQuery(
  params: Record<string, string | number | undefined | null>
) {
  const qs = new URLSearchParams();
  for (const [key, val] of Object.entries(params)) {
    if (val !== undefined && val !== null && val !== "") {
      qs.set(key, String(val));
    }
  }
  const str = qs.toString();
  return str ? `?${str}` : "";
}

export const api = {
  auth: {
    login: async (email: string, password: string): Promise<string> => {
      const res = await fetch(`${AUTH_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const error = await res.json().catch(() => ({ detail: "Erreur" }));
        throw new Error(error.detail ?? "Identifiants incorrects");
      }
      const data = (await res.json()) as { access_token: string };
      return data.access_token;
    },

    me: () =>
      request<{ id: string; email: string; is_active: boolean }>(
        `${AUTH_URL}/me`
      ),
  },

  leads: {
    list: (params: LeadListParams = {}) =>
      request<LeadListResponse>(`${BASE_URL}${buildQuery(params)}`),

    toCall: (params: { page?: number; page_size?: number } = {}) =>
      request<LeadListResponse>(
        `${BASE_URL}/to-call${buildQuery(params as Record<string, number | undefined>)}`
      ),

    get: (id: string) => request<LeadWithEvents>(`${BASE_URL}/${id}`),

    update: (id: string, data: LeadUpdate) =>
      request<LeadWithEvents>(`${BASE_URL}/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),

    stats: () => request<DashboardStats>(`${BASE_URL}/stats`),
  },
};
