import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useLead, useUpdateLead } from "@/lib/queries";
import { LeadStatusBadge } from "@/components/ui/LeadStatusBadge";
import { LeadStatusSelect } from "@/components/ui/LeadStatusSelect";
import { LeadTimeline } from "@/components/LeadTimeline";
import { Spinner } from "@/components/ui/Spinner";
import { formatDateTime, EXPERIENCE_LABELS } from "@/lib/utils";
import type { LeadStatus } from "@/types/lead";
import { ArrowLeft, Phone, Mail, Calendar, Save } from "lucide-react";

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border bg-white p-5 shadow-sm">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500">
        {title}
      </h2>
      {children}
    </div>
  );
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col">
      <span className="text-xs text-gray-400">{label}</span>
      <span className="mt-0.5 text-sm text-gray-900">
        {value ?? <span className="text-gray-300">—</span>}
      </span>
    </div>
  );
}

export function LeadDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: lead, isLoading } = useLead(id!);
  const { mutate: updateLead, isPending } = useUpdateLead();

  const [status, setStatus] = useState<LeadStatus | null>(null);
  const [notes, setNotes] = useState<string | null>(null);
  const [nextActionDate, setNextActionDate] = useState<string | null>(null);
  const [lostReason, setLostReason] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  if (isLoading || !lead) {
    return (
      <div className="flex h-full items-center justify-center">
        <Spinner />
      </div>
    );
  }

  const currentStatus = status ?? lead.status;
  const currentNotes = notes ?? lead.notes ?? "";
  const currentNextAction = nextActionDate ?? lead.next_action_date ?? "";
  const currentLostReason = lostReason ?? lead.lost_reason ?? "";

  const isDirty =
    (status !== null && status !== lead.status) ||
    (notes !== null && notes !== lead.notes) ||
    (nextActionDate !== null && nextActionDate !== lead.next_action_date) ||
    (lostReason !== null && lostReason !== lead.lost_reason);

  function handleSave() {
    const data: Record<string, unknown> = {};
    if (status !== null && status !== lead!.status) data.status = status;
    if (notes !== null && notes !== lead!.notes) data.notes = notes || null;
    if (nextActionDate !== null && nextActionDate !== lead!.next_action_date)
      data.next_action_date = nextActionDate || null;
    if (lostReason !== null && lostReason !== lead!.lost_reason)
      data.lost_reason = lostReason || null;

    updateLead(
      { id: lead!.id, data: data as any },
      {
        onSuccess: () => {
          setStatus(null);
          setNotes(null);
          setNextActionDate(null);
          setLostReason(null);
          setSaved(true);
          setTimeout(() => setSaved(false), 2000);
        },
      }
    );
  }

  return (
    <div className="p-6">
      {/* Back + header */}
      <div className="mb-5 flex items-start justify-between">
        <div>
          <button
            onClick={() => navigate(-1)}
            className="mb-2 flex items-center gap-1 text-sm text-gray-400 hover:text-gray-700"
          >
            <ArrowLeft className="h-4 w-4" /> Retour
          </button>
          <h1 className="text-2xl font-bold text-gray-900">
            {lead.prenom} {lead.nom}
          </h1>
          <div className="mt-1 flex items-center gap-2">
            <LeadStatusBadge status={lead.status} />
            <span className="text-sm text-gray-400">
              Créé le {formatDateTime(lead.created_at)}
            </span>
          </div>
        </div>

        {/* Quick actions */}
        <div className="flex items-center gap-2">
          {lead.telephone && (
            <a
              href={`tel:${lead.telephone}`}
              className="flex items-center gap-2 rounded-md bg-green-500 px-4 py-2 text-sm font-medium text-white hover:bg-green-600"
            >
              <Phone className="h-4 w-4" />
              Appeler
            </a>
          )}
          <a
            href={`mailto:${lead.email}`}
            className="flex items-center gap-2 rounded-md border px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <Mail className="h-4 w-4" />
            Email
          </a>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        {/* Left column: info + suivi */}
        <div className="space-y-5 lg:col-span-2">
          {/* Informations */}
          <Section title="Informations">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Prénom" value={lead.prenom} />
              <Field label="Nom" value={lead.nom} />
              <Field
                label="Email"
                value={
                  <a
                    href={`mailto:${lead.email}`}
                    className="text-blue-600 hover:underline"
                  >
                    {lead.email}
                  </a>
                }
              />
              <Field
                label="Téléphone"
                value={
                  lead.telephone ? (
                    <a
                      href={`tel:${lead.telephone}`}
                      className="text-blue-600 hover:underline"
                    >
                      {lead.telephone}
                    </a>
                  ) : null
                }
              />
              <Field
                label="Expérience"
                value={
                  lead.experience
                    ? EXPERIENCE_LABELS[lead.experience]
                    : null
                }
              />
              {lead.message && (
                <div className="col-span-2">
                  <Field
                    label="Message"
                    value={
                      <span className="whitespace-pre-wrap">
                        {lead.message}
                      </span>
                    }
                  />
                </div>
              )}
            </div>
          </Section>

          {/* Marketing */}
          {(lead.utm_source ||
            lead.utm_medium ||
            lead.utm_campaign ||
            lead.source ||
            lead.referrer) && (
            <Section title="Source marketing">
              <div className="grid grid-cols-2 gap-4">
                <Field label="Source" value={lead.source} />
                <Field label="utm_source" value={lead.utm_source} />
                <Field label="utm_medium" value={lead.utm_medium} />
                <Field label="utm_campaign" value={lead.utm_campaign} />
                <Field
                  label="Referrer"
                  value={
                    lead.referrer ? (
                      <span className="truncate text-xs">{lead.referrer}</span>
                    ) : null
                  }
                />
              </div>
            </Section>
          )}

          {/* Suivi commercial */}
          <Section title="Suivi commercial">
            <div className="space-y-4">
              {/* Status */}
              <div>
                <label className="mb-1 block text-xs text-gray-400">
                  Statut
                </label>
                <LeadStatusSelect
                  value={currentStatus}
                  onChange={(s) => setStatus(s)}
                  disabled={isPending}
                />
              </div>

              {/* Lost reason */}
              {currentStatus === "lost" && (
                <div>
                  <label className="mb-1 block text-xs text-gray-400">
                    Raison de la perte
                  </label>
                  <input
                    type="text"
                    value={currentLostReason}
                    onChange={(e) => setLostReason(e.target.value)}
                    placeholder="Ex: trop cher, pas disponible…"
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              )}

              {/* Next action date */}
              <div>
                <label className="mb-1 flex items-center gap-1 text-xs text-gray-400">
                  <Calendar className="h-3.5 w-3.5" />
                  Date prochaine action
                </label>
                <input
                  type="date"
                  value={currentNextAction}
                  onChange={(e) => setNextActionDate(e.target.value)}
                  className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="mb-1 block text-xs text-gray-400">
                  Notes
                </label>
                <textarea
                  value={currentNotes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                  placeholder="Ajouter une note…"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* Save */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSave}
                  disabled={!isDirty || isPending}
                  className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-40"
                >
                  {isPending ? (
                    <Spinner className="h-4 w-4" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  Enregistrer
                </button>
                {saved && (
                  <span className="text-sm text-green-600">✓ Sauvegardé</span>
                )}
              </div>
            </div>
          </Section>
        </div>

        {/* Right column: timeline */}
        <div>
          <Section title="Historique">
            <LeadTimeline events={lead.events ?? []} />
          </Section>
        </div>
      </div>
    </div>
  );
}
