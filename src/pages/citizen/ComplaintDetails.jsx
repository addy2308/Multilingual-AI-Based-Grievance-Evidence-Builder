import { useState, useRef } from "react";
import Footer from "../../components/common/Footer";

const MOCK_COMPLAINTS = {
  "NVR-25-104821": {
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
    priority: "High",
    complaintType: "Public Safety",
    ward: "Ward 12",
    pincode: "110001",
    respondedIn: "2 days",
    expectedResolution: "2025-06-01",
    upvotes: 47,
    similarComplaints: 12,
    description:
      "The road surface near the main market entry has developed deep potholes following the recent rainfall. Several two-wheelers have already been damaged and the situation poses a significant safety risk, especially at night when the potholes are not visible.",
    assignedOfficer: "Rajesh Kumar",
    officerPhone: "98XXXXXXXX",
    officerDesignation: "Junior Engineer, PWD Zone 3",
  },
  "NVR-25-098312": {
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
    priority: "Critical",
    complaintType: "Essential Services",
    ward: "Ward 12",
    pincode: "110001",
    respondedIn: "6 hours",
    expectedResolution: "2025-05-05",
    upvotes: 89,
    similarComplaints: 31,
    description:
      "Complete absence of piped water supply in Sector B for 3 consecutive days. Over 200 households are affected. Residents are forced to buy water at high prices from private tankers. The main supply valve near the overhead tank appears to be the source of the blockage.",
    assignedOfficer: "Suresh Nair",
    officerPhone: "97XXXXXXXX",
    officerDesignation: "Section Head, Jal Board West",
  },
};

const DEFAULT = Object.values(MOCK_COMPLAINTS)[0];

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
  Pending: { color: "#8892A4", bg: "#F0F3FA", dot: "#C4C9D4", label: "Awaiting Review" },
  Assigned: { color: "#000000", bg: "#EEF0F8", dot: "#000000", label: "Dept. Assigned" },
  "In Progress": { color: "#2B6CB0", bg: "#EEF4FF", dot: "#4A90D9", label: "Work Underway" },
  Resolved: { color: "#1A7F5A", bg: "#E6F7F1", dot: "#10B981", label: "Closed" },
};

const SEVERITY_CONFIG = {
  Minor: { color: "#6B7280", bg: "#F3F4F6" },
  Moderate: { color: "#6B7280", bg: "#F3F4F6" },
  Severe: { color: "#B45309", bg: "#FEF3C7" },
  Critical: { color: "#B91C1C", bg: "#FEE2E2" },
};

const UPDATE_MESSAGES = [
  "Complaint received and logged into the system",
  "Forwarded to concerned department for review",
  "Field inspection scheduled by department",
  "Work order issued, ground team deployed",
  "Issue resolved and marked closed",
];
const UPDATE_BY = ["System", "Control Room", "Dept. Head", "Field Officer", "Dept. Head"];

// ── Icons ──────────────────────────────────────────────────────────────────────
const Ic = ({ d, s = 16, sw = 2, fill = "none", stroke = "currentColor" }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill={fill} stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
    {Array.isArray(d) ? d.map((p, i) => <path key={i} d={p} />) : <path d={d} />}
  </svg>
);

const IChevL = () => <Ic d="M15 18l-6-6 6-6" />;
const IClock = ({ s = 16 }) => <Ic d={["M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z", "M12 6v6l4 2"]} s={s} />;
const IPin = ({ s = 16 }) => <Ic d={["M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z", "M12 10m-3 0a3 3 0 1 0 6 0 3 3 0 1 0-6 0"]} s={s} />;
const ICheck = ({ s = 16, stroke = "currentColor" }) => <Ic d="M20 6L9 17l-5-5" s={s} sw={2.5} stroke={stroke} />;
const IBuilding = ({ s = 16 }) => <Ic d={["M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z", "M9 22V12h6v10"]} s={s} />;
const ISparkle = ({ s = 16 }) => <Ic d={["M12 3l1.09 3.26L16.5 7.5l-3.41 1.24L12 12l-1.09-3.26L7.5 7.5l3.41-1.24L12 3z", "M19 14l.55 1.64L21 16l-1.45.36-.55 1.64-.55-1.64L17 16l1.45-.36L19 14z"]} s={s} />;
const IAlert = ({ s = 16 }) => <Ic d={["M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z", "M12 9v4", "M12 17h.01"]} s={s} />;
const IFile = ({ s = 16 }) => <Ic d={["M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z", "M14 2v6h6"]} s={s} />;
const IShare = ({ s = 16 }) => <Ic d={["M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8", "M16 6l-4-4-4 4", "M12 2v13"]} s={s} />;
const ICamera = ({ s = 16 }) => <Ic d={["M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z", "M12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"]} s={s} />;
const IUser = ({ s = 16 }) => <Ic d={["M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2", "M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"]} s={s} />;
const IHash = () => <Ic d={["M4 9h16", "M4 15h16", "M10 3L8 21", "M16 3l-2 18"]} />;
const ITick = () => <Ic d={["M22 11.08V12a10 10 0 1 1-5.93-9.14", "M22 4L12 14.01l-3-3"]} />;
const IThumb = ({ s = 16 }) => <Ic d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" s={s} />;
const IPhone = ({ s = 16 }) => <Ic d={["M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.55 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"]} s={s} />;
const ICopy = ({ s = 16 }) => <Ic d={["M20 9H11a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h9a2 2 0 0 0 2-2V11a2 2 0 0 0-2-2z", "M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 0 2 2v1"]} s={s} />;
const IClose = ({ s = 16 }) => <Ic d="M18 6L6 18M6 6l12 12" s={s} />;
const IStar = ({ s = 16 }) => <Ic d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" s={s} />;
const IUsers = ({ s = 16 }) => <Ic d={["M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2", "M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z", "M23 21v-2a4 4 0 0 0-3-3.87", "M16 3.13a4 4 0 0 1 0 7.75"]} s={s} />;
const ICalendar = ({ s = 16 }) => <Ic d={["M19 4H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z", "M16 2v4", "M8 2v4", "M3 10h18"]} s={s} />;
const ITag = ({ s = 16 }) => <Ic d={["M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z", "M7 7h.01"]} s={s} />;
const IMap = ({ s = 16 }) => <Ic d={["M1 6v16l7-4 8 4 7-4V2l-7 4-8-4-7 4z", "M8 2v16", "M16 6v16"]} s={s} />;
const IPlus = ({ s = 16 }) => <Ic d={["M12 5v14", "M5 12h14"]} s={s} />;
const IX = ({ s = 16 }) => <Ic d="M18 6L6 18M6 6l12 12" s={s} />;

// ── Helpers ────────────────────────────────────────────────────────────────────
function fmtDate(d) {
  return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
}
function fmtDateShort(d) {
  return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}
function relDate(d) {
  const diff = Math.floor((Date.now() - new Date(d)) / 86400000);
  if (diff === 0) return "Today";
  if (diff === 1) return "Yesterday";
  if (diff < 7) return `${diff} days ago`;
  if (diff < 30) return `${Math.floor(diff / 7)} weeks ago`;
  return `${Math.floor(diff / 30)} months ago`;
}

// ── Share Modal ────────────────────────────────────────────────────────────────
function ShareModal({ complaint, onClose }) {
  const [copied, setCopied] = useState(false);
  const url = `https://nagarik-voice.gov.in/track/${complaint.id}`;
  const handleCopy = () => {
    navigator.clipboard.writeText(url).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div style={{ background: "#fff", borderRadius: 20, border: "1.5px solid #E4E8F0", width: "100%", maxWidth: 400, padding: 24, position: "relative" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <p style={{ fontWeight: 900, fontSize: 15, color: "#000" }}>Share Complaint</p>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#8892A4" }}><IClose s={18} /></button>
        </div>
        <p style={{ fontSize: 11, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.12em", color: "#B0B8C9", marginBottom: 6 }}>Complaint Link</p>
        <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
          <div style={{ flex: 1, background: "#F7F6F2", border: "1.5px solid #E4E8F0", borderRadius: 10, padding: "10px 12px", fontSize: 11, color: "#4A5568", fontFamily: "monospace", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{url}</div>
          <button onClick={handleCopy} style={{ background: copied ? "#000" : "#F0F3FA", border: "1.5px solid #E4E8F0", borderRadius: 10, padding: "10px 14px", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 700, color: copied ? "#fff" : "#000", transition: "all 0.15s", whiteSpace: "nowrap" }}>
            {copied ? <ICheck s={14} stroke="#fff" /> : <ICopy s={14} />}
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
        <p style={{ fontSize: 11, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.12em", color: "#B0B8C9", marginBottom: 10 }}>Share Via</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {[
            { label: "WhatsApp", bg: "#25D366", text: "#fff", msg: `Track complaint ${complaint.id}: ${url}` },
            { label: "SMS", bg: "#2B6CB0", text: "#fff", msg: `Track: ${url}` },
            { label: "Email", bg: "#F0F3FA", text: "#000" },
            { label: "Print QR", bg: "#F0F3FA", text: "#000" },
          ].map(({ label, bg, text }) => (
            <button key={label} style={{ background: bg, border: "1.5px solid #E4E8F0", borderRadius: 10, padding: "10px 0", fontSize: 13, fontWeight: 700, color: text, cursor: "pointer" }}>{label}</button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Photo Upload Modal ─────────────────────────────────────────────────────────
function PhotoModal({ onClose, photos, setPhotos }) {
  const fileRef = useRef();
  const handleFiles = (files) => {
    Array.from(files).forEach(file => {
      if (!file.type.startsWith("image/")) return;
      const reader = new FileReader();
      reader.onload = (e) => setPhotos(prev => [...prev, { url: e.target.result, name: file.name, size: (file.size / 1024).toFixed(0) + " KB" }]);
      reader.readAsDataURL(file);
    });
  };
  const onDrop = (e) => { e.preventDefault(); handleFiles(e.dataTransfer.files); };
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div style={{ background: "#fff", borderRadius: 20, border: "1.5px solid #E4E8F0", width: "100%", maxWidth: 460, padding: 24 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <p style={{ fontWeight: 900, fontSize: 15, color: "#000" }}>Add Evidence Photos</p>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#8892A4" }}><IClose s={18} /></button>
        </div>
        <div
          onDrop={onDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => fileRef.current.click()}
          style={{ border: "2px dashed #D1D9E6", borderRadius: 14, padding: "32px 20px", textAlign: "center", cursor: "pointer", marginBottom: 16, background: "#F7F6F2", transition: "border-color 0.15s" }}
        >
          <div style={{ width: 48, height: 48, background: "#F0F3FA", borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px", color: "#8892A4" }}><ICamera s={22} /></div>
          <p style={{ fontWeight: 800, fontSize: 14, color: "#000", marginBottom: 4 }}>Drop photos here or click to browse</p>
          <p style={{ fontSize: 12, color: "#8892A4" }}>PNG, JPG up to 10 MB each · Max 5 photos</p>
          <input ref={fileRef} type="file" accept="image/*" multiple style={{ display: "none" }} onChange={e => handleFiles(e.target.files)} />
        </div>
        {photos.length > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginBottom: 16 }}>
            {photos.map((p, i) => (
              <div key={i} style={{ position: "relative", borderRadius: 10, overflow: "hidden", aspectRatio: "1", border: "1.5px solid #E4E8F0" }}>
                <img src={p.url} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                <button onClick={() => setPhotos(prev => prev.filter((_, j) => j !== i))} style={{ position: "absolute", top: 4, right: 4, background: "rgba(0,0,0,0.6)", border: "none", borderRadius: "50%", width: 22, height: 22, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#fff" }}><IX s={10} /></button>
                <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "rgba(0,0,0,0.55)", padding: "3px 6px" }}>
                  <p style={{ fontSize: 9, color: "#fff", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.size}</p>
                </div>
              </div>
            ))}
          </div>
        )}
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={onClose} style={{ flex: 1, background: "#F0F3FA", border: "1.5px solid #E4E8F0", borderRadius: 12, padding: "11px 0", fontSize: 13, fontWeight: 700, cursor: "pointer", color: "#000" }}>Cancel</button>
          <button onClick={onClose} style={{ flex: 1, background: "#000", border: "none", borderRadius: 12, padding: "11px 0", fontSize: 13, fontWeight: 700, cursor: "pointer", color: "#fff" }}>
            {photos.length > 0 ? `Attach ${photos.length} Photo${photos.length > 1 ? "s" : ""}` : "Done"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Download PDF helper ────────────────────────────────────────────────────────
function downloadPDF(complaint) {
  const content = `COMPLAINT REPORT — ${complaint.id}
${"=".repeat(50)}

Title        : ${complaint.title}
Category     : ${complaint.category}
Department   : ${complaint.dept}
Status       : ${complaint.status}
Severity     : ${complaint.severity}
Location     : ${complaint.location}
Ward         : ${complaint.ward}
Pincode      : ${complaint.pincode}

Filed on     : ${fmtDate(complaint.createdAt)}
Last Updated : ${fmtDate(complaint.updatedAt)}
Filed By     : Arjun Mehta

DESCRIPTION
${"─".repeat(50)}
${complaint.description}

ASSIGNED OFFICER
${"─".repeat(50)}
Name         : ${complaint.assignedOfficer || "Pending Assignment"}
Designation  : ${complaint.officerDesignation || "—"}
Contact      : ${complaint.officerPhone || "—"}

EVIDENCE SCORE : ${complaint.evidenceScore}/100

${"─".repeat(50)}
This is an auto-generated complaint receipt.
Track online: https://nagarik-voice.gov.in/track/${complaint.id}
Helpline: 1800-XXX-XXXX
`;
  const blob = new Blob([content], { type: "text/plain" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `Complaint_${complaint.id}.txt`;
  a.click();
  URL.revokeObjectURL(a.href);
}

// ── Timeline Step ──────────────────────────────────────────────────────────────
function TimelineStep({ label, date, by, done, active, last }) {
  return (
    <div className="relative flex gap-5">
      {!last && (
        <div className="absolute left-3.75 top-8 w-px" style={{ bottom: -20, background: done ? "#000" : "#E4E8F0" }} />
      )}
      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10 ${done ? "tl-done" : active ? "tl-active" : "tl-pend"}`}>
        {done ? <ICheck s={13} stroke="white" /> : <span className="w-2.5 h-2.5 rounded-full" style={{ background: active ? "#000" : "#D1D9E6" }} />}
      </div>
      <div className="flex-1 pb-8">
        <div className="flex items-start justify-between gap-3 mb-1">
          <div>
            <p className="text-sm font-black" style={{ color: done || active ? "#000" : "#C4C9D4" }}>{label}</p>
          </div>
          {date && (
            <div className="shrink-0 text-right">
              <p className="text-xs font-bold" style={{ color: "#000" }}>{fmtDateShort(date)}</p>
              {by && <p className="text-[10px] mt-0.5" style={{ color: "#B0B8C9" }}>{by}</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Evidence Badge ─────────────────────────────────────────────────────────────
function EvidenceBadge({ score }) {
  const level = score >= 80 ? "Strong" : score >= 50 ? "Moderate" : "Weak";
  const color = score >= 80 ? "#1A7F5A" : score >= 50 ? "#2B6CB0" : "#B45309";
  const bg = score >= 80 ? "#E6F7F1" : score >= 50 ? "#EEF4FF" : "#FEF3C7";
  const segments = 10;
  const filled = Math.round((score / 100) * segments);
  return (
    <div className="ev-card rounded-2xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "#F0F3FA", color: "#000" }}>
            <ISparkle s={15} />
          </div>
          <p className="text-[10px] font-black uppercase tracking-wider" style={{ color: "#8892A4" }}>Evidence Strength</p>
        </div>
        <span className="text-[10px] px-2.5 py-1 rounded-full font-black uppercase tracking-wider" style={{ background: bg, color }}>{level}</span>
      </div>
      <div className="flex items-end gap-1.5">
        <span className="text-5xl font-black" style={{ color: "#000", fontFamily: "'DM Serif Display', serif", lineHeight: 1 }}>{score}</span>
        <span className="text-sm mb-1" style={{ color: "#C4C9D4" }}>/100</span>
      </div>
      <div className="flex gap-1">
        {Array.from({ length: segments }).map((_, i) => (
          <div key={i} className="flex-1 h-2 rounded-full" style={{ background: i < filled ? "#000" : "#F0F3FA", opacity: i < filled ? 0.3 + (i / filled) * 0.7 : 1 }} />
        ))}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {score >= 50 && <span className="ev-chip">📍 Location tagged</span>}
        {score >= 60 && <span className="ev-chip">📷 Photo attached</span>}
        {score >= 80 && <span className="ev-chip">📝 Full description</span>}
        {score >= 90 && <span className="ev-chip">✅ Verified report</span>}
        {score < 50 && <span className="ev-chip-warn">⚠️ Add more evidence</span>}
      </div>
    </div>
  );
}

// ── Stats Strip ────────────────────────────────────────────────────────────────
function StatsStrip({ complaint }) {
  return (
    <div className="det-card p-5">
      <p className="sec-label">At a Glance</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
        {[
          { label: "Community Upvotes", val: complaint.upvotes, icon: <IThumb s={14} />, color: "#2B6CB0", bg: "#EEF4FF" },
          { label: "Similar Complaints", val: complaint.similarComplaints, icon: <IUsers s={14} />, color: "#6B7280", bg: "#F0F3FA" },
          { label: "Response Time", val: complaint.respondedIn, icon: <IClock s={14} />, color: "#1A7F5A", bg: "#E6F7F1" },
          { label: "Est. Resolution", val: fmtDateShort(complaint.expectedResolution), icon: <ICalendar s={14} />, color: "#B45309", bg: "#FEF3C7" },
        ].map(({ label, val, icon, color, bg }) => (
          <div key={label} style={{ background: bg, borderRadius: 14, padding: "14px 14px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6, color }}>
              {icon}
              <p style={{ fontSize: 10, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.1em", color }}>{label}</p>
            </div>
            <p style={{ fontSize: 20, fontWeight: 900, color: "#000", fontFamily: "'DM Serif Display', serif" }}>{val}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Officer Card ───────────────────────────────────────────────────────────────
function OfficerCard({ complaint }) {
  if (!complaint.assignedOfficer) return null;
  return (
    <div className="det-card p-5">
      <p className="sec-label">Assigned Officer</p>
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{ width: 48, height: 48, borderRadius: "50%", background: "#F0F3FA", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 18, fontWeight: 900, color: "#4A5568", fontFamily: "'DM Serif Display', serif" }}>
          {complaint.assignedOfficer.split(" ").map(n => n[0]).join("").slice(0, 2)}
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ fontWeight: 900, fontSize: 14, color: "#000" }}>{complaint.assignedOfficer}</p>
          <p style={{ fontSize: 12, color: "#8892A4", marginTop: 2 }}>{complaint.officerDesignation}</p>
        </div>
        <a href={`tel:${complaint.officerPhone}`} style={{ background: "#F0F3FA", border: "1.5px solid #E4E8F0", borderRadius: 12, padding: "9px 14px", display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 700, color: "#000", textDecoration: "none", cursor: "pointer" }}>
          <IPhone s={14} /> Call
        </a>
      </div>
      <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1.5px solid #F0F3FA", display: "flex", gap: 8 }}>
        <div style={{ flex: 1, background: "#F7F6F2", borderRadius: 10, padding: "10px 12px" }}>
          <p style={{ fontSize: 10, color: "#B0B8C9", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 3 }}>Department</p>
          <p style={{ fontSize: 12, fontWeight: 700, color: "#000" }}>{complaint.dept}</p>
        </div>
        <div style={{ flex: 1, background: "#F7F6F2", borderRadius: 10, padding: "10px 12px" }}>
          <p style={{ fontSize: 10, color: "#B0B8C9", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 3 }}>Priority</p>
          <p style={{ fontSize: 12, fontWeight: 700, color: "#000" }}>{complaint.priority}</p>
        </div>
        <div style={{ flex: 1, background: "#F7F6F2", borderRadius: 10, padding: "10px 12px" }}>
          <p style={{ fontSize: 10, color: "#B0B8C9", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 3 }}>Type</p>
          <p style={{ fontSize: 12, fontWeight: 700, color: "#000" }}>{complaint.complaintType}</p>
        </div>
      </div>
    </div>
  );
}

// ── Location Map Preview ───────────────────────────────────────────────────────
function LocationCard({ complaint }) {
  return (
    <div className="det-card overflow-hidden" style={{ borderRadius: 20 }}>
      <div style={{ background: "#F0F3FA", height: 120, display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden" }}>
        {/* Decorative map grid */}
        <svg width="100%" height="120" style={{ position: "absolute", inset: 0 }}>
          <defs>
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#E4E8F0" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
          <circle cx="50%" cy="60" r="8" fill="#000" opacity="0.1"/>
          <circle cx="50%" cy="60" r="4" fill="#000" opacity="0.5"/>
          <line x1="50%" y1="30" x2="50%" y2="52" stroke="#000" strokeWidth="1.5" strokeDasharray="3,3" opacity="0.4"/>
        </svg>
        <div style={{ position: "relative", textAlign: "center" }}>
          <div style={{ background: "#000", color: "#fff", borderRadius: "50%", width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 6px" }}>
            <IPin s={16} />
          </div>
        </div>
      </div>
      <div style={{ padding: "14px 16px" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
          <div>
            <p style={{ fontSize: 10, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.1em", color: "#B0B8C9", marginBottom: 4 }}>Location</p>
            <p style={{ fontSize: 13, fontWeight: 700, color: "#000" }}>{complaint.location}</p>
            <p style={{ fontSize: 11, color: "#8892A4", marginTop: 2 }}>{complaint.ward} · PIN {complaint.pincode}</p>
          </div>
          <button style={{ background: "#F0F3FA", border: "1.5px solid #E4E8F0", borderRadius: 10, padding: "7px 12px", fontSize: 11, fontWeight: 700, cursor: "pointer", color: "#000", display: "flex", alignItems: "center", gap: 5, whiteSpace: "nowrap" }}>
            <IMap s={12} /> View Map
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Upvote Button ──────────────────────────────────────────────────────────────
function UpvoteSection({ upvotes }) {
  const [voted, setVoted] = useState(false);
  const [count, setCount] = useState(upvotes);
  const toggle = () => { setVoted(v => !v); setCount(c => voted ? c - 1 : c + 1); };
  return (
    <div className="det-card p-4" style={{ display: "flex", alignItems: "center", gap: 14 }}>
      <button onClick={toggle} style={{ background: voted ? "#000" : "#F0F3FA", border: "1.5px solid #E4E8F0", borderRadius: 14, padding: "10px 18px", display: "flex", alignItems: "center", gap: 8, cursor: "pointer", transition: "all 0.15s", color: voted ? "#fff" : "#000" }}>
        <IThumb s={15} />
        <span style={{ fontWeight: 900, fontSize: 13 }}>{voted ? "Upvoted" : "Upvote"}</span>
      </button>
      <div>
        <p style={{ fontWeight: 900, fontSize: 20, color: "#000", fontFamily: "'DM Serif Display', serif", lineHeight: 1 }}>{count}</p>
        <p style={{ fontSize: 11, color: "#8892A4", marginTop: 2 }}>community members upvoted this issue</p>
      </div>
    </div>
  );
}

// ── Rating Section ─────────────────────────────────────────────────────────────
function RatingSection({ complaint }) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  if (complaint.status !== "Resolved") return null;
  return (
    <div className="det-card p-5">
      <p className="sec-label">Rate the Resolution</p>
      {submitted ? (
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 36, height: 36, background: "#E6F7F1", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", color: "#1A7F5A" }}><ITick /></div>
          <p style={{ fontWeight: 700, fontSize: 13, color: "#1A7F5A" }}>Thank you for your feedback!</p>
        </div>
      ) : (
        <>
          <p style={{ fontSize: 12, color: "#8892A4", marginBottom: 14 }}>How satisfied are you with how this complaint was handled?</p>
          <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
            {[1, 2, 3, 4, 5].map(i => (
              <button key={i} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(0)} onClick={() => setRating(i)} style={{ background: "none", border: "none", cursor: "pointer", color: (hover || rating) >= i ? "#F59E0B" : "#E4E8F0", transition: "color 0.1s" }}>
                <IStar s={28} />
              </button>
            ))}
          </div>
          <button onClick={() => rating && setSubmitted(true)} style={{ background: rating ? "#000" : "#F0F3FA", border: "none", borderRadius: 12, padding: "10px 20px", fontSize: 13, fontWeight: 700, cursor: rating ? "pointer" : "default", color: rating ? "#fff" : "#C4C9D4", transition: "all 0.15s" }}>
            Submit Rating
          </button>
        </>
      )}
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function ComplaintDetail() {
  const complaint = DEFAULT;
  const [showShare, setShowShare] = useState(false);
  const [showPhoto, setShowPhoto] = useState(false);
  const [photos, setPhotos] = useState([]);

  const st = STATUS_CONFIG[complaint.status];
  const sv = SEVERITY_CONFIG[complaint.severity];

  const STEPS = ["Filed", "Acknowledged", "Assigned", "In Progress", "Resolved"];
  const STEP_INDEX = { Pending: 0, Assigned: 2, "In Progress": 3, Resolved: 4 };
  const currentStep = STEP_INDEX[complaint.status] ?? 0;

  const UPDATES = Array.from({ length: complaint.updates || 0 }, (_, i) => {
    const daysBack = (complaint.updates - 1 - i) * 2;
    const date = new Date(new Date(complaint.updatedAt).getTime() - daysBack * 86400000);
    return { date, msg: UPDATE_MESSAGES[i] || "Status updated by department", by: UPDATE_BY[i] || "Department" };
  });

  return (
    <div className="min-h-screen" style={{ background: "#F7F6F2", fontFamily: "'Instrument Sans', sans-serif" }}>
      <div className="fixed inset-0 pointer-events-none z-0" style={{ backgroundImage: `linear-gradient(rgba(0,0,0,0.032) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.032) 1px, transparent 1px)`, backgroundSize: "48px 48px" }} />

      {showShare && <ShareModal complaint={complaint} onClose={() => setShowShare(false)} />}
      {showPhoto && <PhotoModal onClose={() => setShowPhoto(false)} photos={photos} setPhotos={setPhotos} />}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Instrument+Sans:wght@400;500;600;700;800;900&display=swap');
        .det-card { background: white; border: 1.5px solid #E4E8F0; border-radius: 20px; }
        .ev-card  { background: white; border: 1.5px solid #E4E8F0; border-radius: 20px; }
        .tl-done   { background: #000; box-shadow: 0 0 0 3px rgba(0,0,0,0.08); }
        .tl-active { background: white; border: 2.5px solid #000; box-shadow: 0 0 0 4px rgba(0,0,0,0.08); }
        .tl-pend   { background: white; border: 2px solid #E4E8F0; }
        .ev-chip      { font-size: 11px; padding: 4px 10px; border-radius: 8px; font-weight: 600; background: #F0F3FA; color: #4A5568; }
        .ev-chip-warn { font-size: 11px; padding: 4px 10px; border-radius: 8px; font-weight: 600; background: #FEF3C7; color: #B45309; }
        .meta-row { display: flex; align-items: flex-start; gap: 12px; padding: 11px 0; border-bottom: 1px solid #F0F3FA; }
        .meta-row:last-child { border-bottom: none; padding-bottom: 0; }
        .meta-row:first-child { padding-top: 0; }
        .meta-icon { width: 32px; height: 32px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; background: #F0F3FA; color: #6B7280; }
        .sec-label { font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.18em; color: #8892A4; margin-bottom: 16px; }
        .back-btn { background: white; border: 1.5px solid #E4E8F0; color: #000; border-radius: 12px; width: 38px; height: 38px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.15s; flex-shrink: 0; }
        .back-btn:hover { background: #000; color: white; border-color: #000; }
        .act-btn-ghost { background: white; border: 1.5px solid #E4E8F0; color: #000; padding: 9px 16px; border-radius: 12px; font-size: 12px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 6px; font-family: inherit; transition: all 0.12s; }
        .act-btn-ghost:hover { background: #F7F9FC; border-color: #000; }
        .act-btn-solid { background: #000; color: white; padding: 9px 16px; border-radius: 12px; font-size: 12px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 6px; border: none; font-family: inherit; transition: all 0.15s; }
        .act-btn-solid:hover { background: #222; }
        .topbar { position: sticky; top: 0; z-index: 40; background: rgba(247,246,242,0.92); backdrop-filter: blur(12px); border-bottom: 1px solid rgba(0,0,0,0.07); }
        .status-banner { padding: 6px 14px; border-radius: 100px; font-size: 11px; font-weight: 800; display: inline-flex; align-items: center; gap: 6px; letter-spacing: 0.02em; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .fu  { animation: fadeUp 0.35s ease both; }
        .fu1 { animation: fadeUp 0.35s 0.07s ease both; }
        .fu2 { animation: fadeUp 0.35s 0.14s ease both; }
        .fu3 { animation: fadeUp 0.35s 0.21s ease both; }
        .fu4 { animation: fadeUp 0.35s 0.28s ease both; }
        .fu5 { animation: fadeUp 0.35s 0.35s ease both; }
        .id-pill { font-family: 'SFMono-Regular', 'Consolas', monospace; font-size: 11px; color: #8892A4; background: #F0F3FA; padding: 3px 10px; border-radius: 6px; display: inline-block; }
        .prog-track { height: 4px; background: #F0F3FA; border-radius: 4px; overflow: hidden; margin-top: 10px; }
        .prog-fill  { height: 100%; background: #000; border-radius: 4px; transition: width 0.8s cubic-bezier(0.22,1,0.36,1); }
        .photo-thumb { border-radius: 10px; overflow: hidden; height: 70px; border: 1.5px solid #E4E8F0; background: #F0F3FA; display: flex; align-items: center; justify-content: center; }
        @media (max-width: 640px) { .two-col { grid-template-columns: 1fr !important; } }
      `}</style>

      {/* Top bar */}
      <div className="topbar">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-3">
          <button className="back-btn" onClick={() => window.history.back()}><IChevL /></button>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-black truncate" style={{ color: "#000" }}>{complaint.title}</p>
            <span className="id-pill">{complaint.id}</span>
          </div>
          <div className="status-banner shrink-0" style={{ background: st.bg, color: st.color }}>
            <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: st.dot }} />
            {complaint.status}
          </div>
        </div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-6 space-y-4">

        {/* Hero card */}
        <div className="det-card p-6 fu">
          {complaint.status === "Resolved" && (
            <div className="flex items-center gap-2 mb-4 pb-4" style={{ borderBottom: "1.5px solid #E6F7F1" }}>
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "#E6F7F1", color: "#1A7F5A" }}><ITick /></div>
              <p className="text-xs font-black" style={{ color: "#1A7F5A" }}>This complaint has been resolved.</p>
            </div>
          )}
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0" style={{ background: "#F0F3FA" }}>
              {CAT_ICON[complaint.category] || "📋"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-black uppercase tracking-wider mb-1" style={{ color: "#8892A4" }}>{complaint.category}</p>
              <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: "clamp(20px,4vw,28px)", fontWeight: 400, color: "#000", letterSpacing: "-0.02em", lineHeight: 1.2 }}>
                {complaint.title}
              </h1>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mt-4">
            <span className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg font-semibold" style={{ background: "#F0F3FA", color: "#4A5568" }}><IBuilding s={12} /> {complaint.dept}</span>
            <span className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg font-semibold" style={{ background: "#F0F3FA", color: "#4A5568" }}><IPin s={12} /> {complaint.location}</span>
            <span className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg font-semibold" style={{ background: "#F0F3FA", color: "#4A5568" }}><IClock s={12} /> Filed {fmtDate(complaint.createdAt)}</span>
            {(complaint.severity === "Severe" || complaint.severity === "Critical") && (
              <span className="text-xs px-2.5 py-1 rounded-lg font-bold" style={{ background: sv.bg, color: sv.color }}>{complaint.severity}</span>
            )}
            <span className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg font-semibold" style={{ background: "#F0F3FA", color: "#4A5568" }}><ITag s={12} /> {complaint.complaintType}</span>
          </div>

          {complaint.description && (
            <div className="mt-4 pt-4" style={{ borderTop: "1.5px solid #F0F3FA" }}>
              <p className="text-[10px] font-black uppercase tracking-wider mb-2" style={{ color: "#8892A4" }}>Description</p>
              <p className="text-sm leading-relaxed" style={{ color: "#4A5568" }}>{complaint.description}</p>
            </div>
          )}

          {/* Attached photos preview */}
          {photos.length > 0 && (
            <div className="mt-4 pt-4" style={{ borderTop: "1.5px solid #F0F3FA" }}>
              <p className="text-[10px] font-black uppercase tracking-wider mb-2" style={{ color: "#8892A4" }}>Attached Photos ({photos.length})</p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
                {photos.map((p, i) => (
                  <div key={i} style={{ borderRadius: 10, overflow: "hidden", aspectRatio: "1", border: "1.5px solid #E4E8F0" }}>
                    <img src={p.url} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action bar */}
          <div className="flex items-center gap-2 mt-5 pt-4 flex-wrap" style={{ borderTop: "1.5px solid #F0F3FA" }}>
            <button className="act-btn-ghost" onClick={() => setShowShare(true)}><IShare s={14} /> Share</button>
            <button className="act-btn-ghost" onClick={() => setShowPhoto(true)}>
              <ICamera s={14} /> Add Photo {photos.length > 0 && <span style={{ background: "#000", color: "#fff", borderRadius: "50%", width: 18, height: 18, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 900 }}>{photos.length}</span>}
            </button>
            <button className="act-btn-ghost" onClick={() => downloadPDF(complaint)}><IFile s={14} /> Download</button>
            {complaint.status === "Pending" && (
              <button className="act-btn-solid ml-auto"><IAlert s={14} /> Escalate</button>
            )}
          </div>
        </div>

        {/* Stats strip */}
        <div className="fu1">
          <StatsStrip complaint={complaint} />
        </div>

        {/* Two-col: Progress + Meta */}
        <div className="grid gap-4 fu2 two-col" style={{ gridTemplateColumns: "1fr 1fr" }}>
          {/* Progress */}
          <div className="det-card p-5">
            <p className="sec-label">Progress Tracker</p>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold" style={{ color: "#8892A4" }}>Overall</span>
              <span className="text-xs font-black" style={{ color: "#000" }}>{Math.round((currentStep / (STEPS.length - 1)) * 100)}%</span>
            </div>
            <div className="prog-track mb-5">
              <div className="prog-fill" style={{ width: `${(currentStep / (STEPS.length - 1)) * 100}%` }} />
            </div>
            <div className="space-y-0">
              {STEPS.map((step, i) => {
                const done = i < currentStep;
                const active = i === currentStep;
                return (
                  <div key={step} className="flex items-center gap-3 py-2.5" style={{ borderBottom: i < STEPS.length - 1 ? "1px dashed #F0F3FA" : "none" }}>
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${done ? "tl-done" : active ? "tl-active" : "tl-pend"}`}>
                      {done ? <ICheck s={12} stroke="white" /> : active ? <span className="w-2 h-2 rounded-full" style={{ background: "#000" }} /> : <span className="w-2 h-2 rounded-full" style={{ background: "#D1D9E6" }} />}
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-bold" style={{ color: done || active ? "#000" : "#C4C9D4" }}>{step}</p>
                      {active && <p className="text-[10px] mt-0.5" style={{ color: "#8892A4" }}>{st.label}</p>}
                    </div>
                    {done && <ICheck s={14} stroke="#10B981" />}
                    {active && <span className="text-[10px] font-black px-2 py-0.5 rounded-full" style={{ background: st.bg, color: st.color }}>Now</span>}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Meta details */}
          <div className="det-card p-5">
            <p className="sec-label">Complaint Details</p>
            {[
              { icon: <IHash />, label: "Complaint ID", val: complaint.id, mono: true },
              { icon: <IBuilding s={14} />, label: "Department", val: complaint.dept },
              { icon: <IPin s={14} />, label: "Location", val: complaint.location },
              { icon: <IMap s={14} />, label: "Ward / PIN", val: `${complaint.ward} · ${complaint.pincode}` },
              { icon: <IClock s={14} />, label: "Date Filed", val: fmtDate(complaint.createdAt) },
              { icon: <IClock s={14} />, label: "Last Updated", val: relDate(complaint.updatedAt) },
              { icon: <IUser s={14} />, label: "Filed By", val: "Arjun Mehta" },
              { icon: <ICalendar s={14} />, label: "Est. Resolution", val: fmtDate(complaint.expectedResolution) },
            ].map(({ icon, label, val, mono }) => (
              <div key={label} className="meta-row">
                <div className="meta-icon">{icon}</div>
                <div className="min-w-0">
                  <p className="text-[9px] font-black uppercase tracking-wider" style={{ color: "#B0B8C9" }}>{label}</p>
                  <p className="text-xs font-semibold mt-0.5 break-all" style={{ color: "#000", fontFamily: mono ? "monospace" : "inherit", fontSize: mono ? 10 : 12 }}>{val}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Evidence */}
        <div className="fu3"><EvidenceBadge score={complaint.evidenceScore} /></div>

        {/* Assigned officer */}
        <div className="fu3"><OfficerCard complaint={complaint} /></div>

        {/* Location card */}
        <div className="fu3"><LocationCard complaint={complaint} /></div>

        {/* Upvote */}
        <div className="fu4"><UpvoteSection upvotes={complaint.upvotes} /></div>

        {/* Activity timeline */}
        {UPDATES.length > 0 && (
          <div className="det-card p-5 fu4">
            <div className="flex items-center justify-between mb-5">
              <p className="sec-label" style={{ marginBottom: 0 }}>Activity Timeline</p>
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full" style={{ background: "#F0F3FA", color: "#6B7280" }}>{UPDATES.length} update{UPDATES.length !== 1 ? "s" : ""}</span>
            </div>
            <div className="space-y-0">
              {UPDATES.map((u, i) => (
                <TimelineStep key={i} label={UPDATE_MESSAGES[i] || "Status updated"} date={u.date} by={u.by}
                  done={i < UPDATES.length - 1 || complaint.status === "Resolved"}
                  active={i === UPDATES.length - 1 && complaint.status !== "Resolved"}
                  last={i === UPDATES.length - 1}
                />
              ))}
            </div>
          </div>
        )}

        {UPDATES.length === 0 && (
          <div className="det-card p-6 text-center fu4">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3" style={{ background: "#F0F3FA", color: "#C4C9D4" }}><IClock s={22} /></div>
            <p className="text-sm font-black" style={{ color: "#000" }}>No updates yet</p>
            <p className="text-xs mt-1" style={{ color: "#8892A4" }}>Department activity will appear here once the complaint is reviewed.</p>
          </div>
        )}

        {/* Rating (resolved only) */}
        <div className="fu5"><RatingSection complaint={complaint} /></div>

        {/* Pending alert */}
        {complaint.status === "Pending" && (
          <div className="det-card p-4 flex items-start gap-3 fu5" style={{ background: "#FFFBEB", borderColor: "#FDE68A" }}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: "#FEF3C7", color: "#B45309" }}><IAlert /></div>
            <div>
              <p className="text-sm font-black" style={{ color: "#000" }}>Awaiting acknowledgement</p>
              <p className="text-xs mt-0.5 leading-relaxed" style={{ color: "#8892A4" }}>Your complaint is in the review queue. Departments typically respond within 48 hours. You'll be notified when the status changes.</p>
            </div>
          </div>
        )}

        {/* Help footer */}
        <div className="det-card p-5 flex items-center gap-4 fu5">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: "#000", color: "white" }}><IUser s={17} /></div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-black" style={{ color: "#000" }}>Need help with this complaint?</p>
            <p className="text-xs mt-0.5" style={{ color: "#8892A4" }}>Contact the grievance helpline at 1800-XXX-XXXX or visit your ward office.</p>
          </div>
          <a href="tel:8777838839" className="act-btn-solid shrink-0" style={{ whiteSpace: "nowrap", textDecoration: "none" }}>
            <IPhone s={13} /> Contact
          </a>
        </div>

        <div className="h-8" />
      </div>
      <Footer/>
    </div>
  );
}