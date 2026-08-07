import Link from "next/link";
import DeleteLeadButton from "./DeleteLeadButton";

type Lead = {
  "Lead ID": string;
  "Date Created": string;
  "Last Updated": string;
  Name: string;
  Email: string;
  Phone: string;
  Intent: string;
  "Property Type": string;
  Location: string;
  Budget: string;
  Timeline: string;
  Status: string;
  "Conversation Summary": string;
  "Lead Score": string;
  "Recommended Action": string;
  "Conversation History": string;
};

type ConversationMessage = {
  sender: "user" | "ai";
  text: string;
};

async function getLead(leadId: string): Promise<Lead | null> {
  const sheetsUrl = process.env.GOOGLE_SHEETS_WEB_APP_URL;

  if (!sheetsUrl) {
    return null;
  }

  const response = await fetch(sheetsUrl, {
    method: "GET",
    cache: "no-store",
  });

  if (!response.ok) {
    return null;
  }

  const data = await response.json();

  const leads: Lead[] = Array.isArray(data.leads)
    ? data.leads
    : [];

  const requestedId = decodeURIComponent(leadId).trim();

  return (
    leads.find(
      (lead) =>
        String(lead["Lead ID"] || "").trim() === requestedId
    ) || null
  );
}

function getScoreStyles(score: string) {
  switch (score.toLowerCase()) {
    case "hot":
      return {
        badge:
          "border-red-400/30 bg-red-400/10 text-red-300",
        dot: "bg-red-400",
      };

    case "warm":
      return {
        badge:
          "border-amber-400/30 bg-amber-400/10 text-amber-300",
        dot: "bg-amber-400",
      };

    case "cold":
      return {
        badge:
          "border-sky-400/30 bg-sky-400/10 text-sky-300",
        dot: "bg-sky-400",
      };

    default:
      return {
        badge:
          "border-slate-500/30 bg-slate-500/10 text-slate-300",
        dot: "bg-slate-400",
      };
  }
}

function parseConversation(
  conversation: string
): ConversationMessage[] {
  if (!conversation || conversation.trim() === "") {
    return [];
  }

  const blocks = conversation
    .split(/\n\s*\n(?=(?:Jennie AI|Visitor):\s)/)
    .map((block) => block.trim())
    .filter(Boolean);

  return blocks
    .map((block): ConversationMessage | null => {
      if (block.startsWith("Jennie AI:")) {
        return {
          sender: "ai",
          text: block.replace(/^Jennie AI:\s*/, "").trim(),
        };
      }

      if (block.startsWith("Visitor:")) {
        return {
          sender: "user",
          text: block.replace(/^Visitor:\s*/, "").trim(),
        };
      }

      return null;
    })
    .filter(
      (message): message is ConversationMessage =>
        message !== null && message.text !== ""
    );
}

export default async function LeadDetailsPage({
  params,
}: {
  params: Promise<Record<string, string | string[]>>;
}) {
  const resolvedParams = await params;

  const rawLeadId =
    resolvedParams.leadId ??
    resolvedParams.LeadId ??
    resolvedParams.leadid ??
    Object.values(resolvedParams)[0];

  const leadId = Array.isArray(rawLeadId)
    ? rawLeadId[0]
    : rawLeadId || "";

  const lead = leadId ? await getLead(leadId) : null;

  if (!lead) {
    return (
      <main className="min-h-screen bg-[#07111f] text-slate-100">
        <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(37,99,235,0.18),_transparent_34%),radial-gradient(circle_at_top_right,_rgba(14,165,233,0.12),_transparent_28%)] px-4 py-10">
          <div className="mx-auto max-w-4xl rounded-3xl border border-white/10 bg-white/[0.04] p-8 shadow-2xl shadow-black/20 backdrop-blur-xl">
            <h1 className="text-3xl font-bold text-white">
              Lead not found
            </h1>

            <p className="mt-3 text-slate-400">
              This lead could not be loaded.
            </p>

            <Link
              href="/dashboard"
              className="mt-6 inline-flex rounded-xl bg-cyan-400 px-4 py-2.5 font-bold text-slate-950 transition hover:bg-cyan-300"
            >
              ← Back to dashboard
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const scoreStyles = getScoreStyles(
    lead["Lead Score"] || ""
  );

  const initial = (lead.Name || "?")
    .charAt(0)
    .toUpperCase();

  const conversation = parseConversation(
    lead["Conversation History"] || ""
  );

  return (
    <main className="min-h-screen bg-[#07111f] text-slate-100">
      <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(37,99,235,0.18),_transparent_34%),radial-gradient(circle_at_top_right,_rgba(14,165,233,0.12),_transparent_28%)]">
        <div className="mx-auto max-w-6xl px-4 py-8 md:px-8">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <Link
              href="/dashboard"
              className="inline-flex w-fit items-center rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-semibold text-slate-200 transition hover:border-cyan-300/40 hover:text-cyan-300"
            >
              ← Back to dashboard
            </Link>

            <div className="flex flex-wrap gap-3">
              {lead.Email && (
                <a
                  href={`mailto:${lead.Email}`}
                  className="inline-flex rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-semibold text-slate-200 transition hover:border-cyan-300/40 hover:text-cyan-300"
                >
                  Email Lead
                </a>
              )}

              {lead.Phone && (
                <a
                  href={`tel:${lead.Phone}`}
                  className="inline-flex rounded-xl bg-cyan-400 px-4 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-cyan-300"
                >
                  Call Lead
                </a>
              )}
              <DeleteLeadButton
  leadId={lead["Lead ID"]}
  leadName={lead.Name}
/>
            </div>
          </div>

          <section className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] shadow-2xl shadow-black/20 backdrop-blur-xl">
            <div className="flex flex-col gap-6 border-b border-white/10 p-6 md:flex-row md:items-center md:justify-between md:p-8">
              <div className="flex items-center gap-5">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 text-2xl font-bold text-white shadow-lg shadow-blue-500/25">
                  {initial}
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h1 className="text-3xl font-bold tracking-tight text-white">
                      {lead.Name || "Unknown Lead"}
                    </h1>

                    <span
                      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-semibold ${scoreStyles.badge}`}
                    >
                      <span
                        className={`h-2 w-2 rounded-full ${scoreStyles.dot}`}
                      />

                      {lead["Lead Score"] || "Unscored"}
                    </span>
                  </div>

                  <p className="mt-2 text-slate-400">
                    {lead.Intent || "Unknown intent"}

                    {lead["Property Type"]
                      ? ` • ${lead["Property Type"]}`
                      : ""}
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-[#0b1728] px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Status
                </p>

                <p className="mt-1 font-semibold text-white">
                  {lead.Status || "New"}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 p-6 md:grid-cols-2 md:p-8 xl:grid-cols-3">
              <InfoCard label="Email" value={lead.Email} />

              <InfoCard label="Phone" value={lead.Phone} />

              <InfoCard
                label="Location"
                value={lead.Location}
              />

              <InfoCard label="Budget" value={lead.Budget} />

              <InfoCard
                label="Timeline"
                value={lead.Timeline}
              />

              <InfoCard
                label="Last Updated"
                value={lead["Last Updated"]}
              />
            </div>
          </section>

          <section className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[1.35fr_0.85fr]">
            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-black/20 backdrop-blur-xl md:p-8">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-300">
                AI Summary
              </p>

              <h2 className="mt-3 text-2xl font-bold text-white">
                Conversation Summary
              </h2>

              <p className="mt-4 leading-8 text-slate-300">
                {lead["Conversation Summary"] ||
                  "No summary is available yet."}
              </p>
            </div>

            <div className="rounded-3xl border border-cyan-300/15 bg-gradient-to-br from-blue-500/15 to-cyan-400/[0.04] p-6 shadow-2xl shadow-black/20 backdrop-blur-xl md:p-8">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-300">
                Recommended Action
              </p>

              <h2 className="mt-3 text-2xl font-bold text-white">
                What to do next
              </h2>

              <p className="mt-4 leading-8 text-slate-300">
                {lead["Recommended Action"] ||
                  "No action has been generated yet."}
              </p>
            </div>
          </section>

          <section className="mt-6 overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] shadow-2xl shadow-black/20 backdrop-blur-xl">
            <div className="flex flex-col gap-3 border-b border-white/10 p-6 sm:flex-row sm:items-center sm:justify-between md:p-8">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-300">
                  Conversation Timeline
                </p>

                <h2 className="mt-3 text-2xl font-bold text-white">
                  Full visitor conversation
                </h2>

                <p className="mt-2 text-sm text-slate-400">
                  Review what the visitor and Jennie AI said.
                </p>
              </div>

              <div className="w-fit rounded-full border border-white/10 bg-[#0b1728] px-4 py-2 text-sm font-semibold text-slate-300">
                {conversation.length}{" "}
                {conversation.length === 1
                  ? "message"
                  : "messages"}
              </div>
            </div>

            <div className="max-h-[650px] overflow-y-auto bg-[#081321]/70 p-5 sm:p-6 md:p-8">
              {conversation.length > 0 ? (
                <div className="space-y-6">
                  {conversation.map((message, index) => (
                    <ConversationBubble
                      key={`${message.sender}-${index}`}
                      message={message}
                    />
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-white/10 bg-[#0b1728] p-8 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-xl">
                    💬
                  </div>

                  <h3 className="mt-4 text-lg font-bold text-white">
                    No conversation saved
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    This lead may have been created before
                    conversation history was added.
                  </p>
                </div>
              )}
            </div>
          </section>

          <section className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-black/20 backdrop-blur-xl">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">
                Lead Details
              </p>

              <div className="mt-5 space-y-4">
                <DetailRow
                  label="Lead ID"
                  value={lead["Lead ID"]}
                />

                <DetailRow
                  label="Date Created"
                  value={lead["Date Created"]}
                />

                <DetailRow
                  label="Intent"
                  value={lead.Intent}
                />

                <DetailRow
                  label="Property Type"
                  value={lead["Property Type"]}
                />
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-black/20 backdrop-blur-xl">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">
                Coming Next
              </p>

              <div className="mt-5 space-y-3">
                <ComingSoon label="Editable status" />
                <ComingSoon label="Broker notes" />
                <ComingSoon label="Follow-up scheduling" />
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

function ConversationBubble({
  message,
}: {
  message: ConversationMessage;
}) {
  const isVisitor = message.sender === "user";

  return (
    <div
      className={`flex ${
        isVisitor ? "justify-end" : "justify-start"
      }`}
    >
      <div
        className={`flex max-w-[92%] items-end gap-3 sm:max-w-[82%] ${
          isVisitor ? "flex-row-reverse" : ""
        }`}
      >
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border text-sm font-bold shadow-lg ${
            isVisitor
              ? "border-cyan-300/20 bg-cyan-400 text-slate-950"
              : "border-blue-400/20 bg-blue-500/20 text-blue-200"
          }`}
        >
          {isVisitor ? "V" : "AI"}
        </div>

        <div>
          <p
            className={`mb-2 text-xs font-semibold uppercase tracking-wider ${
              isVisitor
                ? "text-right text-cyan-300"
                : "text-blue-300"
            }`}
          >
            {isVisitor ? "Visitor" : "Jennie AI"}
          </p>

          <div
            className={`whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-7 shadow-lg sm:px-5 sm:py-4 sm:text-base ${
              isVisitor
                ? "rounded-br-md bg-gradient-to-br from-cyan-400 to-sky-400 text-slate-950 shadow-cyan-500/10"
                : "rounded-bl-md border border-white/10 bg-[#122138] text-slate-200 shadow-black/20"
            }`}
          >
            {message.text}
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#0b1728] p-5">
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
        {label}
      </p>

      <p className="mt-2 break-words text-lg font-semibold text-white">
        {value || "—"}
      </p>
    </div>
  );
}

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex flex-col gap-1 rounded-2xl border border-white/10 bg-[#0b1728] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <span className="text-sm text-slate-400">
        {label}
      </span>

      <span className="break-all font-semibold text-white">
        {value || "—"}
      </span>
    </div>
  );
}

function ComingSoon({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-[#0b1728] px-4 py-4">
      <span className="font-medium text-slate-300">
        {label}
      </span>

      <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
        Soon
      </span>
    </div>
  );
}