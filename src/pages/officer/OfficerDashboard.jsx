import { useState, useEffect, useCallback } from "react";

/* ── Data ── */
const DEPARTMENTS = ["Roads", "Lights", "Water", "Sanitation", "Noise", "Potholes", "Drainage", "Electricity"];
const WARDS = ["Ward 4", "Ward 7", "Ward 12", "Ward 19", "Ward 23", "Ward 31", "Ward 8", "Ward 15"];
const OFFICERS = ["Rajan Mehta", "Priya Nair", "Suresh Iyer", "Kavita Sharma", "Deepak Rao"];

const SLA_LIMITS = { HIGH: 4, MEDIUM: 24, LOW: 72 }; // hours

const SEED_COMPLAINTS = [
  { id: "NIV-00101", title: "Broken streetlight near bus stand", dept: "Lights", ward: "Ward 7", urgency: "HIGH", status: "OPEN", hoursAgo: 3, assignee: null, evidence: ["photo_1.jpg"], location: { lat: 19.076, lng: 72.877 }, description: "The streetlight at the junction of MG Road and Bus Stand has been non-functional for 3 days. Creates safety hazard at night.", upvotes: 14 },
  { id: "NIV-00102", title: "Pothole on main road junction", dept: "Potholes", ward: "Ward 12", urgency: "HIGH", status: "ASSIGNED", hoursAgo: 6, assignee: "Rajan Mehta", evidence: ["photo_2.jpg", "video_1.mp4"], location: { lat: 19.082, lng: 72.881 }, description: "Large pothole approximately 2ft wide and 8 inches deep at the NH-48 junction causing accidents.", upvotes: 31 },
  { id: "NIV-00103", title: "Overflowing drain on colony road", dept: "Drainage", ward: "Ward 4", urgency: "MEDIUM", status: "IN_PROGRESS", hoursAgo: 18, assignee: "Priya Nair", evidence: ["photo_3.jpg"], location: { lat: 19.071, lng: 72.869 }, description: "Drain has been overflowing since last rain. Stagnant water breeding mosquitoes.", upvotes: 9 },
  { id: "NIV-00104", title: "Water supply cut since 2 days", dept: "Water", ward: "Ward 19", urgency: "HIGH", status: "OPEN", hoursAgo: 48, assignee: null, evidence: [], location: { lat: 19.091, lng: 72.862 }, description: "Entire sector B has no water supply. Residents are severely affected. No prior notice was given.", upvotes: 52 },
  { id: "NIV-00105", title: "Garbage not collected this week", dept: "Sanitation", ward: "Ward 23", urgency: "MEDIUM", status: "OPEN", hoursAgo: 30, assignee: null, evidence: ["photo_4.jpg"], location: { lat: 19.065, lng: 72.891 }, description: "Municipal garbage truck has skipped this colony for 6 days. Waste is piling up causing health concerns.", upvotes: 22 },
  { id: "NIV-00106", title: "Noise from construction at night", dept: "Noise", ward: "Ward 31", urgency: "LOW", status: "ASSIGNED", hoursAgo: 55, assignee: "Suresh Iyer", evidence: [], location: { lat: 19.088, lng: 72.873 }, description: "Construction work continues past 10 PM violating noise ordinance. Building site near residential area.", upvotes: 7 },
  { id: "NIV-00107", title: "Damaged footpath near school", dept: "Roads", ward: "Ward 8", urgency: "MEDIUM", status: "IN_PROGRESS", hoursAgo: 20, assignee: "Kavita Sharma", evidence: ["photo_5.jpg", "photo_6.jpg"], location: { lat: 19.078, lng: 72.858 }, description: "Footpath tiles are broken and uneven near St. Mary's School. Children are tripping and falling.", upvotes: 18 },
  { id: "NIV-00108", title: "Open manhole on service lane", dept: "Drainage", ward: "Ward 15", urgency: "HIGH", status: "OPEN", hoursAgo: 2, assignee: null, evidence: ["photo_7.jpg"], location: { lat: 19.074, lng: 72.884 }, description: "Manhole cover is completely missing on service lane behind market. Immediate safety hazard.", upvotes: 41 },
  { id: "NIV-00109", title: "Electricity outage in sector B", dept: "Electricity", ward: "Ward 4", urgency: "HIGH", status: "RESOLVED", hoursAgo: 70, assignee: "Deepak Rao", evidence: [], location: { lat: 19.069, lng: 72.871 }, description: "Power outage affecting 200+ households since last 3 days.", upvotes: 63 },
  { id: "NIV-00110", title: "Sewage overflow near market", dept: "Sanitation", ward: "Ward 7", urgency: "HIGH", status: "OPEN", hoursAgo: 8, assignee: null, evidence: ["photo_8.jpg", "photo_9.jpg"], location: { lat: 19.080, lng: 72.875 }, description: "Sewage line burst near central market. Raw sewage flowing onto the main road.", upvotes: 38 },
];

const URGENCY_META = {
  HIGH:   { color: "#EF4444", bg: "rgba(239,68,68,0.10)", border: "rgba(239,68,68,0.25)", dot: "#EF4444" },
  MEDIUM: { color: "#F59E0B", bg: "rgba(245,158,11,0.10)", border: "rgba(245,158,11,0.25)", dot: "#F59E0B" },
  LOW:    { color: "#6B7280", bg: "rgba(107,114,128,0.10)", border: "rgba(107,114,128,0.2)", dot: "#9CA3AF" },
};
const STATUS_META = {
  OPEN:        { label: "Open",        color: "#EF4444", bg: "rgba(239,68,68,0.08)" },
  ASSIGNED:    { label: "Assigned",    color: "#F59E0B", bg: "rgba(245,158,11,0.08)" },
  IN_PROGRESS: { label: "In Progress", color: "#3B82F6", bg: "rgba(59,130,246,0.08)" },
  RESOLVED:    { label: "Resolved",    color: "#10B981", bg: "rgba(16,185,129,0.08)" },
};

function slaPercent(c) {
  const limit = SLA_LIMITS[c.urgency];
  return Math.min((c.hoursAgo / limit) * 100, 100);
}
function slaColor(p) {
  if (p >= 90) return "#EF4444";
  if (p >= 60) return "#F59E0B";
  return "#10B981";
}
function slaLabel(c) {
  const limit = SLA_LIMITS[c.urgency];
  const rem = limit - c.hoursAgo;
  if (rem <= 0) return "BREACHED";
  if (rem < 2) return `${rem}h left`;
  return `${rem}h left`;
}

/* ── Heatmap ── */
function Heatmap({ complaints }) {
  const cells = [];
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 10; c++) {
      const hits = complaints.filter(comp => {
        const latBucket = Math.floor((comp.location.lat - 19.060) / 0.004);
        const lngBucket = Math.floor((comp.location.lng - 72.855) / 0.004);
        return latBucket === r && lngBucket === c;
      }).length;
      cells.push({ r, c, hits });
    }
  }
  const max = Math.max(...cells.map(x => x.hits), 1);

  return (
    <div style={{ width: "100%", aspectRatio: "10/8", display: "grid", gridTemplateColumns: "repeat(10, 1fr)", gap: 3, borderRadius: 10, overflow: "hidden" }}>
      {cells.map(({ r, c, hits }) => {
        const intensity = hits / max;
        const alpha = hits === 0 ? 0.04 : 0.12 + intensity * 0.78;
        const bg = hits === 0
          ? "rgba(0,0,0,0.04)"
          : `rgba(239,68,68,${alpha})`;
        return (
          <div
            key={`${r}-${c}`}
            title={hits > 0 ? `${hits} complaint${hits > 1 ? "s" : ""}` : ""}
            style={{
              background: bg,
              borderRadius: 4,
              position: "relative",
              transition: "transform 0.15s ease",
              cursor: hits > 0 ? "pointer" : "default",
            }}
          >
            {hits > 1 && (
              <span style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 8, fontWeight: 700, color: intensity > 0.5 ? "#fff" : "#EF4444", fontFamily: "monospace" }}>
                {hits}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ── SLA Bar ── */
function SLABar({ complaint }) {
  const pct = slaPercent(complaint);
  const col = slaColor(pct);
  const label = slaLabel(complaint);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{ flex: 1, height: 4, background: "rgba(0,0,0,0.07)", borderRadius: 99, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${pct}%`, background: col, borderRadius: 99, transition: "width 0.4s ease" }} />
      </div>
      <span style={{ fontSize: 9, fontWeight: 700, color: col, letterSpacing: "0.08em", minWidth: 54, textAlign: "right" }}>
        {label === "BREACHED" ? (
          <span style={{ background: "rgba(239,68,68,0.12)", padding: "1px 5px", borderRadius: 3 }}>BREACHED</span>
        ) : label}
      </span>
    </div>
  );
}

/* ── Complaint Row ── */
function ComplaintRow({ c, onClick }) {
  const u = URGENCY_META[c.urgency];
  const s = STATUS_META[c.status];
  return (
    <div
      onClick={() => onClick(c)}
      style={{
        display: "grid",
        gridTemplateColumns: "80px 1fr 90px 80px 80px 120px 28px",
        alignItems: "center",
        gap: "0 12px",
        padding: "12px 16px",
        borderBottom: "1px solid rgba(0,0,0,0.05)",
        cursor: "pointer",
        transition: "background 0.15s ease",
        fontFamily: "'Instrument Sans', sans-serif",
      }}
      className="complaint-row"
    >
      {/* ID */}
      <span style={{ fontSize: 10, fontFamily: "monospace", color: "#666", fontWeight: 700 }}>{c.id}</span>

      {/* Title + dept */}
      <div>
        <p style={{ fontSize: 12, fontWeight: 600, color: "#111", lineHeight: 1.3, marginBottom: 2 }}>{c.title}</p>
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <span style={{ fontSize: 9, color: "#888", background: "rgba(0,0,0,0.05)", padding: "1px 6px", borderRadius: 4, fontWeight: 500 }}>{c.dept}</span>
          <span style={{ fontSize: 9, color: "#aaa" }}>{c.ward}</span>
        </div>
      </div>

      {/* Urgency */}
      <div style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 8px", borderRadius: 5, background: u.bg, border: `1px solid ${u.border}`, width: "fit-content" }}>
        <div style={{ width: 5, height: 5, borderRadius: "50%", background: u.dot, flexShrink: 0 }} />
        <span style={{ fontSize: 9, fontWeight: 700, color: u.color, letterSpacing: "0.1em" }}>{c.urgency}</span>
      </div>

      {/* Status */}
      <div style={{ display: "inline-flex", alignItems: "center", padding: "3px 8px", borderRadius: 5, background: s.bg, width: "fit-content" }}>
        <span style={{ fontSize: 9, fontWeight: 700, color: s.color, letterSpacing: "0.08em" }}>{s.label}</span>
      </div>

      {/* Assignee */}
      <span style={{ fontSize: 10, color: c.assignee ? "#555" : "#ccc", fontWeight: c.assignee ? 500 : 400 }}>
        {c.assignee ? c.assignee.split(" ")[0] : "—"}
      </span>

      {/* SLA */}
      <SLABar complaint={c} />

      {/* Arrow */}
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 18l6-6-6-6" />
      </svg>
    </div>
  );
}

/* ── Detail Page ── */
function ComplaintDetail({ complaint, onBack, onUpdate }) {
  const [assignee, setAssignee] = useState(complaint.assignee || "");
  const [status, setStatus] = useState(complaint.status);
  const [note, setNote] = useState("");
  const [saved, setSaved] = useState(false);
  const u = URGENCY_META[complaint.urgency];
  const s = STATUS_META[status];
  const pct = slaPercent({ ...complaint, status });

  function handleSave() {
    onUpdate({ ...complaint, assignee: assignee || null, status });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div style={{ fontFamily: "'Instrument Sans', sans-serif", minHeight: "100vh", background: "#F7F6F2" }}>
      {/* Header */}
      <div style={{ background: "#fff", borderBottom: "1px solid rgba(0,0,0,0.08)", padding: "14px 32px", display: "flex", alignItems: "center", gap: 14 }}>
        <button
          onClick={onBack}
          style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#666", background: "none", border: "1px solid rgba(0,0,0,0.1)", borderRadius: 8, padding: "6px 12px", cursor: "pointer", fontFamily: "inherit", fontWeight: 500 }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
          Back
        </button>
        <div style={{ width: 1, height: 20, background: "rgba(0,0,0,0.08)" }} />
        <span style={{ fontSize: 11, fontFamily: "monospace", color: "#888", fontWeight: 700 }}>{complaint.id}</span>
        <div style={{ marginLeft: "auto", display: "flex", gap: 8, alignItems: "center" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 10px", borderRadius: 6, background: u.bg, border: `1px solid ${u.border}` }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: u.dot }} />
            <span style={{ fontSize: 10, fontWeight: 700, color: u.color, letterSpacing: "0.1em" }}>{complaint.urgency} PRIORITY</span>
          </div>
          <div style={{ display: "inline-flex", alignItems: "center", padding: "4px 10px", borderRadius: 6, background: s.bg }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: s.color, letterSpacing: "0.08em" }}>{s.label}</span>
          </div>
        </div>
      </div>

      {/* Body */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 32px", display: "grid", gridTemplateColumns: "1fr 320px", gap: 24 }}>
        {/* Left col */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Complaint card */}
          <div style={{ background: "#fff", borderRadius: 14, border: "0.5px solid rgba(0,0,0,0.08)", padding: "24px 28px", boxShadow: "0 2px 16px rgba(0,0,0,0.05)" }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 }}>
              <div>
                <h2 style={{ fontSize: 20, fontWeight: 700, color: "#111", lineHeight: 1.25, marginBottom: 6 }}>{complaint.title}</h2>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <span style={{ fontSize: 10, color: "#888", background: "rgba(0,0,0,0.05)", padding: "2px 8px", borderRadius: 5, fontWeight: 500 }}>{complaint.dept}</span>
                  <span style={{ fontSize: 10, color: "#888" }}>{complaint.ward}</span>
                  <span style={{ fontSize: 10, color: "#bbb" }}>·</span>
                  <span style={{ fontSize: 10, color: "#aaa" }}>{complaint.hoursAgo}h ago</span>
                  <span style={{ fontSize: 10, color: "#bbb" }}>·</span>
                  <span style={{ fontSize: 10, color: "#888" }}>↑ {complaint.upvotes} upvotes</span>
                </div>
              </div>
            </div>
            <p style={{ fontSize: 13, color: "#444", lineHeight: 1.7, background: "rgba(0,0,0,0.02)", padding: "14px 16px", borderRadius: 8, borderLeft: "3px solid rgba(0,0,0,0.08)" }}>
              {complaint.description}
            </p>
          </div>

          {/* SLA panel */}
          <div style={{ background: "#fff", borderRadius: 14, border: "0.5px solid rgba(0,0,0,0.08)", padding: "20px 24px", boxShadow: "0 2px 16px rgba(0,0,0,0.05)" }}>
            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.16em", color: "#aaa", textTransform: "uppercase", marginBottom: 14 }}>SLA Status</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 16 }}>
              {[
                { label: "Time Elapsed", val: `${complaint.hoursAgo}h` },
                { label: "SLA Limit", val: `${SLA_LIMITS[complaint.urgency]}h` },
                { label: "Remaining", val: slaLabel(complaint) },
              ].map(({ label, val }) => (
                <div key={label} style={{ background: "rgba(0,0,0,0.02)", borderRadius: 8, padding: "10px 14px" }}>
                  <p style={{ fontSize: 9, color: "#bbb", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 4 }}>{label}</p>
                  <p style={{ fontSize: 18, fontWeight: 700, color: "#111", fontVariantNumeric: "tabular-nums" }}>{val}</p>
                </div>
              ))}
            </div>
            <div style={{ height: 8, background: "rgba(0,0,0,0.06)", borderRadius: 99, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${pct}%`, background: slaColor(pct), borderRadius: 99, transition: "width 0.4s ease" }} />
            </div>
            {pct >= 90 && (
              <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 7, padding: "8px 12px", background: "rgba(239,68,68,0.06)", borderRadius: 7, border: "1px solid rgba(239,68,68,0.15)" }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
                <span style={{ fontSize: 11, color: "#EF4444", fontWeight: 600 }}>
                  {pct === 100 ? "SLA breached — escalation required" : "SLA breach imminent — act now"}
                </span>
              </div>
            )}
          </div>

          {/* Evidence */}
          <div style={{ background: "#fff", borderRadius: 14, border: "0.5px solid rgba(0,0,0,0.08)", padding: "20px 24px", boxShadow: "0 2px 16px rgba(0,0,0,0.05)" }}>
            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.16em", color: "#aaa", textTransform: "uppercase", marginBottom: 14 }}>Evidence Attached</p>
            {complaint.evidence.length === 0 ? (
              <p style={{ fontSize: 12, color: "#ccc", fontStyle: "italic" }}>No evidence submitted.</p>
            ) : (
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                {complaint.evidence.map((ev) => {
                  const isVideo = ev.endsWith(".mp4");
                  return (
                    <div key={ev} style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(0,0,0,0.03)", border: "1px solid rgba(0,0,0,0.07)", borderRadius: 8, padding: "8px 12px" }}>
                      {isVideo ? (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polygon points="23 7 16 12 23 17 23 7" /><rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                        </svg>
                      ) : (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
                        </svg>
                      )}
                      <span style={{ fontSize: 11, color: "#555", fontFamily: "monospace" }}>{ev}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Routing Recommendation */}
          <div style={{ background: "#fff", borderRadius: 14, border: "0.5px solid rgba(0,0,0,0.08)", padding: "20px 24px", boxShadow: "0 2px 16px rgba(0,0,0,0.05)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
              <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.16em", color: "#aaa", textTransform: "uppercase" }}>Routing Recommendation</p>
              <span style={{ fontSize: 9, background: "rgba(59,130,246,0.08)", color: "#3B82F6", padding: "2px 7px", borderRadius: 4, fontWeight: 600, letterSpacing: "0.06em" }}>AUTO</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10 }}>
              {[
                { label: "Recommended Department", val: complaint.dept },
                { label: "Recommended Ward", val: complaint.ward },
                { label: "Suggested Officer", val: OFFICERS[Math.floor(complaint.id.slice(-2) / 25)] },
                { label: "Priority Level", val: complaint.urgency },
              ].map(({ label, val }) => (
                <div key={label} style={{ background: "rgba(59,130,246,0.03)", borderRadius: 8, padding: "10px 14px", border: "1px solid rgba(59,130,246,0.08)" }}>
                  <p style={{ fontSize: 9, color: "#aaa", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 3 }}>{label}</p>
                  <p style={{ fontSize: 13, fontWeight: 600, color: "#1e3a5f" }}>{val}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right col — action panel */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Actions */}
          <div style={{ background: "#fff", borderRadius: 14, border: "0.5px solid rgba(0,0,0,0.08)", padding: "20px 20px", boxShadow: "0 2px 16px rgba(0,0,0,0.05)" }}>
            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.16em", color: "#aaa", textTransform: "uppercase", marginBottom: 16 }}>Action Controls</p>

            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 10, color: "#888", letterSpacing: "0.1em", textTransform: "uppercase", display: "block", marginBottom: 6, fontWeight: 600 }}>Assign to Officer</label>
              <select
                value={assignee}
                onChange={e => setAssignee(e.target.value)}
                style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid rgba(0,0,0,0.12)", fontSize: 12, color: "#111", background: "#fafafa", fontFamily: "inherit", outline: "none", cursor: "pointer" }}
              >
                <option value="">— Unassigned —</option>
                {OFFICERS.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 10, color: "#888", letterSpacing: "0.1em", textTransform: "uppercase", display: "block", marginBottom: 6, fontWeight: 600 }}>Update Status</label>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {Object.entries(STATUS_META).map(([key, meta]) => (
                  <button
                    key={key}
                    onClick={() => setStatus(key)}
                    style={{
                      padding: "8px 12px",
                      borderRadius: 8,
                      border: status === key ? `1.5px solid ${meta.color}` : "1.5px solid rgba(0,0,0,0.08)",
                      background: status === key ? meta.bg : "transparent",
                      fontSize: 11,
                      fontWeight: 600,
                      color: status === key ? meta.color : "#888",
                      cursor: "pointer",
                      fontFamily: "inherit",
                      textAlign: "left",
                      transition: "all 0.15s ease",
                      display: "flex",
                      alignItems: "center",
                      gap: 7,
                    }}
                  >
                    <div style={{ width: 7, height: 7, borderRadius: "50%", background: status === key ? meta.color : "#ddd", flexShrink: 0 }} />
                    {meta.label}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 10, color: "#888", letterSpacing: "0.1em", textTransform: "uppercase", display: "block", marginBottom: 6, fontWeight: 600 }}>Officer Note</label>
              <textarea
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder="Add an internal note..."
                rows={3}
                style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid rgba(0,0,0,0.12)", fontSize: 12, color: "#111", background: "#fafafa", fontFamily: "inherit", resize: "vertical", outline: "none", boxSizing: "border-box" }}
              />
            </div>

            <button
              onClick={handleSave}
              style={{
                width: "100%",
                padding: "11px",
                borderRadius: 10,
                background: saved ? "#10B981" : "#111",
                color: "#fff",
                fontSize: 12,
                fontWeight: 700,
                border: "none",
                cursor: "pointer",
                fontFamily: "inherit",
                letterSpacing: "0.04em",
                transition: "background 0.25s ease",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 7,
              }}
            >
              {saved ? (
                <>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Saved
                </>
              ) : "Save Changes"}
            </button>
          </div>

          {/* Quick stats */}
          <div style={{ background: "#fff", borderRadius: 14, border: "0.5px solid rgba(0,0,0,0.08)", padding: "18px 20px", boxShadow: "0 2px 16px rgba(0,0,0,0.05)" }}>
            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.16em", color: "#aaa", textTransform: "uppercase", marginBottom: 14 }}>Complaint Stats</p>
            {[
              { label: "Upvotes", val: complaint.upvotes },
              { label: "Evidence files", val: complaint.evidence.length },
              { label: "Hours open", val: complaint.hoursAgo },
            ].map(({ label, val }) => (
              <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "7px 0", borderBottom: "1px solid rgba(0,0,0,0.05)" }}>
                <span style={{ fontSize: 11, color: "#888" }}>{label}</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: "#111", fontVariantNumeric: "tabular-nums" }}>{val}</span>
              </div>
            ))}
          </div>

          {/* Location */}
          <div style={{ background: "#fff", borderRadius: 14, border: "0.5px solid rgba(0,0,0,0.08)", padding: "18px 20px", boxShadow: "0 2px 16px rgba(0,0,0,0.05)" }}>
            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.16em", color: "#aaa", textTransform: "uppercase", marginBottom: 12 }}>Location</p>
            <div style={{ background: "rgba(0,0,0,0.03)", borderRadius: 8, padding: "12px", fontFamily: "monospace" }}>
              <p style={{ fontSize: 11, color: "#555" }}>Lat: {complaint.location.lat.toFixed(4)}</p>
              <p style={{ fontSize: 11, color: "#555" }}>Lng: {complaint.location.lng.toFixed(4)}</p>
              <p style={{ fontSize: 10, color: "#aaa", marginTop: 6 }}>{complaint.ward} · {complaint.dept}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Main Dashboard ── */
export default function OfficerDashboard() {
  const [complaints, setComplaints] = useState(SEED_COMPLAINTS);
  const [selected, setSelected] = useState(null);
  const [filterUrgency, setFilterUrgency] = useState("ALL");
  const [filterDept, setFilterDept] = useState("ALL");
  const [filterWard, setFilterWard] = useState("ALL");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("urgency");

  const filtered = complaints
    .filter(c => filterUrgency === "ALL" || c.urgency === filterUrgency)
    .filter(c => filterDept === "ALL" || c.dept === filterDept)
    .filter(c => filterWard === "ALL" || c.ward === filterWard)
    .filter(c => filterStatus === "ALL" || c.status === filterStatus)
    .filter(c => !search || c.title.toLowerCase().includes(search.toLowerCase()) || c.id.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sort === "urgency") {
        const order = { HIGH: 0, MEDIUM: 1, LOW: 2 };
        return order[a.urgency] - order[b.urgency];
      }
      if (sort === "sla") return slaPercent(b) - slaPercent(a);
      if (sort === "age") return b.hoursAgo - a.hoursAgo;
      return 0;
    });

  const slaBreaches = complaints.filter(c => slaPercent(c) >= 100 && c.status !== "RESOLVED").length;
  const slaWarnings = complaints.filter(c => { const p = slaPercent(c); return p >= 60 && p < 100 && c.status !== "RESOLVED"; }).length;
  const openCount = complaints.filter(c => c.status === "OPEN").length;
  const resolvedCount = complaints.filter(c => c.status === "RESOLVED").length;

  function handleUpdate(updated) {
    setComplaints(prev => prev.map(c => c.id === updated.id ? updated : c));
    setSelected(updated);
  }

  if (selected) {
    return <ComplaintDetail complaint={selected} onBack={() => setSelected(null)} onUpdate={handleUpdate} />;
  }

  return (
    <div style={{ minHeight: "100vh", background: "#F7F6F2", fontFamily: "'Instrument Sans', sans-serif" }}>
      {/* Top bar */}
      <div style={{ background: "#fff", borderBottom: "1px solid rgba(0,0,0,0.08)", padding: "0 32px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 56 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: "#111", letterSpacing: "-0.01em" }}>Officer Dashboard</span>
          <span style={{ width: 1, height: 16, background: "rgba(0,0,0,0.1)" }} />
          <span style={{ fontSize: 11, color: "#aaa", letterSpacing: "0.1em", textTransform: "uppercase" }}>Mumbai · Ward Control</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#EF4444", animation: "livePulse 1.4s ease infinite" }} />
          <span style={{ fontSize: 11, fontWeight: 600, color: "#EF4444", letterSpacing: "0.08em" }}>LIVE</span>
        </div>
      </div>

      <div style={{ maxWidth: 1180, margin: "0 auto", padding: "28px 32px", display: "flex", flexDirection: "column", gap: 24 }}>
        {/* Stat cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
          {[
            { label: "Open Complaints", val: openCount, color: "#EF4444", icon: "M12 2a10 10 0 100 20A10 10 0 0012 2zm0 5v5l3 3" },
            { label: "SLA Breaches", val: slaBreaches, color: "#EF4444", urgent: true, icon: "M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" },
            { label: "SLA Warnings", val: slaWarnings, color: "#F59E0B", icon: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" },
            { label: "Resolved Today", val: resolvedCount, color: "#10B981", icon: "M22 11.08V12a10 10 0 11-5.93-9.14M22 4L12 14.01l-3-3" },
          ].map(({ label, val, color, urgent, icon }) => (
            <div key={label} style={{ background: "#fff", borderRadius: 14, border: urgent && val > 0 ? `1px solid rgba(239,68,68,0.25)` : "0.5px solid rgba(0,0,0,0.08)", padding: "18px 20px", boxShadow: "0 2px 12px rgba(0,0,0,0.04)", display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: `${color}14`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d={icon} />
                </svg>
              </div>
              <div>
                <p style={{ fontSize: 22, fontWeight: 700, color: "#111", lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>{val}</p>
                <p style={{ fontSize: 10, color: "#aaa", textTransform: "uppercase", letterSpacing: "0.1em", marginTop: 3 }}>{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Middle row: filters + heatmap */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 260px", gap: 16 }}>
          {/* Filter panel */}
          <div style={{ background: "#fff", borderRadius: 14, border: "0.5px solid rgba(0,0,0,0.08)", padding: "18px 20px", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.16em", color: "#aaa", textTransform: "uppercase", marginBottom: 14 }}>Filters & Search</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr repeat(4, auto) auto", gap: 10, alignItems: "center" }}>
              {/* Search */}
              <div style={{ position: "relative" }}>
                <svg style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)" }} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                </svg>
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search complaints..."
                  style={{ width: "100%", paddingLeft: 30, paddingRight: 12, paddingTop: 8, paddingBottom: 8, borderRadius: 8, border: "1px solid rgba(0,0,0,0.1)", fontSize: 12, color: "#111", fontFamily: "inherit", outline: "none", background: "#fafafa", boxSizing: "border-box" }}
                />
              </div>

              {[
                { val: filterUrgency, set: setFilterUrgency, opts: ["ALL", "HIGH", "MEDIUM", "LOW"], label: "Urgency" },
                { val: filterDept, set: setFilterDept, opts: ["ALL", ...DEPARTMENTS], label: "Dept" },
                { val: filterWard, set: setFilterWard, opts: ["ALL", ...WARDS], label: "Ward" },
                { val: filterStatus, set: setFilterStatus, opts: ["ALL", "OPEN", "ASSIGNED", "IN_PROGRESS", "RESOLVED"], label: "Status" },
                { val: sort, set: setSort, opts: ["urgency", "sla", "age"], label: "Sort" },
              ].map(({ val, set, opts, label }) => (
                <select
                  key={label}
                  value={val}
                  onChange={e => set(e.target.value)}
                  style={{ padding: "8px 10px", borderRadius: 8, border: "1px solid rgba(0,0,0,0.1)", fontSize: 11, color: "#555", background: "#fafafa", fontFamily: "inherit", cursor: "pointer", outline: "none" }}
                >
                  {opts.map(o => <option key={o} value={o}>{o === "ALL" ? `All ${label}s` : o}</option>)}
                </select>
              ))}
            </div>
          </div>

          {/* Heatmap */}
          <div style={{ background: "#fff", borderRadius: 14, border: "0.5px solid rgba(0,0,0,0.08)", padding: "18px 20px", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.16em", color: "#aaa", textTransform: "uppercase" }}>Complaint Heatmap</p>
              <span style={{ fontSize: 9, color: "#ccc", fontFamily: "monospace" }}>Mumbai Grid</span>
            </div>
            <Heatmap complaints={complaints} />
            <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 4, marginTop: 8 }}>
              {[0.1, 0.3, 0.5, 0.7, 0.9].map(a => (
                <div key={a} style={{ width: 12, height: 8, borderRadius: 2, background: `rgba(239,68,68,${a})` }} />
              ))}
              <span style={{ fontSize: 8, color: "#ccc", marginLeft: 4 }}>density →</span>
            </div>
          </div>
        </div>

        {/* Queue */}
        <div style={{ background: "#fff", borderRadius: 14, border: "0.5px solid rgba(0,0,0,0.08)", boxShadow: "0 2px 12px rgba(0,0,0,0.04)", overflow: "hidden" }}>
          {/* Queue header */}
          <div style={{ padding: "16px 20px", borderBottom: "1px solid rgba(0,0,0,0.06)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.16em", color: "#aaa", textTransform: "uppercase" }}>Complaint Queue</p>
              <span style={{ fontSize: 11, fontWeight: 700, color: "#111", background: "rgba(0,0,0,0.06)", padding: "2px 8px", borderRadius: 5 }}>{filtered.length}</span>
            </div>
            {slaBreaches > 0 && (
              <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 11px", background: "rgba(239,68,68,0.07)", borderRadius: 8, border: "1px solid rgba(239,68,68,0.15)" }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#EF4444", animation: "livePulse 1.4s ease infinite" }} />
                <span style={{ fontSize: 10, fontWeight: 700, color: "#EF4444" }}>{slaBreaches} SLA BREACH{slaBreaches > 1 ? "ES" : ""}</span>
              </div>
            )}
          </div>

          {/* Column headers */}
          <div style={{ display: "grid", gridTemplateColumns: "80px 1fr 90px 80px 80px 120px 28px", gap: "0 12px", padding: "8px 16px", background: "rgba(0,0,0,0.02)", borderBottom: "1px solid rgba(0,0,0,0.05)" }}>
            {["ID", "Issue", "Urgency", "Status", "Assigned", "SLA", ""].map(h => (
              <span key={h} style={{ fontSize: 9, color: "#bbb", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase" }}>{h}</span>
            ))}
          </div>

          {/* Rows */}
          {filtered.length === 0 ? (
            <div style={{ padding: "40px", textAlign: "center", color: "#ccc", fontSize: 13 }}>No complaints match the current filters.</div>
          ) : (
            filtered.map(c => <ComplaintRow key={c.id} c={c} onClick={setSelected} />)
          )}
        </div>
      </div>

      <style>{`
        @keyframes livePulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(239,68,68,0.4); }
          50%       { box-shadow: 0 0 0 5px rgba(239,68,68,0); }
        }
        .complaint-row:hover {
          background: rgba(0,0,0,0.02) !important;
        }
      `}</style>
    </div>
  );
}