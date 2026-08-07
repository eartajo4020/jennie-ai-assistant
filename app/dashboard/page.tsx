import Link from "next/link";

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
};

async function getLeads(): Promise<Lead[]> {
  const response = await fetch("http://localhost:3000/api/dashboard", {
    cache: "no-store",
  });

  if (!response.ok) {
    return [];
  }

  const data = await response.json();

  return Array.isArray(data.leads) ? data.leads : [];
}

function getScoreStyles(score: string) {
  switch (score.toLowerCase()) {
    case "hot":
      return {
        badge: "border-red-400/30 bg-red-400/10 text-red-300",
        dot: "bg-red-400",
      };

    case "warm":
      return {
        badge: "border-amber-400/30 bg-amber-400/10 text-amber-300",
        dot: "bg-amber-400",
      };

    case "cold":
      return {
        badge: "border-sky-400/30 bg-sky-400/10 text-sky-300",
        dot: "bg-sky-400",
      };

    default:
      return {
        badge: "border-slate-500/30 bg-slate-500/10 text-slate-300",
        dot: "bg-slate-400",
      };
  }
}

export default async function Dashboard() {
  const leads = await getLeads();

  const hotLeads = leads.filter(
    (lead) => lead["Lead Score"].toLowerCase() === "hot"
  ).length;

  const warmLeads = leads.filter(
    (lead) => lead["Lead Score"].toLowerCase() === "warm"
  ).length;

  const coldLeads = leads.filter(
    (lead) => lead["Lead Score"].toLowerCase() === "cold"
  ).length;

  return (
    <main className="min-h-screen bg-[#07111f] text-slate-100">
      <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(37,99,235,0.18),_transparent_34%),radial-gradient(circle_at_top_right,_rgba(14,165,233,0.12),_transparent_28%)]">
        <div className="mx-auto max-w-7xl px-4 py-6 md:px-8">
          <header className="mb-8 flex flex-col gap-5 rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-black/20 backdrop-blur-xl md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 text-xl font-bold text-white shadow-lg shadow-blue-500/25">
                J
              </div>

              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-300">
                  Jennie AI CRM
                </p>

                <h1 className="mt-1 text-3xl font-bold tracking-tight text-white">
                  Lead Dashboard
                </h1>

                <p className="mt-1 text-sm text-slate-400">
                  Monitor qualified leads, priorities, and follow-up actions.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/"
                className="inline-flex items-center rounded-xl border border-white/10 bg-white/[0.05] px-4 py-2.5 text-sm font-semibold text-slate-100 transition hover:border-cyan-300/40 hover:bg-cyan-300/10"
              >
                Open Chatbot
              </Link>

              <div className="inline-flex items-center gap-2 rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-2.5 text-sm font-semibold text-emerald-300">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.8)]" />
                System Online
              </div>
            </div>
          </header>

          <section className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Total Leads"
              value={leads.length}
              detail="All captured leads"
              accent="from-blue-500/20 to-cyan-400/5"
              icon="◎"
            />

            <StatCard
              label="Hot Leads"
              value={hotLeads}
              detail="Highest priority"
              accent="from-red-500/20 to-orange-400/5"
              valueClassName="text-red-300"
              icon="🔥"
            />

            <StatCard
              label="Warm Leads"
              value={warmLeads}
              detail="Needs follow-up"
              accent="from-amber-500/20 to-yellow-400/5"
              valueClassName="text-amber-300"
              icon="◐"
            />

            <StatCard
              label="Cold Leads"
              value={coldLeads}
              detail="Early-stage interest"
              accent="from-sky-500/20 to-blue-400/5"
              valueClassName="text-sky-300"
              icon="❄"
            />
          </section>

          <section className="mt-8 grid grid-cols-1 gap-6 xl:grid-cols-[1.7fr_0.9fr]">
            <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] shadow-2xl shadow-black/20 backdrop-blur-xl">
              <div className="flex flex-col gap-3 border-b border-white/10 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-white">
                    Recent Leads
                  </h2>

                  <p className="mt-1 text-sm text-slate-400">
                    Click any lead to open the full profile.
                  </p>
                </div>

                <div className="rounded-xl border border-white/10 bg-[#0b1728] px-3 py-2 text-sm text-slate-400">
                  {leads.length} total
                </div>
              </div>

              {leads.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-2xl">
                    ◇
                  </div>

                  <p className="mt-4 text-lg font-semibold text-white">
                    No leads yet
                  </p>

                  <p className="mt-2 text-slate-400">
                    Qualified leads will appear here automatically.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-white/10">
                  {leads.map((lead) => {
                    const scoreStyles = getScoreStyles(
                      lead["Lead Score"] || ""
                    );

                    return (
                      <Link
                        key={lead["Lead ID"]}
                        href={`/dashboard/leads/${encodeURIComponent(
                          lead["Lead ID"]
                        )}`}
                        className="group grid gap-4 px-6 py-5 transition hover:bg-blue-400/[0.06] md:grid-cols-[1.4fr_1fr_1fr_auto] md:items-center"
                      >
                        <div className="flex items-center gap-4">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-slate-700 to-slate-900 font-bold text-white ring-1 ring-white/10">
                            {(lead.Name || "?").charAt(0).toUpperCase()}
                          </div>

                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="truncate font-semibold text-white transition group-hover:text-cyan-300">
                                {lead.Name || "Unknown Lead"}
                              </p>

                              <span
                                className={`inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-xs font-semibold ${scoreStyles.badge}`}
                              >
                                <span
                                  className={`h-1.5 w-1.5 rounded-full ${scoreStyles.dot}`}
                                />
                                {lead["Lead Score"] || "Unscored"}
                              </span>
                            </div>

                            <p className="mt-1 truncate text-sm text-slate-400">
                              {lead.Email ||
                                lead.Phone ||
                                "No contact information"}
                            </p>
                          </div>
                        </div>

                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                            Request
                          </p>

                          <p className="mt-1 text-sm font-medium text-slate-200">
                            {lead.Intent || "—"}{" "}
                            {lead["Property Type"]
                              ? `• ${lead["Property Type"]}`
                              : ""}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                            Budget / Area
                          </p>

                          <p className="mt-1 text-sm font-medium text-white">
                            {lead.Budget || "—"}
                          </p>

                          <p className="mt-1 text-xs text-slate-400">
                            {lead.Location || "Location not provided"}
                          </p>
                        </div>

                        <div className="flex items-center justify-between gap-4 md:justify-end">
                          <span className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-semibold text-slate-300">
                            {lead.Status || "New"}
                          </span>

                          <span className="text-lg text-cyan-300 transition group-hover:translate-x-1">
                            →
                          </span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            <aside className="space-y-6">
              <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-blue-500/15 to-cyan-400/[0.03] p-6 shadow-2xl shadow-black/20 backdrop-blur-xl">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-300">
                  AI Overview
                </p>

                <h2 className="mt-3 text-2xl font-bold text-white">
                  Your pipeline at a glance
                </h2>

                <p className="mt-3 leading-7 text-slate-400">
                  Jennie AI is organizing leads by urgency so the broker can
                  focus on the most valuable opportunities first.
                </p>

                <div className="mt-6 space-y-3">
                  <InsightRow
                    label="Priority leads"
                    value={String(hotLeads)}
                  />

                  <InsightRow
                    label="Needs follow-up"
                    value={String(warmLeads)}
                  />

                  <InsightRow
                    label="Total pipeline"
                    value={String(leads.length)}
                  />
                </div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-black/20 backdrop-blur-xl">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Quick Actions
                </p>

                <div className="mt-4 space-y-3">
                  <Link
                    href="/"
                    className="flex items-center justify-between rounded-2xl border border-white/10 bg-[#0b1728] px-4 py-4 font-semibold text-slate-200 transition hover:border-cyan-300/40 hover:text-cyan-300"
                  >
                    Open Jennie AI
                    <span>→</span>
                  </Link>

                  <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-[#0b1728] px-4 py-4 text-slate-400">
                    Search & Filters
                    <span className="text-xs uppercase tracking-wider">
                      Soon
                    </span>
                  </div>

                  <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-[#0b1728] px-4 py-4 text-slate-400">
                    Analytics
                    <span className="text-xs uppercase tracking-wider">
                      Soon
                    </span>
                  </div>
                </div>
              </div>
            </aside>
          </section>
        </div>
      </div>
    </main>
  );
}

function StatCard({
  label,
  value,
  detail,
  accent,
  icon,
  valueClassName = "text-white",
}: {
  label: string;
  value: number;
  detail: string;
  accent: string;
  icon: string;
  valueClassName?: string;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br ${accent} p-6 shadow-2xl shadow-black/15 backdrop-blur-xl`}
    >
      <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/[0.04]" />

      <div className="relative">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold uppercase tracking-wider text-slate-400">
            {label}
          </p>

          <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.05] text-lg">
            {icon}
          </span>
        </div>

        <p className={`mt-5 text-4xl font-bold ${valueClassName}`}>
          {value}
        </p>

        <p className="mt-2 text-sm text-slate-400">{detail}</p>
      </div>
    </div>
  );
}

function InsightRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-[#0b1728]/80 px-4 py-3">
      <span className="text-sm text-slate-400">{label}</span>
      <span className="font-semibold text-white">{value}</span>
    </div>
  );
}