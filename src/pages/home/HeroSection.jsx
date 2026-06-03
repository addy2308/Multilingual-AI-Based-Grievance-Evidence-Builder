import { useEffect, useState, useCallback } from "react";
import { useAuthNav } from "../../hooks/useAuth"; // adjust path as needed

const CATEGORIES = [
  "Roads", "Lights", "Water", "Sanitation",
  "Noise", "Potholes", "Drainage", "Electricity",
];
const WARDS = [
  "Ward 4", "Ward 7", "Ward 12", "Ward 19",
  "Ward 23", "Ward 31", "Ward 8", "Ward 15",
];
const STATUSES = [
  { label: "LIVE",     color: "#EF4444", bg: "rgba(239,68,68,0.1)" },
  { label: "ASSIGNED", color: "#F59E0B", bg: "rgba(245,158,11,0.1)" },
  { label: "RESOLVED", color: "#10B981", bg: "rgba(16,185,129,0.1)" },
];
const ISSUES = [
  "Broken streetlight near bus stand",
  "Pothole on main road junction",
  "Overflowing drain on colony road",
  "Water supply cut since 2 days",
  "Garbage not collected this week",
  "Noise from construction at night",
  "Damaged footpath near school",
  "Open manhole on service lane",
  "Electricity outage in sector B",
  "Sewage overflow near market",
];

let idCounter = 100;

function makeTicket() {
  idCounter++;
  const statusIndex = Math.random() < 0.4 ? 0 : Math.random() < 0.6 ? 1 : 2;
  return {
    id: `NIV-${String(idCounter).padStart(5, "0")}`,
    issue: ISSUES[Math.floor(Math.random() * ISSUES.length)],
    ward: WARDS[Math.floor(Math.random() * WARDS.length)],
    cat: CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)],
    status: STATUSES[statusIndex],
    age: `${Math.floor(Math.random() * 55) + 1}m ago`,
    flash: true,
  };
}

function seedTickets() {
  return Array.from({ length: 6 }, () => ({
    ...makeTicket(),
    flash: false,
    age: `${Math.floor(Math.random() * 120) + 5}m ago`,
  }));
}

/* ── Dispatch Board ── */
function DispatchBoard() {
  const [tickets, setTickets] = useState(seedTickets);
  const [totalResolved, setTotalResolved] = useState(12400);
  const [totalLive, setTotalLive] = useState(847);
  const [flashIds, setFlashIds] = useState(new Set());

  const addTicket = useCallback(() => {
    const t = makeTicket();
    setTickets((prev) => [t, ...prev].slice(0, 7));
    setFlashIds((prev) => new Set([...prev, t.id]));
    setTotalLive((n) => n + 1);
    setTimeout(() => {
      setFlashIds((prev) => {
        const s = new Set(prev);
        s.delete(t.id);
        return s;
      });
    }, 900);
  }, []);

  const resolveRandom = useCallback(() => {
    setTickets((prev) =>
      prev.map((t) =>
        t.status.label !== "RESOLVED" && Math.random() < 0.35
          ? { ...t, status: STATUSES[2], flash: false }
          : t
      )
    );
    setTotalResolved((n) => n + 1);
    setTotalLive((n) => Math.max(0, n - 1));
  }, []);

  useEffect(() => {
    const addId = setInterval(addTicket, 2800);
    const resId = setInterval(resolveRandom, 4200);
    return () => { clearInterval(addId); clearInterval(resId); };
  }, [addTicket, resolveRandom]);

  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", gap: 0, fontFamily: "'Instrument Sans', sans-serif" }}>
      {/* Board header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#EF4444", boxShadow: "0 0 0 3px rgba(239,68,68,0.2)", animation: "livePulse 1.4s ease infinite" }} />
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.16em", color: "#111", textTransform: "uppercase" }}>Live Dispatch</span>
        </div>
        <div style={{ display: "flex", gap: 16 }}>
          <div style={{ textAlign: "right" }}>
            <p style={{ fontSize: 16, fontWeight: 700, color: "#111", lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>{totalLive.toLocaleString()}</p>
            <p style={{ fontSize: 9, color: "#aaa", letterSpacing: "0.1em", textTransform: "uppercase", marginTop: 2 }}>Active</p>
          </div>
          <div style={{ width: 1, background: "rgba(0,0,0,0.08)" }} />
          <div style={{ textAlign: "right" }}>
            <p style={{ fontSize: 16, fontWeight: 700, color: "#10B981", lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>{totalResolved.toLocaleString()}</p>
            <p style={{ fontSize: 9, color: "#aaa", letterSpacing: "0.1em", textTransform: "uppercase", marginTop: 2 }}>Resolved</p>
          </div>
        </div>
      </div>

      {/* Column headers */}
      <div style={{ display: "grid", gridTemplateColumns: "88px 1fr 68px 72px", gap: "0 10px", padding: "6px 10px", borderTop: "1px solid rgba(0,0,0,0.07)", borderBottom: "1px solid rgba(0,0,0,0.07)", marginBottom: 4 }}>
        {["ID", "ISSUE", "WARD", "STATUS"].map((h) => (
          <span key={h} style={{ fontSize: 9, color: "#bbb", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase" }}>{h}</span>
        ))}
      </div>

      {/* Ticket rows */}
      <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column", gap: 2 }}>
        {tickets.map((t) => {
          const isNew = flashIds.has(t.id);
          return (
            <div
              key={t.id}
              className="dispatch-ticket"
              style={{
                display: "grid",
                gridTemplateColumns: "88px 1fr 68px 72px",
                gap: "0 10px",
                padding: "10px 12px",
                borderRadius: 12,
                background: isNew ? "rgba(239,68,68,0.04)" : "rgba(255,255,255,0)",
                borderLeft: isNew ? "2px solid rgba(239,68,68,0.5)" : "2px solid transparent",
                transition: "background 0.25s ease, border-color 0.4s ease, opacity 0.4s ease, transform 0.25s ease, box-shadow 0.25s ease",
                animation: isNew ? "slideInRow 0.35s cubic-bezier(0.34,1.2,0.64,1) forwards" : "none",
                alignItems: "center",
                cursor: "pointer",
              }}
            >
              <div>
                <span className="ticket-id" style={{ fontSize: 10, fontFamily: "monospace", fontWeight: 700, color: "#555", letterSpacing: "0.04em", transition: "color 0.2s ease" }}>{t.id}</span>
                <p className="ticket-issue" style={{ fontSize: 11, fontWeight: 500, color: "#111", lineHeight: 1.35, marginBottom: 2, transition: "transform 0.2s ease" }}>{t.age}</p>
              </div>
              <div>
                <p style={{ fontSize: 11, fontWeight: 500, color: "#111", lineHeight: 1.35, marginBottom: 2 }}>{t.issue}</p>
                <span style={{ fontSize: 9, color: "#888", background: "rgba(0,0,0,0.05)", padding: "1px 6px", borderRadius: 4, fontWeight: 500 }}>{t.cat}</span>
              </div>
              <span style={{ fontSize: 10, color: "#888" }}>{t.ward}</span>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 7px", borderRadius: 5, background: t.status.bg }}>
                <div style={{ width: 5, height: 5, borderRadius: "50%", background: t.status.color, flexShrink: 0, animation: t.status.label === "LIVE" ? "livePulse 1.4s ease infinite" : "none" }} />
                <span style={{ fontSize: 9, fontWeight: 700, color: t.status.color, letterSpacing: "0.1em" }}>{t.status.label}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div style={{ marginTop: 14, paddingTop: 12, borderTop: "1px solid rgba(0,0,0,0.06)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", gap: 12 }}>
          {STATUSES.map((s) => (
            <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: s.color }} />
              <span style={{ fontSize: 9, color: "#aaa", letterSpacing: "0.1em" }}>{s.label}</span>
            </div>
          ))}
        </div>
        <span style={{ fontSize: 9, color: "#ccc", fontFamily: "monospace" }}>Mumbai · MH · LIVE</span>
      </div>
    </div>
  );
}

/* ── Hero ── */
export default function HeroSection() {
  const go = useAuthNav();

  return (
    <section
      style={{ fontFamily: "'Instrument Sans', sans-serif" }}
      className="min-h-screen bg-[#F7F6F2] flex flex-col pt-16 relative overflow-hidden"
    >
      {/* Grid */}
      <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: `linear-gradient(rgba(0,0,0,0.042) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.042) 1px, transparent 1px)`, backgroundSize: "48px 48px" }} />
      <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 90% 80% at 50% 50%, transparent 30%, #F7F6F2 100%)" }} />

      {/* Top bar */}
      <div className="relative border-b border-black/[0.07] px-8 md:px-16 py-3 flex items-center justify-between">
        <span className="text-[11px] tracking-[0.18em] uppercase text-neutral-400 font-medium">India's Civic Complaint Platform</span>
        <span className="text-[11px] tracking-[0.12em] uppercase text-neutral-400 font-medium hidden md:block">Government Verified · Free to Use</span>
      </div>

      {/* Main */}
      <div className="relative flex-1 grid md:grid-cols-[1fr_1px_1fr] max-w-7xl mx-auto w-full">
        {/* Left */}
        <div className="flex flex-col justify-center px-8 md:px-16 py-16 md:py-0 gap-10">
          <div className="flex flex-col gap-5">
            <p className="text-xs tracking-[0.2em] uppercase text-neutral-400 font-semibold">File · Track · Resolve</p>
            <h1
              className="text-[52px] md:text-[64px] lg:text-[76px] leading-[0.96] tracking-[-0.03em] text-black"
              style={{ fontFamily: "'DM Serif Display', serif", fontWeight: 400 }}
            >
              Your voice,
              <br />
              <em className="not-italic text-neutral-400">heard by</em>
              <br />
              those who act.
            </h1>
          </div>
          <p className="text-neutral-500 text-base leading-relaxed max-w-xs">
            File complaints against public services and civic issues — directly, without bureaucracy.
          </p>

          {/* ── CTAs — auth-aware ── */}
          <div className="flex flex-col gap-3 max-w-xs">
            <button
              onClick={() => go("/file-complaint", "/login")}
              className="group inline-flex items-center justify-between px-5 py-4
                bg-black text-white text-sm font-semibold rounded-xl
                hover:bg-neutral-800 transition-colors duration-150 cursor-pointer border-none w-full"
            >
              File a Complaint
              <svg className="group-hover:translate-x-1 transition-transform duration-150" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>

            <button
              onClick={() => go("/track", "/login")}
              className="inline-flex items-center justify-between px-5 py-4
                bg-transparent text-black text-sm font-medium rounded-xl
                border border-black/12 hover:border-black/30
                transition-colors duration-150 cursor-pointer w-full"
            >
              Track My Complaint
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
              </svg>
            </button>
          </div>
        </div>

        {/* Divider */}
        <div className="hidden md:block bg-black/[0.07]" />

        {/* Right — Dispatch board */}
        <div className="hidden md:flex flex-col justify-center px-12 py-14">
          <div style={{ background: "#fff", border: "0.5px solid rgba(0,0,0,0.09)", borderRadius: 16, padding: "20px 20px 18px", boxShadow: "0 4px 32px rgba(0,0,0,0.07), 0 1px 4px rgba(0,0,0,0.04)" }}>
            <DispatchBoard />
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="relative border-t border-black/[0.07] px-8 md:px-16 py-3 flex items-center gap-6">
        {["100% Free", "No account to track", "Transparent process"].map((t) => (
          <div key={t} className="flex items-center gap-1.5">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span className="text-[11px] text-neutral-500 font-medium tracking-wide">{t}</span>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes livePulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(239,68,68,0.4); }
          50%       { box-shadow: 0 0 0 5px rgba(239,68,68,0); }
        }
        @keyframes slideInRow {
          from { opacity: 0; transform: translateX(-8px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        .dispatch-ticket:hover {
          background: rgba(0,0,0,0.03) !important;
          transform: translateY(-2px) scale(1.01);
          box-shadow: 0 10px 22px rgba(0,0,0,0.06), 0 2px 6px rgba(0,0,0,0.04);
        }
        .dispatch-ticket:hover .ticket-id { color: #000 !important; }
        .dispatch-ticket:hover .ticket-issue { transform: translateX(2px); }
      `}</style>
    </section>
  );
}