import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Footer from "../../components/common/Footer";

// ─── Mock Data ────────────────────────────────────────────────────────────────
const MOCK_CITIZEN = {
  name: "Arjun Mehta",
  ward: "Ward 12, Andheri East",
  joinedDate: "March 2024",
  avatar: "AM",
};

const MOCK_COMPLAINTS = [
  {
    id: "NVR-25-104821",
    title: "Broken road near main market",
    category: "Roads & Infrastructure",
    dept: "PWD",
    severity: "Severe",
    status: "In Progress",
    createdAt: "2025-05-10",
    updatedAt: "2025-05-18",
    location: "Main Market, Ward 12",
    updates: 3,
    evidenceScore: 85,
    slaDays: 7,
    slaDeadline: "2025-05-25",
  },
  {
    id: "NVR-25-098312",
    title: "No water supply for 3 days",
    category: "Water Supply",
    dept: "Jal Board",
    severity: "Critical",
    status: "Resolved",
    createdAt: "2025-04-22",
    updatedAt: "2025-05-02",
    location: "Sector B, Ward 12",
    updates: 5,
    evidenceScore: 90,
    slaDays: null,
    slaDeadline: null,
  },
  {
    id: "NVR-25-091047",
    title: "Streetlight not working",
    category: "Street Lighting",
    dept: "PWD / DISCOM",
    severity: "Minor",
    status: "Assigned",
    createdAt: "2025-04-15",
    updatedAt: "2025-04-16",
    location: "Colony Road, Ward 12",
    updates: 1,
    evidenceScore: 45,
    slaDays: 2,
    slaDeadline: "2025-05-20",
  },
  {
    id: "NVR-25-085509",
    title: "Garbage not collected",
    category: "Sanitation & Waste",
    dept: "Municipal Corp.",
    severity: "Moderate",
    status: "Resolved",
    createdAt: "2025-03-30",
    updatedAt: "2025-04-08",
    location: "Near School, Ward 12",
    updates: 4,
    evidenceScore: 70,
    slaDays: null,
    slaDeadline: null,
  },
  {
    id: "NVR-25-079144",
    title: "Open manhole on service lane",
    category: "Drainage & Sewage",
    dept: "Jal Board",
    severity: "Critical",
    status: "Resolved",
    createdAt: "2025-03-10",
    updatedAt: "2025-03-22",
    location: "Service Lane 4, Ward 12",
    updates: 6,
    evidenceScore: 95,
    slaDays: null,
    slaDeadline: null,
  },
  {
    id: "NVR-25-072033",
    title: "Noise from construction at night",
    category: "Noise Pollution",
    dept: "CPCB",
    severity: "Moderate",
    status: "Pending",
    createdAt: "2025-02-28",
    updatedAt: "2025-03-01",
    location: "Block C, Ward 12",
    updates: 0,
    evidenceScore: 40,
    slaDays: 1,
    slaDeadline: "2025-05-19",
  },
  {
    id: "NVR-25-063891",
    title: "Illegal encroachment on footpath",
    category: "Encroachment",
    dept: "Town Planning",
    severity: "Moderate",
    status: "Assigned",
    createdAt: "2025-02-14",
    updatedAt: "2025-02-15",
    location: "Ward 12 Footpath",
    updates: 2,
    evidenceScore: 60,
    slaDays: 4,
    slaDeadline: "2025-05-22",
  },
  {
    id: "NVR-25-055210",
    title: "Electricity outage in sector B",
    category: "Electricity",
    dept: "DISCOM",
    severity: "Severe",
    status: "Resolved",
    createdAt: "2025-01-20",
    updatedAt: "2025-01-25",
    location: "Sector B",
    updates: 4,
    evidenceScore: 80,
    slaDays: null,
    slaDeadline: null,
  },
];

const HEATMAP_DATA = [
  [0, 1, 0, 2, 1, 0, 0],
  [1, 0, 2, 1, 0, 1, 0],
  [0, 2, 1, 0, 3, 1, 0],
  [1, 0, 0, 1, 0, 2, 1],
  [0, 1, 2, 0, 1, 0, 0],
];

const AI_INSIGHTS = [
  {
    icon: "⚡",
    title: "Evidence boost needed",
    body: "2 complaints have evidence scores below 50. Adding photos can cut resolution time by ~32%.",
    action: "Improve Now",
    color: "#B45309",
    bg: "#FEF3C7",
  },
  {
    icon: "📈",
    title: "Faster than ward average",
    body: "Your complaints resolve in 8 days on average vs. 11.4 days ward-wide. Keep attaching location.",
    action: "See Stats",
    color: "#1A7F5A",
    bg: "#E6F7F1",
  },
  {
    icon: "🔔",
    title: "SLA breach risk",
    body: "3 active complaints are within 7 days of their SLA deadline. Consider following up.",
    action: "View Alerts",
    color: "#B91C1C",
    bg: "#FEE2E2",
  },
];

const WARD_RANK = { rank: 3, total: 24, percentile: 88 };

const RESOLUTION_VELOCITY = [14, 12, 10, 9, 11, 8, 7]; // days per complaint, last 7

const CAT_ICON = {
  "Roads & Infrastructure": "🛣️",
  "Water Supply": "💧",
  Electricity: "⚡",
  "Sanitation & Waste": "🗑️",
  "Street Lighting": "💡",
  "Drainage & Sewage": "🌊",
  Encroachment: "🚧",
  "Noise Pollution": "🔊",
  Other: "📋",
};

const STATUS_CONFIG = {
  Pending: { color: "#8892A4", bg: "#F0F3FA", dot: "#C4C9D4" },
  Assigned: { color: "#000000", bg: "#EEF0F8", dot: "#000000" },
  "In Progress": { color: "#2B6CB0", bg: "#EEF4FF", dot: "#4A90D9" },
  Resolved: { color: "#1A7F5A", bg: "#E6F7F1", dot: "#10B981" },
};

const SEVERITY_CONFIG = {
  Minor: { color: "#6B7280", bg: "#F3F4F6" },
  Moderate: { color: "#6B7280", bg: "#F3F4F6" },
  Severe: { color: "#B45309", bg: "#FEF3C7" },
  Critical: { color: "#B91C1C", bg: "#FEE2E2" },
};

// ─── Icons ───────────────────────────────────────────────────────────────────
const Ic = ({ d, s = 16, sw = 2, fill = "none", stroke = "currentColor" }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill={fill} stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
    {Array.isArray(d) ? d.map((p, i) => <path key={i} d={p} />) : <path d={d} />}
  </svg>
);

const IPlus = () => <Ic d="M12 5v14M5 12h14" />;
const ISearch = () => <Ic d={["M21 21l-4.35-4.35", "M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16z"]} />;
const IFilter = () => <Ic d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" />;
const IChevR = () => <Ic d="M9 18l6-6-6-6" />;
const IClock = ({ s = 16 }) => <Ic d={["M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z", "M12 6v6l4 2"]} s={s} />;
const IPin = ({ s = 16 }) => <Ic d={["M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z", "M12 10m-3 0a3 3 0 1 0 6 0 3 3 0 1 0-6 0"]} s={s} />;
const ICheck = ({ s = 16, stroke = "currentColor" }) => <Ic d="M20 6L9 17l-5-5" s={s} sw={2.5} stroke={stroke} />;
const IFile = () => <Ic d={["M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z", "M14 2v6h6"]} />;
const ISparkle = ({ s = 16 }) => <Ic d={["M12 3l1.09 3.26L16.5 7.5l-3.41 1.24L12 12l-1.09-3.26L7.5 7.5l3.41-1.24L12 3z", "M19 14l.55 1.64L21 16l-1.45.36-.55 1.64-.55-1.64L17 16l1.45-.36L19 14z"]} s={s} />;
const IBuilding = ({ s = 16 }) => <Ic d={["M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z", "M9 22V12h6v10"]} s={s} />;
const ITrend = () => <Ic d={["M23 6l-9.5 9.5-5-5L1 18", "M17 6h6v6"]} />;
const IAlert = () => <Ic d={["M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z", "M12 9v4", "M12 17h.01"]} />;
const IX = () => <Ic d="M18 6L6 18M6 6l12 12" />;
const IArrowR = () => <Ic d="M5 12h14M12 5l7 7-7 7" s={14} />;
const IAward = () => <Ic d={["M12 15a7 7 0 1 0 0-14 7 7 0 0 0 0 14z", "M8.21 13.89L7 23l5-3 5 3-1.21-9.12"]} />;
const IZap = ({ s = 16 }) => <Ic d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" s={s} />;
const IMap = () => <Ic d={["M1 6v16l7-4 8 4 7-4V2l-7 4-8-4-7 4z", "M8 2v16", "M16 6v16"]} />;
const IRefresh = ({ s = 16 }) => <Ic d={["M23 4v6h-6", "M1 20v-6h6", "M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"]} s={s} />;
const ITimer = ({ s = 16 }) => <Ic d={["M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z", "M12 6v6l4 2"]} s={s} />;
const IShare = ({ s = 16 }) => <Ic d={["M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8", "M16 6l-4-4-4 4", "M12 2v13"]} s={s} />;

// ─── Helpers ─────────────────────────────────────────────────────────────────
function relDate(d) {
  const diff = Math.floor((Date.now() - new Date(d)) / 86400000);
  if (diff === 0) return "Today";
  if (diff === 1) return "Yesterday";
  if (diff < 7) return `${diff}d ago`;
  if (diff < 30) return `${Math.floor(diff / 7)}w ago`;
  return `${Math.floor(diff / 30)}mo ago`;
}
function fmtDate(d) {
  return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
}

// ─── Donut ────────────────────────────────────────────────────────────────────
function Donut({ data, size = 108, thick = 13 }) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  const r = size / 2 - thick / 2;
  const circ = 2 * Math.PI * r;
  let off = 0;
  const slices = data.map((d) => {
    const sl = { ...d, off, dash: (d.value / total) * circ, gap: circ };
    off += sl.dash;
    return sl;
  });
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: "rotate(-90deg)" }}>
      {slices.map((s, i) => (
        <circle key={i} cx={size / 2} cy={size / 2} r={r} fill="none" stroke={s.color} strokeWidth={thick} strokeDasharray={`${s.dash} ${s.gap}`} strokeDashoffset={-s.off} strokeLinecap="butt" />
      ))}
    </svg>
  );
}

// ─── Bar ─────────────────────────────────────────────────────────────────────
function Bar({ data, height = 80 }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="flex items-end gap-1.5" style={{ height }}>
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
          <div className="w-full rounded-t-sm transition-all duration-700" style={{ height: `${(d.value / max) * (height - 22)}px`, background: d.color || "#000000", minHeight: d.value > 0 ? 4 : 0, opacity: d.dim ? 0.3 : 1 }} />
          <span className="text-[9px] font-semibold" style={{ color: "#8892A4" }}>{d.label}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Sparkline ───────────────────────────────────────────────────────────────
function Sparkline({ data, width = 80, height = 28, color = "#000000" }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((v - min) / range) * height;
    return `${x},${y}`;
  }).join(" ");
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ overflow: "visible" }}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={pts.split(" ").at(-1).split(",")[0]} cy={pts.split(" ").at(-1).split(",")[1]} r="2.5" fill={color} />
    </svg>
  );
}

// ─── Stat Card ───────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, icon, tag, trend, trendLabel }) {
  return (
    <div className="s-card rounded-2xl p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center s-icon">{icon}</div>
        {tag && <span className="text-[10px] px-2 py-0.5 rounded-full font-bold s-tag">{tag}</span>}
        {trend !== undefined && (
          <div className="flex items-center gap-1">
            <Sparkline data={trend} color="#000000" />
          </div>
        )}
      </div>
      <div>
        <p className="text-[32px] font-black leading-none mb-1 s-val">{value}</p>
        <p className="text-[10px] font-black uppercase tracking-wider s-label">{label}</p>
        {sub && <p className="text-[11px] mt-0.5 s-sub">{sub}</p>}
        {trendLabel && <p className="text-[10px] mt-1 font-semibold" style={{ color: "#1A7F5A" }}>{trendLabel}</p>}
      </div>
    </div>
  );
}

// ─── SLA Warning Banner ───────────────────────────────────────────────────────
function SLABanner({ complaints }) {
  const atRisk = complaints.filter(c => c.slaDays !== null && c.slaDays <= 7 && c.status !== "Resolved");
  if (atRisk.length === 0) return null;
  const critical = atRisk.filter(c => c.slaDays <= 2);
  return (
    <div className="rounded-2xl overflow-hidden" style={{ border: "1.5px solid #FCA5A5", background: "#FFF5F5" }}>
      <div className="px-4 py-3 flex items-center gap-3" style={{ background: "#FEE2E2", borderBottom: "1px solid #FCA5A5" }}>
        <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: "#FCA5A5", color: "#B91C1C" }}>
          <IAlert />
        </div>
        <p className="text-xs font-black" style={{ color: "#B91C1C" }}>
          SLA ALERT — {atRisk.length} complaint{atRisk.length > 1 ? "s" : ""} approaching deadline
          {critical.length > 0 && <span style={{ color: "#7F1D1D", marginLeft: 6 }}>· {critical.length} critical</span>}
        </p>
        <div className="ml-auto flex items-center gap-1 text-[10px] font-bold" style={{ color: "#B91C1C" }}>
          <IClock s={11} /> SLA tracking active
        </div>
      </div>
      <div className="p-3 grid sm:grid-cols-2 gap-2">
        {atRisk.map(c => (
          <div key={c.id} className="flex items-center gap-3 px-3 py-2.5 rounded-xl" style={{ background: "white", border: "1px solid #FCA5A5" }}>
            <div className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: c.slaDays <= 2 ? "#FEE2E2" : "#FEF3C7" }}>
              <ITimer s={14} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold truncate" style={{ color: "#000000" }}>{c.title}</p>
              <p className="text-[10px]" style={{ color: "#8892A4" }}>{c.dept} · {c.id}</p>
            </div>
            <span className="text-xs font-black shrink-0 px-2 py-1 rounded-lg" style={{ background: c.slaDays <= 2 ? "#FEE2E2" : "#FEF3C7", color: c.slaDays <= 2 ? "#B91C1C" : "#B45309" }}>
              {c.slaDays}d left
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Heatmap ─────────────────────────────────────────────────────────────────
function ActivityHeatmap({ data }) {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const weeks = ["W1", "W2", "W3", "W4", "W5"];
  const maxVal = Math.max(...data.flat(), 1);
  const opacities = (v) => v === 0 ? 0.06 : 0.2 + (v / maxVal) * 0.8;
  return (
    <div>
      <div className="flex gap-1 mb-1 pl-7">
        {days.map(d => (
          <div key={d} className="flex-1 text-center text-[9px] font-bold" style={{ color: "#B0B8C9" }}>{d}</div>
        ))}
      </div>
      <div className="space-y-1">
        {data.map((row, wi) => (
          <div key={wi} className="flex items-center gap-1">
            <span className="text-[9px] font-bold w-6 text-right shrink-0" style={{ color: "#B0B8C9" }}>{weeks[wi]}</span>
            {row.map((val, di) => (
              <div
                key={di}
                className="flex-1 rounded-sm"
                style={{ height: 18, background: "#000000", opacity: opacities(val), cursor: val > 0 ? "pointer" : "default" }}
                title={val > 0 ? `${val} complaint${val > 1 ? "s" : ""}` : "No activity"}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2 mt-2.5 justify-end">
        <span className="text-[9px]" style={{ color: "#B0B8C9" }}>Less</span>
        {[0.06, 0.25, 0.5, 0.75, 1].map((op, i) => (
          <div key={i} className="w-3 h-3 rounded-sm" style={{ background: "#000000", opacity: op }} />
        ))}
        <span className="text-[9px]" style={{ color: "#B0B8C9" }}>More</span>
      </div>
    </div>
  );
}

// ─── Ward Rank Ring ───────────────────────────────────────────────────────────
function WardRankRing({ rank, total, percentile }) {
  const r = 32, size = 80, thick = 6;
  const circ = 2 * Math.PI * r;
  const filled = (percentile / 100) * circ;
  return (
    <div className="flex items-center gap-4">
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: "rotate(-90deg)" }}>
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#F0F3FA" strokeWidth={thick} />
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#000000" strokeWidth={thick}
            strokeDasharray={`${filled} ${circ}`} strokeLinecap="round" />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-base font-black" style={{ color: "#000000", fontFamily: "'DM Serif Display',serif", lineHeight: 1 }}>#{rank}</span>
          <span className="text-[8px] font-bold uppercase tracking-wide" style={{ color: "#8892A4" }}>ward</span>
        </div>
      </div>
      <div className="space-y-1.5">
        <p className="text-xs font-black" style={{ color: "#000000" }}>Top {100 - percentile}% in ward</p>
        <p className="text-[11px]" style={{ color: "#8892A4" }}>Ranked #{rank} of {total} active citizens</p>
        <div className="flex items-center gap-1.5 mt-1">
          <div className="w-2 h-2 rounded-full" style={{ background: "#1A7F5A" }} />
          <span className="text-[10px] font-semibold" style={{ color: "#1A7F5A" }}>Civic leader status</span>
        </div>
      </div>
    </div>
  );
}

// ─── AI Insight Card ──────────────────────────────────────────────────────────
function AIInsightCard({ insight }) {
  return (
    <div className="p-3.5 rounded-xl flex items-start gap-3 cursor-pointer insight-card" style={{ background: insight.bg, border: `1px solid ${insight.color}22` }}>
      <div className="text-base shrink-0 mt-0.5">{insight.icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-black mb-0.5" style={{ color: "#000000" }}>{insight.title}</p>
        <p className="text-[11px] leading-relaxed" style={{ color: "#6B7280" }}>{insight.body}</p>
      </div>
      <div className="shrink-0 mt-0.5">
        <span className="text-[10px] font-bold flex items-center gap-1" style={{ color: insight.color }}>
          {insight.action} <IArrowR />
        </span>
      </div>
    </div>
  );
}

// ─── Quick Actions ────────────────────────────────────────────────────────────
function QuickActions({ onNavigate }) {
  const actions = [
    { icon: <IPlus />, label: "New Complaint", sub: "File grievance", onClick: () => onNavigate("/file-complaint"), primary: true },
    { icon: <IRefresh s={16} />, label: "Track Status", sub: "Check all active", onClick: () => { } },
    { icon: <IShare s={16} />, label: "Export Report", sub: "Download PDF", onClick: () => { } },
    { icon: <IMap />, label: "Ward Map", sub: "View hotspots", onClick: () => { } },
  ];
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
      {actions.map((a, i) => (
        <button
          key={i}
          onClick={a.onClick}
          className="flex flex-col items-start gap-2 p-3.5 rounded-xl cursor-pointer text-left quick-action border-none"
          style={{ background: a.primary ? "#000000" : "white", border: `1.5px solid ${a.primary ? "transparent" : "#E4E8F0"}` }}
        >
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: a.primary ? "rgba(255,255,255,0.15)" : "#F0F3FA", color: a.primary ? "white" : "#000000" }}>
            {a.icon}
          </div>
          <div>
            <p className="text-xs font-black" style={{ color: a.primary ? "white" : "#000000" }}>{a.label}</p>
            <p className="text-[10px]" style={{ color: a.primary ? "rgba(255,255,255,0.5)" : "#B0B8C9" }}>{a.sub}</p>
          </div>
        </button>
      ))}
    </div>
  );
}

// ─── Complaint Row ────────────────────────────────────────────────────────────
function CRow({ c, onView }) {
  const st = STATUS_CONFIG[c.status];
  const sv = SEVERITY_CONFIG[c.severity];
  const isCritical = c.severity === "Critical" || c.severity === "Severe";
  return (
    <div className="c-row flex items-center gap-3 px-4 py-3.5 cursor-pointer" onClick={() => onView(c)}>
      <div className="w-9 h-9 rounded-xl flex items-center justify-center text-base shrink-0 c-icon">
        {CAT_ICON[c.category] || "📋"}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <p className="text-sm font-bold truncate c-title">{c.title}</p>
          {isCritical && (
            <span className="text-[10px] px-2 py-0.5 rounded-md font-bold shrink-0" style={{ background: sv.bg, color: sv.color }}>{c.severity}</span>
          )}
          {c.slaDays !== null && c.slaDays <= 7 && c.status !== "Resolved" && (
            <span className="text-[10px] px-2 py-0.5 rounded-md font-bold shrink-0" style={{ background: c.slaDays <= 2 ? "#FEE2E2" : "#FEF3C7", color: c.slaDays <= 2 ? "#B91C1C" : "#B45309" }}>
              {c.slaDays}d SLA
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-[11px] font-mono c-id">{c.id}</span>
          <span className="text-[11px] flex items-center gap-1 c-meta"><IClock s={11} /> {relDate(c.updatedAt)}</span>
          <span className="hidden sm:inline-flex text-[11px] items-center gap-1 c-meta"><IBuilding s={11} /> {c.dept}</span>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[11px] font-bold" style={{ background: st.bg, color: st.color }}>
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: st.dot }} />
          {c.status}
        </span>
        <div className="w-7 h-7 rounded-lg flex items-center justify-center view-btn"><IChevR /></div>
      </div>
    </div>
  );
}

// ─── Detail Drawer ────────────────────────────────────────────────────────────
function DetailDrawer({ complaint, onClose, onNavigate }) {
  if (!complaint) return null;
  const st = STATUS_CONFIG[complaint.status];
  const sv = SEVERITY_CONFIG[complaint.severity];
  const STEPS = ["Filed", "Acknowledged", "Assigned", "In Progress", "Resolved"];
  const STEP_INDEX = { Pending: 0, Assigned: 2, "In Progress": 3, Resolved: 4 };
  const currentStep = STEP_INDEX[complaint.status] ?? 0;
  const progressPct = (currentStep / (STEPS.length - 1)) * 100;
  const UPDATES = Array.from({ length: complaint.updates || 0 }, (_, i) => ({
    date: new Date(new Date(complaint.updatedAt).getTime() - (complaint.updates - 1 - i) * 86400000 * 2).toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
    msg: ["Complaint received and logged", "Forwarded to concerned department", "Field inspection scheduled", "Work order issued", "Issue resolved and closed"][i] || "Status updated by department",
    by: ["System", "Control Room", "Dept. Head", "Field Officer", "Dept. Head"][i] || "Department",
  }));

  return (
    <div className="fixed inset-0 z-50 flex justify-end" onClick={onClose}>
      <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.28)", backdropFilter: "blur(4px)" }} />
      <div className="drawer relative w-full max-w-md h-full flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()} style={{ background: "#F7F6F2" }}>
        <div className="shrink-0 px-5 py-4 flex items-center gap-3" style={{ background: "white", borderBottom: "1.5px solid #F0F3FA" }}>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-base shrink-0" style={{ background: "#F0F3FA" }}>{CAT_ICON[complaint.category] || "📋"}</div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold truncate" style={{ color: "#000000" }}>{complaint.title}</p>
            <p className="text-[10px] font-mono" style={{ color: "#8892A4" }}>{complaint.id}</p>
          </div>
          <span className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[11px] font-bold shrink-0" style={{ background: st.bg, color: st.color }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: st.dot }} />{complaint.status}
          </span>
          <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center cursor-pointer border-none shrink-0" style={{ background: "#F0F3FA", color: "#6B7280" }}><IX /></button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4">
          <div className="flex gap-3">
            <div className="flex-1 p-3.5 rounded-xl flex flex-col gap-1" style={{ background: st.bg }}>
              <p className="text-[9px] font-black uppercase tracking-wider" style={{ color: st.color + "99" }}>Status</p>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ background: st.dot }} />
                <span className="text-sm font-black" style={{ color: st.color }}>{complaint.status}</span>
              </div>
            </div>
            <div className="flex-1 p-3.5 rounded-xl flex flex-col gap-1" style={{ background: sv.bg }}>
              <p className="text-[9px] font-black uppercase tracking-wider" style={{ color: sv.color + "99" }}>Severity</p>
              <span className="text-sm font-black" style={{ color: sv.color }}>{complaint.severity}</span>
            </div>
            {complaint.slaDays !== null && (
              <div className="flex-1 p-3.5 rounded-xl flex flex-col gap-1" style={{ background: complaint.slaDays <= 2 ? "#FEE2E2" : "#FEF3C7" }}>
                <p className="text-[9px] font-black uppercase tracking-wider" style={{ color: complaint.slaDays <= 2 ? "#B91C1C99" : "#B4530999" }}>SLA Left</p>
                <span className="text-sm font-black" style={{ color: complaint.slaDays <= 2 ? "#B91C1C" : "#B45309" }}>{complaint.slaDays} days</span>
              </div>
            )}
          </div>
          <div className="p-4 rounded-xl" style={{ background: "white", border: "1.5px solid #E4E8F0" }}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0" style={{ background: "#F0F3FA", color: "#000000" }}><ISparkle s={12} /></div>
                <span className="text-[10px] font-black uppercase tracking-wider" style={{ color: "#8892A4" }}>Evidence Score</span>
              </div>
              <span className="text-xl font-black" style={{ color: "#000000", fontFamily: "'DM Serif Display', serif" }}>
                {complaint.evidenceScore}<span className="text-xs font-semibold" style={{ color: "#B0B8C9" }}>/100</span>
              </span>
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ background: "#F0F3FA" }}>
              <div className="h-full rounded-full transition-all duration-700" style={{ width: `${complaint.evidenceScore}%`, background: "#000000" }} />
            </div>
            <div className="flex flex-wrap gap-1.5 mt-3">
              {complaint.evidenceScore >= 50 && <span className="evi-chip">📍 Location</span>}
              {complaint.evidenceScore >= 60 && <span className="evi-chip">📷 Photos</span>}
              {complaint.evidenceScore >= 80 && <span className="evi-chip">📝 Description</span>}
              {complaint.evidenceScore < 50 && <span className="evi-chip-warn">⚠️ Add evidence</span>}
            </div>
          </div>
          <div className="p-4 rounded-xl space-y-3" style={{ background: "white", border: "1.5px solid #E4E8F0" }}>
            <p className="text-[10px] font-black uppercase tracking-wider" style={{ color: "#8892A4" }}>Details</p>
            {[{ icon: <IBuilding s={13} />, label: "Department", val: complaint.dept }, { icon: <IPin s={13} />, label: "Location", val: complaint.location }, { icon: <IClock s={13} />, label: "Filed", val: fmtDate(complaint.createdAt) }, { icon: <IClock s={13} />, label: "Updated", val: fmtDate(complaint.updatedAt) }].map(({ icon, label, val }) => (
              <div key={label} className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-md flex items-center justify-center shrink-0 mt-0.5" style={{ background: "#F0F3FA", color: "#6B7280" }}>{icon}</div>
                <div>
                  <p className="text-[9px] font-black uppercase tracking-wider" style={{ color: "#B0B8C9" }}>{label}</p>
                  <p className="text-xs font-semibold" style={{ color: "#000000" }}>{val}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="p-4 rounded-xl" style={{ background: "white", border: "1.5px solid #E4E8F0" }}>
            <div className="flex items-center justify-between mb-4">
              <p className="text-[10px] font-black uppercase tracking-wider" style={{ color: "#8892A4" }}>Progress</p>
              <span className="text-[10px] font-black uppercase tracking-wider" style={{ color: st.color }}>{complaint.status}</span>
            </div>
            <div className="relative">
              <div className="absolute top-3.5 left-0 right-0 h-0.5" style={{ background: "#E4E8F0" }} />
              <div className="absolute top-3.5 left-0 h-0.5 transition-all duration-700" style={{ width: `${progressPct}%`, background: "#000000" }} />
              <div className="relative flex justify-between">
                {STEPS.map((s, i) => {
                  const done = i <= currentStep;
                  const active = i === currentStep;
                  return (
                    <div key={s} className="flex flex-col items-center gap-2">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center z-10 transition-all duration-300 ${done ? "step-done" : "step-pend"} ${active ? "step-active-ring" : ""}`}>
                        {done ? <ICheck s={12} stroke="white" /> : <span className="w-2 h-2 rounded-full" style={{ background: "#D1D9E6" }} />}
                      </div>
                      <span className="text-[9px] font-bold uppercase tracking-wide text-center" style={{ color: done ? "#000000" : "#C4C9D4", maxWidth: 44, lineHeight: 1.2 }}>{s}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          {UPDATES.length > 0 && (
            <div className="p-4 rounded-xl" style={{ background: "white", border: "1.5px solid #E4E8F0" }}>
              <p className="text-[10px] font-black uppercase tracking-wider mb-4" style={{ color: "#8892A4" }}>Activity · {UPDATES.length} update{UPDATES.length !== 1 ? "s" : ""}</p>
              <div className="relative">
                <div className="absolute left-3.5 top-0 bottom-0 w-px" style={{ background: "#E4E8F0" }} />
                <div className="space-y-4">
                  {UPDATES.map((u, i) => (
                    <div key={i} className="relative flex gap-4 pl-10">
                      <div className={`absolute left-0 w-7 h-7 rounded-full flex items-center justify-center z-10 ${i === UPDATES.length - 1 ? "step-done" : "step-pend"}`}>
                        {i === UPDATES.length - 1 ? <ICheck s={12} stroke="white" /> : <span className="w-2 h-2 rounded-full" style={{ background: "#C4C9D4" }} />}
                      </div>
                      <div className="flex-1 pb-1">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-xs font-semibold" style={{ color: "#000000" }}>{u.msg}</p>
                          <span className="text-[10px] shrink-0" style={{ color: "#8892A4" }}>{u.date}</span>
                        </div>
                        <p className="text-[10px] mt-0.5" style={{ color: "#B0B8C9" }}>By {u.by}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          {complaint.status === "Pending" && (
            <div className="p-4 rounded-xl flex items-start gap-3" style={{ background: "#FFFBEB", border: "1.5px solid #FDE68A" }}>
              <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: "#FEF3C7", color: "#B45309" }}><IAlert /></div>
              <div>
                <p className="text-xs font-black" style={{ color: "#000000" }}>Awaiting acknowledgement</p>
                <p className="text-[11px] mt-0.5" style={{ color: "#8892A4" }}>Your complaint is in the review queue. Departments typically respond within 48 hours.</p>
              </div>
            </div>
          )}
          <div className="h-2" />
        </div>
        <div className="shrink-0 px-5 py-4" style={{ background: "white", borderTop: "1.5px solid #F0F3FA" }}>
          <button onClick={() => { onClose(); onNavigate(`/complaint/${complaint.id}`); }} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all cursor-pointer border-none" style={{ background: "#000000", color: "white" }}>
            View Full Details <IArrowR />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function CitizenDashboard() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [filterStatus, setFS] = useState("All");
  const [filterSeverity, setFSev] = useState("All");
  const [sortBy, setSort] = useState("recent");
  const [activeTab, setTab] = useState("complaints");
  const [drawer, setDrawer] = useState(null);

  const stats = useMemo(() => {
    const total = MOCK_COMPLAINTS.length;
    const resolved = MOCK_COMPLAINTS.filter((c) => c.status === "Resolved").length;
    const active = MOCK_COMPLAINTS.filter((c) => ["Assigned", "In Progress"].includes(c.status)).length;
    const avgScore = Math.round(MOCK_COMPLAINTS.reduce((s, c) => s + c.evidenceScore, 0) / total);
    const resolveRate = Math.round((resolved / total) * 100);
    const pending = MOCK_COMPLAINTS.filter((c) => c.status === "Pending").length;
    const atRisk = MOCK_COMPLAINTS.filter(c => c.slaDays !== null && c.slaDays <= 7 && c.status !== "Resolved").length;
    return { total, resolved, active, avgScore, resolveRate, pending, atRisk };
  }, []);

  const donutData = [
    { label: "Resolved", value: stats.resolved, color: "#000000" },
    { label: "Active", value: stats.active, color: "#4A90D9" },
    { label: "Pending", value: stats.pending, color: "#D1D5DB" },
  ];

  const monthlyData = [
    { label: "Jan", value: 1, color: "#000000", dim: true },
    { label: "Feb", value: 2, color: "#000000", dim: true },
    { label: "Mar", value: 2, color: "#000000", dim: true },
    { label: "Apr", value: 2, color: "#000000", dim: true },
    { label: "May", value: 1, color: "#000000" },
  ];

  const filtered = useMemo(() => {
    let list = [...MOCK_COMPLAINTS];
    if (search) list = list.filter((c) => c.title.toLowerCase().includes(search.toLowerCase()) || c.id.includes(search));
    if (filterStatus !== "All") list = list.filter((c) => c.status === filterStatus);
    if (filterSeverity !== "All") list = list.filter((c) => c.severity === filterSeverity);
    list.sort({ recent: (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt), oldest: (a, b) => new Date(a.createdAt) - new Date(b.createdAt), severity: (a, b) => ["Critical", "Severe", "Moderate", "Minor"].indexOf(a.severity) - ["Critical", "Severe", "Moderate", "Minor"].indexOf(b.severity), score: (a, b) => b.evidenceScore - a.evidenceScore }[sortBy]);
    return list;
  }, [search, filterStatus, filterSeverity, sortBy]);

  return (
    <div className="min-h-screen relative overflow-x-hidden" style={{ background: "#F7F6F2", fontFamily: "'Instrument Sans', sans-serif" }}>
      {/* Grid BG */}
      <div className="fixed inset-0 pointer-events-none z-0" style={{ backgroundImage: `linear-gradient(rgba(0,0,0,0.042) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.042) 1px, transparent 1px)`, backgroundSize: "48px 48px" }} />

      <style>{`
        .s-card   { background: white; border: 1.5px solid #E4E8F0; }
        .s-icon   { background: #F0F3FA; color: #000000; }
        .s-tag    { background: #E6F7F1; color: #1A7F5A; }
        .s-val    { color: #000000; font-family: 'DM Serif Display', serif; }
        .s-label  { color: #8892A4; }
        .s-sub    { color: #B0B8C9; }

        .c-row     { border-bottom: 1px solid #F0F3FA; transition: background 0.12s; }
        .c-row:hover { background: #F7F9FC; }
        .c-row:last-child { border-bottom: none; }
        .c-icon   { background: #F0F3FA; }
        .c-title  { color: #000000; }
        .c-id     { color: #8892A4; }
        .c-meta   { color: #B0B8C9; }

        .view-btn { background: #F0F3FA; color: #000000; transition: all 0.12s; }
        .c-row:hover .view-btn { background: #000000; color: white; }

        .panel    { background: white; border: 1.5px solid #E4E8F0; border-radius: 20px; overflow: hidden; }

        .tab-btn  { background: transparent; border: none; cursor: pointer; padding: 8px 13px; font-family: inherit; font-size: 12px; font-weight: 700; border-radius: 8px; transition: all 0.12s; color: #8892A4; }
        .tab-btn.on { background: #000000; color: white; }
        .tab-btn:not(.on):hover { color: #000000; background: #F0F3FA; }

        .fsel     { background: white; border: 1.5px solid #E4E8F0; border-radius: 10px; padding: 7px 10px; font-size: 12px; font-weight: 600; color: #000000; outline: none; cursor: pointer; font-family: inherit; }
        .fsel:focus { border-color: #000000; }

        .profile-card { background: #000000; border-radius: 20px; padding: 24px; position: relative; overflow: hidden; }
        .chart-card   { background: white; border: 1.5px solid #E4E8F0; border-radius: 20px; padding: 20px; }

        .step-done       { background: #000000; }
        .step-pend       { background: white; border: 2px solid #E4E8F0; }
        .step-active-ring { box-shadow: 0 0 0 3px rgba(26,26,46,0.12); }
        .evi-chip        { font-size: 10px; padding: 3px 8px; border-radius: 6px; font-weight: 600; background: #F0F3FA; color: #4A5568; }
        .evi-chip-warn   { font-size: 10px; padding: 3px 8px; border-radius: 6px; font-weight: 600; background: #FEF3C7; color: #B45309; }

        .drawer {
          animation: slideIn 0.28s cubic-bezier(0.22, 1, 0.36, 1) forwards;
          box-shadow: -12px 0 56px rgba(0,0,0,0.14);
        }
        @keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }
        @keyframes fadeUp  { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
        .fu  { animation: fadeUp 0.3s ease forwards; }
        .fu1 { animation: fadeUp 0.3s 0.06s ease both; }
        .fu2 { animation: fadeUp 0.3s 0.12s ease both; }
        .fu3 { animation: fadeUp 0.3s 0.18s ease both; }
        .fu4 { animation: fadeUp 0.3s 0.24s ease both; }
        .fu5 { animation: fadeUp 0.3s 0.30s ease both; }

        .quick-action { transition: all 0.15s; }
        .quick-action:hover { transform: translateY(-1px); }

        .insight-card { transition: all 0.12s; }
        .insight-card:hover { transform: translateX(2px); }

        @media (max-width: 640px) {
          .drawer { max-width: 100% !important; }
          .grid-stats { grid-template-columns: 1fr 1fr !important; }
          .charts-row { grid-template-columns: 1fr !important; }
          .profile-card { padding: 18px; }
        }
      `}</style>

      {/* ── Top nav ── */}
      <div className="sticky top-0 z-40" style={{ background: "rgba(247,246,242,0.92)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(0,0,0,0.07)" }}>
        <div className="max-w-6xl mx-auto px-4 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div style={{ background: "#000000", color: "white", fontWeight: 900, fontSize: 13, width: 36, height: 36, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              {MOCK_CITIZEN.avatar}
            </div>
            <div>
              <p className="text-sm font-black" style={{ color: "#000000" }}>{MOCK_CITIZEN.name}</p>
              <p className="text-[10px] font-semibold" style={{ color: "#8892A4" }}>{MOCK_CITIZEN.ward}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {stats.atRisk > 0 && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold" style={{ background: "#FEE2E2", color: "#B91C1C" }}>
                <IAlert /> <span className="hidden sm:inline">{stats.atRisk} SLA alert{stats.atRisk > 1 ? "s" : ""}</span>
                <span className="sm:hidden">{stats.atRisk}</span>
              </div>
            )}
            <button onClick={() => navigate("/file-complaint")} className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold cursor-pointer border-none" style={{ background: "#000000", color: "white" }}>
              <IPlus /> <span className="hidden sm:inline">New Complaint</span><span className="sm:hidden">+ New</span>
            </button>
          </div>
        </div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-6 space-y-5">

        {/* Heading */}
        <div className="fu flex items-end justify-between flex-wrap gap-3">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-1.5" style={{ color: "#8892A4" }}>My Grievances</p>
            <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: "clamp(24px,5vw,38px)", fontWeight: 400, color: "#000000", letterSpacing: "-0.02em", lineHeight: 1.1 }}>
              Good morning, {MOCK_CITIZEN.name.split(" ")[0]}.<br />
              <span style={{ color: "#B0B8C9" }}>Here's your civic activity.</span>
            </h1>
          </div>
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl" style={{ background: "white", border: "1.5px solid #E4E8F0" }}>
            <IAward />
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider" style={{ color: "#8892A4" }}>Ward Rank</p>
              <p className="text-sm font-black" style={{ color: "#000000" }}>#{WARD_RANK.rank} of {WARD_RANK.total}</p>
            </div>
          </div>
        </div>

        {/* SLA Warning */}
        <div className="fu1">
          <SLABanner complaints={MOCK_COMPLAINTS} />
        </div>

        {/* Quick Actions */}
        <div className="fu1">
          <QuickActions onNavigate={navigate} />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 fu2">
          <StatCard label="Total Filed" value={stats.total} icon={<IFile />} sub={`Since ${MOCK_CITIZEN.joinedDate}`} />
          <StatCard label="Resolved" value={stats.resolved} icon={<ICheck />} tag={`${stats.resolveRate}%`} />
          <StatCard label="Active" value={stats.active} icon={<ITrend />} sub="Assigned or in progress" trend={RESOLUTION_VELOCITY} trendLabel="↓ Avg time improving" />
          <StatCard label="Avg Evidence" value={stats.avgScore} icon={<ISparkle />} sub="Out of 100 points" />
        </div>

        {/* Charts row */}
        <div className="grid md:grid-cols-3 gap-4 fu3">
          {/* Profile + Ward Rank */}
          <div className="profile-card">
            <div className="relative flex items-center gap-4 mb-5">
              <div style={{ background: "rgba(255,255,255,0.12)", color: "white", fontWeight: 900, fontSize: 17, width: 52, height: 52, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, letterSpacing: 1 }}>
                {MOCK_CITIZEN.avatar}
              </div>
              <div>
                <p className="text-base font-black" style={{ color: "white" }}>{MOCK_CITIZEN.name}</p>
                <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>{MOCK_CITIZEN.ward}</p>
              </div>
            </div>
            <div className="space-y-2">
              {[
                { label: "Resolution Rate", val: `${stats.resolveRate}%` },
                { label: "Avg. Resolution", val: "8 days" },
                { label: "Ward Rank", val: `#${WARD_RANK.rank} / ${WARD_RANK.total}` },
                { label: "Member Since", val: MOCK_CITIZEN.joinedDate },
              ].map(({ label, val }) => (
                <div key={label} className="flex items-center justify-between py-2.5 px-3 rounded-xl" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.07)" }}>
                  <span className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>{label}</span>
                  <span className="text-sm font-black" style={{ color: "white" }}>{val}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Donut + Ward Ring stacked */}
          <div className="flex flex-col gap-3">
            <div className="chart-card flex-1">
              <p className="text-[10px] font-black uppercase tracking-wider mb-3" style={{ color: "#8892A4" }}>Status Overview</p>
              <div className="flex items-center justify-around gap-4">
                <div className="relative shrink-0">
                  <Donut data={donutData} size={100} thick={12} />
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-black" style={{ color: "#000000", fontFamily: "'DM Serif Display',serif" }}>{stats.total}</span>
                    <span className="text-[9px] uppercase tracking-wider" style={{ color: "#8892A4" }}>total</span>
                  </div>
                </div>
                <div className="space-y-2">
                  {donutData.map((s) => (
                    <div key={s.label} className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: s.color }} />
                      <span className="text-xs font-semibold" style={{ color: "#4A5568" }}>{s.label}</span>
                      <span className="text-xs font-black ml-auto pl-4" style={{ color: "#000000" }}>{s.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="chart-card" style={{ padding: "16px 20px" }}>
              <p className="text-[10px] font-black uppercase tracking-wider mb-3" style={{ color: "#8892A4" }}>Ward Performance</p>
              <WardRankRing rank={WARD_RANK.rank} total={WARD_RANK.total} percentile={WARD_RANK.percentile} />
            </div>
          </div>

          {/* Heatmap + bar */}
          <div className="flex flex-col gap-3">
            <div className="chart-card flex-1">
              <p className="text-[10px] font-black uppercase tracking-wider mb-3" style={{ color: "#8892A4" }}>Activity Heatmap · Last 5 Weeks</p>
              <ActivityHeatmap data={HEATMAP_DATA} />
            </div>
            <div className="chart-card">
              <p className="text-[10px] font-black uppercase tracking-wider mb-2.5" style={{ color: "#8892A4" }}>Filed per Month</p>
              <Bar data={monthlyData} height={68} />
            </div>
          </div>
        </div>

        {/* AI Insights row */}
        <div className="fu4">
          <div className="p-4 rounded-2xl" style={{ background: "white", border: "1.5px solid #E4E8F0" }}>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: "#000000", color: "white" }}>
                <ISparkle s={12} />
              </div>
              <p className="text-[10px] font-black uppercase tracking-wider" style={{ color: "#8892A4" }}>AI Insights</p>
              <span className="text-[9px] px-2 py-0.5 rounded-full font-bold ml-1" style={{ background: "#F0F3FA", color: "#8892A4" }}>Powered by Nivaran AI</span>
            </div>
            <div className="grid sm:grid-cols-3 gap-2.5">
              {AI_INSIGHTS.map((insight, i) => <AIInsightCard key={i} insight={insight} />)}
            </div>
          </div>
        </div>

        {/* Complaints panel */}
        <div className="panel fu5">
          <div className="px-4 py-4" style={{ borderBottom: "1.5px solid #F0F3FA" }}>
            <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
              <div className="flex gap-1">
                {["complaints", "analytics"].map((t) => (
                  <button key={t} onClick={() => setTab(t)} className={`tab-btn ${activeTab === t ? "on" : ""}`}>
                    {t === "complaints" ? `All (${stats.total})` : "Analytics"}
                  </button>
                ))}
              </div>
              <button onClick={() => navigate("/file-complaint")} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold cursor-pointer border-none" style={{ background: "#F0F3FA", color: "#000000" }}>
                <IPlus /> File New
              </button>
            </div>
            {activeTab === "complaints" && (
              <div className="flex flex-col sm:flex-row flex-wrap gap-2">
                <div className="flex items-center gap-2 flex-1 min-w-0 px-3 py-2 rounded-xl" style={{ background: "#F7F9FC", border: "1.5px solid #E4E8F0" }}>
                  <ISearch />
                  <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search complaints…" className="flex-1 text-sm outline-none bg-transparent font-medium" style={{ color: "#000000", minWidth: 0 }} />
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <IFilter />
                  <select value={filterStatus} onChange={(e) => setFS(e.target.value)} className="fsel">
                    <option>All</option>
                    {["Pending", "Assigned", "In Progress", "Resolved"].map((s) => <option key={s}>{s}</option>)}
                  </select>
                  <select value={filterSeverity} onChange={(e) => setFSev(e.target.value)} className="fsel">
                    <option>All</option>
                    {["Minor", "Moderate", "Severe", "Critical"].map((s) => <option key={s}>{s}</option>)}
                  </select>
                  <select value={sortBy} onChange={(e) => setSort(e.target.value)} className="fsel">
                    <option value="recent">Latest</option>
                    <option value="oldest">Oldest</option>
                    <option value="severity">Severity</option>
                    <option value="score">Evidence</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {activeTab === "complaints" && (
            filtered.length > 0
              ? filtered.map((c) => <CRow key={c.id} c={c} onView={setDrawer} />)
              : (
                <div className="py-14 text-center">
                  <p className="text-3xl mb-2">🔍</p>
                  <p className="text-sm font-bold" style={{ color: "#000000" }}>No complaints found</p>
                  <p className="text-xs mt-1" style={{ color: "#8892A4" }}>Adjust your filters</p>
                </div>
              )
          )}

          {activeTab === "analytics" && (
            <div className="p-5 grid md:grid-cols-2 gap-5">
              <div>
                <p className="text-[10px] font-black uppercase tracking-wider mb-4" style={{ color: "#8892A4" }}>Severity Breakdown</p>
                <div className="space-y-3">
                  {["Critical", "Severe", "Moderate", "Minor"].map((sev) => {
                    const count = MOCK_COMPLAINTS.filter((c) => c.severity === sev).length;
                    const pct = Math.round((count / stats.total) * 100);
                    const cfg = SEVERITY_CONFIG[sev];
                    return (
                      <div key={sev}>
                        <div className="flex justify-between mb-1.5">
                          <span className="text-xs font-bold" style={{ color: "#4A5568" }}>{sev}</span>
                          <span className="text-xs font-black" style={{ color: cfg.color !== "#6B7280" ? cfg.color : "#000000" }}>{count} ({pct}%)</span>
                        </div>
                        <div className="h-2 rounded-full overflow-hidden" style={{ background: "#F0F3FA" }}>
                          <div className="h-full rounded-full" style={{ width: `${pct}%`, background: "#000000", opacity: sev === "Minor" ? 0.25 : sev === "Moderate" ? 0.45 : sev === "Severe" ? 0.7 : 1 }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-wider mb-4" style={{ color: "#8892A4" }}>Department Breakdown</p>
                <div className="space-y-2">
                  {(() => {
                    const depts = {};
                    MOCK_COMPLAINTS.forEach((c) => { depts[c.dept] = (depts[c.dept] || 0) + 1; });
                    return Object.entries(depts).sort((a, b) => b[1] - a[1]).map(([dept, count]) => (
                      <div key={dept} className="flex items-center justify-between px-3 py-2.5 rounded-xl" style={{ background: "#F7F9FC", border: "1px solid #F0F3FA" }}>
                        <span className="text-xs font-semibold" style={{ color: "#4A5568" }}>{dept}</span>
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 rounded-full" style={{ width: `${count * 20}px`, background: "#000000", maxWidth: 80, opacity: 0.6 }} />
                          <span className="text-xs font-black w-4 text-right" style={{ color: "#000000" }}>{count}</span>
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              </div>
              {/* Resolution velocity */}
              <div className="p-4 rounded-2xl" style={{ background: "#F0F3FA", border: "1.5px solid #E4E8F0" }}>
                <p className="text-[10px] font-black uppercase tracking-wider mb-3" style={{ color: "#8892A4" }}>Resolution Velocity · Last 7 Complaints</p>
                <div className="flex items-end gap-1.5" style={{ height: 60 }}>
                  {RESOLUTION_VELOCITY.map((days, i) => {
                    const maxD = Math.max(...RESOLUTION_VELOCITY);
                    const isLast = i === RESOLUTION_VELOCITY.length - 1;
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1">
                        <span className="text-[9px] font-bold" style={{ color: isLast ? "#000000" : "#B0B8C9" }}>{days}d</span>
                        <div className="w-full rounded-t-sm" style={{ height: `${(days / maxD) * 36}px`, background: "#000000", opacity: isLast ? 1 : 0.25 + (i / RESOLUTION_VELOCITY.length) * 0.5 }} />
                        <span className="text-[8px]" style={{ color: "#B0B8C9" }}>C{i + 1}</span>
                      </div>
                    );
                  })}
                </div>
                <p className="text-[10px] mt-2 font-semibold" style={{ color: "#1A7F5A" }}>↓ 50% faster over 7 complaints</p>
              </div>
              <div className="p-4 rounded-2xl flex items-center gap-4" style={{ background: "#F0F3FA", border: "1.5px solid #E4E8F0" }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: "#000000", color: "white" }}><ITrend /></div>
                <div>
                  <p className="text-sm font-black" style={{ color: "#000000" }}>Complaints resolve <span style={{ textDecoration: "underline" }}>32% faster</span> with high evidence scores</p>
                  <p className="text-xs mt-0.5" style={{ color: "#8892A4" }}>Attach GPS location and photos when filing to boost your score and speed up resolution.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="h-6" />
      </div>

      {drawer && <DetailDrawer complaint={drawer} onClose={() => setDrawer(null)} onNavigate={(path) => navigate(path)} />}
    <Footer/>
    </div>
  );
}