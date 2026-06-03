import { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";

// ─── Icons ───────────────────────────────────────────────────────────────────
const Icon = ({
  d,
  size = 16,
  stroke = "currentColor",
  sw = 2,
  fill = "none",
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill={fill}
    stroke={stroke}
    strokeWidth={sw}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {Array.isArray(d) ? (
      d.map((p, i) => <path key={i} d={p} />)
    ) : (
      <path d={d} />
    )}
  </svg>
);

const UploadIcon = () => (
  <Icon d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" />
);
const MapPinIcon = () => (
  <Icon
    d={[
      "M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z",
      "M12 10m-3 0a3 3 0 1 0 6 0a3 3 0 1 0-6 0",
    ]}
  />
);
const CheckIcon = () => <Icon d="M20 6L9 17l-5-5" sw={2.5} />;
const XIcon = () => <Icon d="M18 6L6 18M6 6l12 12" sw={2} />;
const FileTextIcon = () => (
  <Icon
    d={[
      "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z",
      "M14 2v6h6",
      "M16 13H8",
      "M16 17H8",
      "M10 9H8",
    ]}
  />
);
const CameraIcon = () => (
  <Icon
    d={[
      "M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z",
      "M12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
    ]}
  />
);
const VideoIcon = () => (
  <Icon
    d={[
      "M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42C1 8.14 1 11.75 1 11.75s0 3.61.46 5.33a2.78 2.78 0 0 0 1.95 1.96C5.12 19.5 12 19.5 12 19.5s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96C23 15.36 23 11.75 23 11.75s0-3.61-.46-5.33z",
      "M9.75 15.02l5.75-3.27-5.75-3.27v6.54z",
    ]}
  />
);
const AlertCircleIcon = () => (
  <Icon
    d={[
      "M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z",
      "M12 8v4",
      "M12 16h.01",
    ]}
  />
);
const BuildingIcon = () => (
  <Icon
    d={["M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z", "M9 22V12h6v10"]}
  />
);
const SparklesIcon = () => (
  <Icon
    d={[
      "M12 3l1.09 3.26L16.5 7.5l-3.41 1.24L12 12l-1.09-3.26L7.5 7.5l3.41-1.24L12 3z",
      "M19 14l.55 1.64L21 16l-1.45.36-.55 1.64-.55-1.64L17 16l1.45-.36L19 14z",
      "M5 14l.55 1.64L7 16l-1.45.36L5 18l-.55-1.64L3 16l1.45-.36L5 14z",
    ]}
  />
);
const ArrowRightIcon = () => <Icon d="M5 12h14M12 5l7 7-7 7" />;
const LocationIcon = () => (
  <Icon
    d={[
      "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z",
      "M12 11.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z",
    ]}
  />
);

// ─── Constants ───────────────────────────────────────────────────────────────
const CATEGORIES = [
  { id: "roads", label: "Roads & Infrastructure", dept: "PWD", icon: "🛣️" },
  { id: "water", label: "Water Supply", dept: "Jal Board", icon: "💧" },
  { id: "electricity", label: "Electricity", dept: "DISCOM", icon: "⚡" },
  {
    id: "sanitation",
    label: "Sanitation & Waste",
    dept: "Municipal Corp.",
    icon: "🗑️",
  },
  {
    id: "streetlight",
    label: "Street Lighting",
    dept: "PWD / DISCOM",
    icon: "💡",
  },
  { id: "drainage", label: "Drainage & Sewage", dept: "Jal Board", icon: "🌊" },
  {
    id: "encroachment",
    label: "Encroachment",
    dept: "Town Planning",
    icon: "🚧",
  },
  { id: "noise", label: "Noise Pollution", dept: "CPCB", icon: "🔊" },
  { id: "other", label: "Other", dept: "General Admin", icon: "📋" },
];

const PRIORITY_MAP = {
  roads: "High",
  water: "Critical",
  electricity: "High",
  sanitation: "Medium",
  streetlight: "Low",
  drainage: "Medium",
  encroachment: "Medium",
  noise: "Low",
  other: "Low",
};

const SEVERITY = ["Minor", "Moderate", "Severe", "Critical"];

function generateComplaintId() {
  const prefix = "NVR";
  const year = new Date().getFullYear().toString().slice(-2);
  const rand = Math.floor(100000 + Math.random() * 900000);
  return `${prefix}-${year}-${rand}`;
}

function calcEvidenceScore(files, hasLocation, description) {
  let score = 0;
  const breakdown = [];
  if (description.trim().length > 80) {
    score += 30;
    breakdown.push({ label: "Detailed description", pts: 30 });
  } else if (description.trim().length > 30) {
    score += 15;
    breakdown.push({ label: "Brief description", pts: 15 });
  }
  if (hasLocation) {
    score += 25;
    breakdown.push({ label: "Location attached", pts: 25 });
  }
  const images = files.filter((f) => f.type.startsWith("image/"));
  const videos = files.filter((f) => f.type.startsWith("video/"));
  const docs = files.filter(
    (f) => !f.type.startsWith("image/") && !f.type.startsWith("video/"),
  );
  if (images.length > 0) {
    const pts = Math.min(images.length * 10, 30);
    score += pts;
    breakdown.push({ label: `${images.length} photo(s)`, pts });
  }
  if (videos.length > 0) {
    score += 10;
    breakdown.push({ label: "Video evidence", pts: 10 });
  }
  if (docs.length > 0) {
    score += 5;
    breakdown.push({ label: "Supporting document", pts: 5 });
  }
  return { score: Math.min(score, 100), breakdown };
}

function StepIndicator({ current, steps }) {
  return (
    <div className="flex items-center gap-0 mb-10">
      {steps.map((step, i) => (
        <div key={i} className="flex items-center">
          <div className="flex flex-col items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-300 z-30 ${
                i < current
                  ? "bg-blue-500 text-white"
                  : i === current
                    ? "bg-black text-white ring-4 ring-black/10"
                    : "bg-neutral-100 text-neutral-400"
              }`}
            >
              {i < current ? <CheckIcon /> : i + 1}
            </div>
            <span
              className={`mt-1.5 text-[10px] font-medium whitespace-nowrap ${
                i === current
                  ? "text-black"
                  : i < current
                    ? "text-blue-500"
                    : "text-neutral-400"
              }`}
            >
              {step}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div
              className={`h-0.5 w-12 md:w-20 mx-1 mb-4 transition-all duration-300 ${i < current ? "bg-blue-500" : "bg-neutral-200"}`}
            />
          )}
        </div>
      ))}
    </div>
  );
}

function FileChip({ file, onRemove }) {
  const isImage = file.type.startsWith("image/");
  const isVideo = file.type.startsWith("video/");
  const preview = isImage ? URL.createObjectURL(file) : null;

  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-neutral-50 border border-black/8 rounded-xl group relative overflow-hidden">
      {preview ? (
        <img
          src={preview}
          alt=""
          className="w-8 h-8 object-cover rounded-lg shrink-0"
        />
      ) : (
        <div className="w-8 h-8 rounded-lg bg-black/6 flex items-center justify-center shrink-0 text-neutral-400">
          {isVideo ? <VideoIcon /> : <FileTextIcon />}
        </div>
      )}
      <div className="min-w-0">
        <p className="text-[11px] font-medium text-black truncate max-w-27.5">
          {file.name}
        </p>
        <p className="text-[10px] text-neutral-400">
          {(file.size / 1024).toFixed(0)} KB
        </p>
      </div>
      <button
        onClick={() => onRemove(file.name)}
        className="ml-1 p-0.5 rounded-full bg-neutral-200 hover:bg-red-100 hover:text-red-500 transition-colors text-neutral-400 cursor-pointer border-none"
      >
        <XIcon />
      </button>
    </div>
  );
}

function EvidenceMeter({ score, breakdown }) {
  const color =
    score >= 80
      ? "#22c55e"
      : score >= 50
        ? "#3b82f6"
        : score >= 30
          ? "#f59e0b"
          : "#ef4444";
  const label =
    score >= 80
      ? "Strong"
      : score >= 50
        ? "Good"
        : score >= 30
          ? "Fair"
          : "Weak";

  return (
    <div className="bg-neutral-50 border border-black/[0.07] rounded-2xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <SparklesIcon />
          <span className="text-[12px] font-semibold text-black">
            Evidence Score
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-xl font-bold" style={{ color }}>
            {score}
          </span>
          <span className="text-xs text-neutral-400">/100</span>
          <span
            className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
            style={{ background: color + "15", color }}
          >
            {label}
          </span>
        </div>
      </div>
      <div className="h-2 bg-neutral-200 rounded-full overflow-hidden mb-3">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{ width: `${score}%`, background: color }}
        />
      </div>
      {breakdown.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {breakdown.map((b, i) => (
            <span
              key={i}
              className="text-[10px] px-2 py-0.5 bg-white border border-black/8 rounded-full text-neutral-600 font-medium"
            >
              +{b.pts} {b.label}
            </span>
          ))}
        </div>
      )}
      {breakdown.length === 0 && (
        <p className="text-[11px] text-neutral-400">
          Add description, location & media to boost score.
        </p>
      )}
    </div>
  );
}

// ─── Success Page ─────────────────────────────────────────────────────────────
function SuccessPage({ result, onGoToDashboard }) {
  const scoreColor =
    result.evidenceScore >= 80
      ? "#22c55e"
      : result.evidenceScore >= 50
        ? "#3b82f6"
        : "#f59e0b";

  return (
    <div className="min-h-screen bg-white pt-20 pb-16 flex flex-col items-center justify-start px-4">
      <div
        className="absolute inset-0 pointer-events-none z-10"
        style={{
          backgroundImage: `
        linear-gradient(rgba(0,0,0,0.042) 1px, transparent 1px),
        linear-gradient(90deg, rgba(0,0,0,0.042) 1px, transparent 1px)
      `,
          backgroundSize: "48px 48px",
        }}
      />

      {/* Radial Fade */}
      <div
        className="absolute inset-0 pointer-events-none z-10"
        style={{
          background:
            "radial-gradient(ellipse 90% 80% at 50% 50%, transparent 30%, #F7F6F2 100%)",
        }}
      />

      {/* Animated checkmark */}
      <div className="mt-8 mb-6 relative z-30">
        <div
          className="w-20 h-20 rounded-full bg-green-50 border-2 border-green-200 flex items-center justify-center animate-[scale-in_0.4s_ease-out] z-30"
          style={{ animation: "scaleIn 0.4s ease-out forwards" }}
        >
          <svg
            width="36"
            height="36"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#22c55e"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20 6L9 17l-5-5" />
          </svg>
        </div>
        <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
          <SparklesIcon />
        </div>
      </div>

      <h1 className="text-2xl md:text-3xl font-['DM_Serif_Display'] text-black text-center mb-1 z-30">
        Complaint Registered!
      </h1>
      <p className="text-neutral-500 text-sm text-center mb-8 max-w-sm z-30">
        Your grievance has been filed. We'll keep you updated every step of the
        way.
      </p>

      {/* ID card */}
      <div className="w-full max-w-md bg-black rounded-2xl p-5 mb-5 relative overflow-hidden z-30">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 50%, #3b82f6 0%, transparent 60%)",
          }}
        />
        <div className="relative">
          <p className="text-neutral-400 text-[10px] uppercase tracking-widest mb-1">
            Complaint ID
          </p>
          <p className="text-white font-mono text-2xl font-bold tracking-wider mb-4">
            {result.id}
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-neutral-500 text-[10px] uppercase tracking-wider mb-0.5">
                Status
              </p>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-xs font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
                {result.status}
              </span>
            </div>
            <div>
              <p className="text-neutral-500 text-[10px] uppercase tracking-wider mb-0.5">
                Priority
              </p>
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                  result.priority === "Critical"
                    ? "bg-red-500/20 text-red-400"
                    : result.priority === "High"
                      ? "bg-orange-500/20 text-orange-400"
                      : "bg-blue-500/20 text-blue-400"
                }`}
              >
                {result.priority}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Info grid */}
      <div className="w-full max-w-md grid grid-cols-1 gap-3 mb-5 z-30">
        <div className="flex items-center gap-3 p-4 bg-neutral-50 border border-black/[0.07] rounded-2xl">
          <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500 shrink-0">
            <BuildingIcon />
          </div>
          <div className="z-30">
            <p className="text-[10px] text-neutral-400 uppercase tracking-wider">
              Department Assigned
            </p>
            <p className="text-sm font-semibold text-black">
              {result.department}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-4 bg-neutral-50 border border-black/[0.07] rounded-2xl">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: scoreColor + "15", color: scoreColor }}
          >
            <SparklesIcon />
          </div>
          <div className="flex-1">
            <p className="text-[10px] text-neutral-400 uppercase tracking-wider mb-1">
              Evidence Score
            </p>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-1.5 bg-neutral-200 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${result.evidenceScore}%`,
                    background: scoreColor,
                  }}
                />
              </div>
              <span className="text-sm font-bold" style={{ color: scoreColor }}>
                {result.evidenceScore}/100
              </span>
            </div>
            <p className="text-[10px] text-neutral-400 mt-1">
              {result.evidenceBreakdown.map((b) => b.label).join(" · ")}
            </p>
          </div>
        </div>
      </div>

      <div className="w-full max-w-md flex flex-col gap-2.5 z-30">
        <button
          onClick={onGoToDashboard}
          className="w-full flex items-center justify-center gap-2 py-3.5 bg-black text-white rounded-2xl
          text-sm font-semibold hover:bg-blue-500 transition-all duration-200 active:scale-[0.98]
          shadow-[0_4px_14px_rgba(59,130,246,0.25)] cursor-pointer border-none"
        >
          Go to My Dashboard
          <ArrowRightIcon />
        </button>
        <button
          onClick={() => window.location.reload()}
          className="w-full py-3.5 border border-black/10 text-black rounded-2xl text-sm font-medium
          hover:bg-neutral-50 transition-all duration-200 cursor-pointer bg-white"
        >
          File Another Complaint
        </button>
      </div>

      <style>{`
        @keyframes scaleIn { from { transform: scale(0.5); opacity: 0; } to { transform: scale(1); opacity: 1; } }
      `}</style>
    </div>
  );
}

export default function RegisterComplaint() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const [isLocating, setIsLocating] = useState(false);

  const [form, setForm] = useState({
    category: "",
    title: "",
    description: "",
    severity: "Moderate",
    location: { address: "", lat: null, lng: null },
    files: [],
    contactPhone: "",
    anonymous: false,
  });

  const [errors, setErrors] = useState({});
  const { score: evScore, breakdown: evBreakdown } = calcEvidenceScore(
    form.files,
    !!form.location.address,
    form.description,
  );

  const update = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  // File handling
  const handleFiles = useCallback((incoming) => {
    const allowed = [
      "image/",
      "video/",
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument",
      "text/plain",
    ];
    const valid = Array.from(incoming).filter(
      (f) =>
        allowed.some((t) => f.type.startsWith(t)) && f.size < 50 * 1024 * 1024,
    );
    setForm((f) => ({ ...f, files: [...f.files, ...valid].slice(0, 10) }));
  }, []);

  const removeFile = (name) =>
    setForm((f) => ({ ...f, files: f.files.filter((x) => x.name !== name) }));

  const onDrop = useCallback(
    (e) => {
      e.preventDefault();
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles],
  );
  const getLocation = () => {
    setIsLocating(true);
    navigator.geolocation?.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
          );
          const data = await res.json();
          update("location", {
            address:
              data.display_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`,
            lat,
            lng,
          });
        } catch {
          update("location", {
            address: `${lat.toFixed(5)}, ${lng.toFixed(5)}`,
            lat,
            lng,
          });
        }
        setIsLocating(false);
      },
      () => {
        setIsLocating(false);
        update("location", {
          address: "Location unavailable",
          lat: null,
          lng: null,
        });
      },
    );
  };

  // Validation
  const validateStep = (s) => {
    const e = {};
    if (s === 0 && !form.category) e.category = "Please select a category.";
    if (s === 1) {
      if (!form.title.trim()) e.title = "Title is required.";
      if (form.description.trim().length < 20)
        e.description = "Please provide at least 20 characters.";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const nextStep = () => {
    if (validateStep(step)) setStep((s) => s + 1);
  };
  const prevStep = () => setStep((s) => s - 1);

  const handleSubmit = () => {
    const category = CATEGORIES.find((c) => c.id === form.category);
    const { score, breakdown } = calcEvidenceScore(
      form.files,
      !!form.location.address,
      form.description,
    );
    const res = {
      id: generateComplaintId(),
      status: "Pending Review",
      priority: PRIORITY_MAP[form.category] || "Medium",
      department: category?.dept || "General Admin",
      evidenceScore: score,
      evidenceBreakdown: breakdown,
    };
    setResult(res);
    setSubmitted(true);
  };

  if (submitted && result) {
    return (
      <SuccessPage
        result={result}
        onGoToDashboard={() => navigate("/citizen/dashboard")}
      />
    );
  }

  const STEPS = ["Category", "Details", "Evidence", "Review"];
  const selectedCat = CATEGORIES.find((c) => c.id === form.category);

  return (
    <div className="min-h-screen bg-white pt-16 relative overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0,0,0,0.042) 1px, transparent 1px),
        linear-gradient(90deg, rgba(0,0,0,0.042) 1px, transparent 1px)
      `,
          backgroundSize: "48px 48px",
        }}
      />

      {/* Radial Fade */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 90% 80% at 50% 50%, transparent 30%, #F7F6F2 100%)",
        }}
      />
      {/* Header band */}
      <div className=" sticky top-8 z-30">
        <div className="max-w-2xl mx-auto px-5 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-['DM_Serif_Display'] text-black leading-tight">
              File a Complaint
            </h1>
            <p className="text-[11px] text-neutral-400 mt-0.5">
              Step {step + 1} of {STEPS.length}
            </p>
          </div>
          {/* Mini evidence score badge */}
          {step >= 1 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-50 border border-black/8 rounded-full">
              <SparklesIcon />
              <span className="text-xs font-semibold text-black">
                {evScore}
              </span>
              <span className="text-[10px] text-neutral-400">/100</span>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-5 pt-8 pb-32 z-10">
        <StepIndicator current={step} steps={STEPS} />

        {/* ── Step 0: Category ── */}
        {step === 0 && (
          <div>
            <h2 className="text-xl font-['DM_Serif_Display'] text-black mb-1.5">
              What's the issue about?
            </h2>
            <p className="text-sm text-neutral-500 mb-6">
              Select the category that best describes your complaint.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 z-10">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    update("category", cat.id);
                    setErrors({});
                  }}
                  className={`flex flex-col items-start p-4 rounded-2xl border text-left transition-all duration-150 cursor-pointer z-30
                    ${
                      form.category === cat.id
                        ? "bg-black border-black text-white shadow-[0_4px_14px_rgba(0,0,0,0.15)]"
                        : "bg-white border-black/10 hover:border-black/30 hover:bg-neutral-50"
                    }`}
                >
                  <span className="text-2xl mb-2">{cat.icon}</span>
                  <span
                    className={`text-[12px] font-semibold leading-tight ${form.category === cat.id ? "text-white" : "text-black"}`}
                  >
                    {cat.label}
                  </span>
                  <span
                    className={`text-[10px] mt-1 ${form.category === cat.id ? "text-neutral-300" : "text-neutral-400"}`}
                  >
                    {cat.dept}
                  </span>
                </button>
              ))}
            </div>
            {errors.category && (
              <p className="mt-3 text-xs text-red-500 flex items-center gap-1">
                <AlertCircleIcon /> {errors.category}
              </p>
            )}
          </div>
        )}

        {/* ── Step 1: Details ── */}
        {step === 1 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-xl font-['DM_Serif_Display'] text-black mb-1">
                Describe the problem
              </h2>
              <p className="text-sm text-neutral-500">
                More detail = higher evidence score & faster resolution.
              </p>
            </div>

            {/* Category pill */}
            {selectedCat && (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-black text-white rounded-full text-xs font-medium">
                <span>{selectedCat.icon}</span>
                {selectedCat.label}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-black mb-1.5">
                Complaint Title *
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => update("title", e.target.value)}
                placeholder="e.g. Broken road near main market, ward 5"
                className={`w-full px-4 py-3 rounded-xl border text-sm bg-white text-black placeholder:text-neutral-300
                  focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition-all
                  ${errors.title ? "border-red-300" : "border-black/[12"}`}
              />
              {errors.title && (
                <p className="mt-1 text-xs text-red-500">{errors.title}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-black mb-1.5">
                Description *
                <span className="ml-2 font-normal text-neutral-400">
                  {form.description.length} chars
                </span>
              </label>
              <textarea
                rows={5}
                value={form.description}
                onChange={(e) => update("description", e.target.value)}
                placeholder="Describe the issue in detail — when did it start, how severe is it, who is affected, any previous complaints filed..."
                className={`w-full px-4 py-3 rounded-xl border text-sm bg-white text-black placeholder:text-neutral-300
                  focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition-all resize-none
                  ${errors.description ? "border-red-300" : "border-black/12"}`}
              />
              {errors.description && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.description}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-black mb-2">
                Severity Level
              </label>
              <div className="grid grid-cols-4 gap-2">
                {SEVERITY.map((s) => (
                  <button
                    key={s}
                    onClick={() => update("severity", s)}
                    className={`py-2.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer
                      ${
                        form.severity === s
                          ? s === "Critical"
                            ? "bg-red-500 border-red-500 text-white"
                            : s === "Severe"
                              ? "bg-orange-500 border-orange-500 text-white"
                              : s === "Moderate"
                                ? "bg-yellow-500 border-yellow-500 text-white"
                                : "bg-green-500 border-green-500 text-white"
                          : "bg-white border-black/10 text-neutral-600 hover:border-black/20"
                      }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-black mb-1.5">
                Location
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={form.location.address}
                  onChange={(e) =>
                    update("location", {
                      ...form.location,
                      address: e.target.value,
                    })
                  }
                  placeholder="Enter address manually or use GPS"
                  className="flex-1 px-4 py-3 rounded-xl border border-black/12 text-sm bg-white text-black
                    placeholder:text-neutral-300 focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black"
                />
                <button
                  onClick={getLocation}
                  disabled={isLocating}
                  className="px-4 py-2 rounded-xl border border-black/12 bg-white text-black hover:bg-neutral-50
                    text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50 whitespace-nowrap"
                >
                  {isLocating ? (
                    <span className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                  ) : (
                    <LocationIcon />
                  )}
                  {isLocating ? "Locating…" : "Use GPS"}
                </button>
              </div>
              {form.location.lat && (
                <p className="mt-1.5 text-[10px] text-green-600 flex items-center gap-1">
                  <CheckIcon /> GPS coordinates captured (
                  {form.location.lat.toFixed(4)}, {form.location.lng.toFixed(4)}
                  )
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-black mb-1.5">
                Contact Phone (optional)
              </label>
              <input
                type="tel"
                value={form.contactPhone}
                onChange={(e) => update("contactPhone", e.target.value)}
                placeholder="+91 XXXXX XXXXX"
                className="w-full px-4 py-3 rounded-xl border border-black/12 text-sm bg-white text-black
                  placeholder:text-neutral-300 focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black"
              />
            </div>

            <label className="flex items-center gap-3 cursor-pointer group">
              <div
                onClick={() => update("anonymous", !form.anonymous)}
                className={`w-5 h-5 rounded flex items-center justify-center border transition-all ${
                  form.anonymous
                    ? "bg-black border-black text-white"
                    : "border-black/20 bg-white group-hover:border-black/40"
                }`}
              >
                {form.anonymous && <CheckIcon />}
              </div>
              <span className="text-sm text-neutral-600">
                File anonymously (your identity will be hidden from department)
              </span>
            </label>
          </div>
        )}

        {/* ── Step 2: Evidence ── */}
        {step === 2 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-xl font-['DM_Serif_Display'] text-black mb-1">
                Attach Evidence
              </h2>
              <p className="text-sm text-neutral-500">
                Photos, videos, or documents strengthen your case. Max 10 files
                · 50 MB each.
              </p>
            </div>

            {/* Evidence score */}
            <EvidenceMeter score={evScore} breakdown={evBreakdown} />

            {/* Drop zone */}
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={onDrop}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-black/12 rounded-2xl p-8 text-center cursor-pointer
                hover:border-black/30 hover:bg-neutral-50 transition-all group"
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,video/*,.pdf,.doc,.docx,.txt"
                className="hidden"
                onChange={(e) => handleFiles(e.target.files)}
              />
              <div
                className="w-12 h-12 rounded-2xl bg-neutral-100 flex items-center justify-center mx-auto mb-3
                group-hover:bg-black group-hover:text-white transition-all"
              >
                <UploadIcon />
              </div>
              <p className="text-sm font-semibold text-black mb-1">
                Drag & drop or click to upload
              </p>
              <p className="text-xs text-neutral-400">
                Images, Videos, PDFs, Documents
              </p>
            </div>

            {/* Quick action chips */}
            <div className="flex gap-2">
              {[
                {
                  label: "Take Photo",
                  icon: <CameraIcon />,
                  accept: "image/*;capture=camera",
                },
                {
                  label: "Record Video",
                  icon: <VideoIcon />,
                  accept: "video/*;capture=camcorder",
                },
                {
                  label: "Upload Doc",
                  icon: <FileTextIcon />,
                  accept: ".pdf,.doc,.docx,.txt",
                },
              ].map(({ label, icon, accept }) => (
                <button
                  key={label}
                  onClick={() => {
                    const i = document.createElement("input");
                    i.type = "file";
                    i.accept = accept;
                    i.onchange = (e) => handleFiles(e.target.files);
                    i.click();
                  }}
                  className="flex-1 flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border border-black/10
                    text-neutral-600 hover:border-black/30 hover:text-black transition-all cursor-pointer bg-white text-xs font-medium"
                >
                  {icon}
                  {label}
                </button>
              ))}
            </div>

            {/* File list */}
            {form.files.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-black mb-2">
                  {form.files.length} file(s) attached
                </p>
                <div className="flex flex-wrap gap-2">
                  {form.files.map((f) => (
                    <FileChip key={f.name} file={f} onRemove={removeFile} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Step 3: Review ── */}
        {step === 3 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-['DM_Serif_Display'] text-black mb-1">
                Review & Submit
              </h2>
              <p className="text-sm text-neutral-500">
                Please confirm your complaint details before submitting.
              </p>
            </div>

            <div className="border border-black/8 rounded-2xl overflow-hidden">
              <div className="px-5 py-4 border-b border-black/[0.07] flex items-center gap-3">
                <span className="text-2xl">{selectedCat?.icon}</span>
                <div>
                  <p className="text-[10px] text-neutral-400 uppercase tracking-wider">
                    {selectedCat?.label}
                  </p>
                  <p className="text-sm font-semibold text-black">
                    {form.title}
                  </p>
                </div>
                <span
                  className={`ml-auto px-2.5 py-1 rounded-full text-xs font-semibold
                  ${
                    form.severity === "Critical"
                      ? "bg-red-50 text-red-600"
                      : form.severity === "Severe"
                        ? "bg-orange-50 text-orange-600"
                        : form.severity === "Moderate"
                          ? "bg-yellow-50 text-yellow-600"
                          : "bg-green-50 text-green-600"
                  }`}
                >
                  {form.severity}
                </span>
              </div>

              <div className="px-5 py-4 border-b border-black/[0.07]">
                <p className="text-xs font-semibold text-black mb-1.5">
                  Description
                </p>
                <p className="text-sm text-neutral-600 leading-relaxed">
                  {form.description || "—"}
                </p>
              </div>

              <div className="grid grid-cols-2 divide-x divide-black/[0.07]">
                <div className="px-5 py-4">
                  <p className="text-xs font-semibold text-black mb-1 flex items-center gap-1.5">
                    <MapPinIcon /> Location
                  </p>
                  <p className="text-xs text-neutral-500 leading-relaxed">
                    {form.location.address || "Not provided"}
                  </p>
                </div>
                <div className="px-5 py-4">
                  <p className="text-xs font-semibold text-black mb-1 flex items-center gap-1.5">
                    <BuildingIcon /> Department
                  </p>
                  <p className="text-xs text-neutral-500">
                    {selectedCat?.dept}
                  </p>
                </div>
              </div>

              {form.files.length > 0 && (
                <div className="px-5 py-4 border-t border-black/[0.07]">
                  <p className="text-xs font-semibold text-black mb-2 flex items-center gap-1.5">
                    <UploadIcon /> Evidence ({form.files.length} file
                    {form.files.length > 1 ? "s" : ""})
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {form.files.map((f) => (
                      <span
                        key={f.name}
                        className="text-[10px] px-2 py-0.5 bg-neutral-100 rounded-full text-neutral-600 truncate max-w-35"
                      >
                        {f.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Evidence score preview */}
            <EvidenceMeter score={evScore} breakdown={evBreakdown} />

            {/* Anonymous notice */}
            {form.anonymous && (
              <div className="flex items-start gap-2.5 px-4 py-3 bg-blue-50 border border-blue-100 rounded-xl">
                <AlertCircleIcon />
                <p className="text-xs text-blue-700">
                  Your identity will be kept anonymous. Department will only see
                  the complaint details.
                </p>
              </div>
            )}
          </div>
        )}

        {/* ── Navigation ── */}
        <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur border-t border-black/[0.07] px-5 py-4 z-30">
          <div className="max-w-2xl mx-auto flex gap-3">
            {step > 0 && (
              <button
                onClick={prevStep}
                className="px-5 py-3 rounded-xl border border-black/10 text-sm font-medium text-neutral-600
                  hover:text-black hover:border-black/20 transition-all cursor-pointer bg-white"
              >
                ← Back
              </button>
            )}
            {step < STEPS.length - 1 ? (
              <button
                onClick={nextStep}
                className="flex-1 py-3 rounded-xl bg-black text-white text-sm font-semibold
                  hover:bg-blue-500 transition-all duration-200 active:scale-[0.98] cursor-pointer border-none
                  shadow-[0_4px_14px_rgba(59,130,246,0.2)]"
              >
                Continue →
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                className="flex-1 py-3 rounded-xl bg-black text-white text-sm font-semibold
                  hover:bg-blue-500 transition-all duration-200 active:scale-[0.98] cursor-pointer border-none
                  shadow-[0_4px_14px_rgba(59,130,246,0.25)] flex items-center justify-center gap-2"
              >
                Submit Complaint
                <ArrowRightIcon />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
