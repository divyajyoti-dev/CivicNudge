"use client";
import { useState, useEffect } from "react";
import { Bill, PersonaParams, Platform } from "@/lib/types";

const INCOME_MIN = 0;
const INCOME_MAX = 200000;
const INCOME_STEP = 5000;

function formatIncome(val: number) {
  if (val >= INCOME_MAX) return "$200k+";
  if (val >= 1000) return `$${val / 1000}k`;
  return `$${val}`;
}

const PERSONA_FIELDS = [
  {
    id: "ageGroup",
    label: "Age Group",
    chips: ["Under 18", "18–24", "25–34", "35–44", "45–54", "55–64", "65+"],
  },
  {
    id: "familyType",
    label: "Family Type",
    chips: ["Single", "Single Parent", "Couple", "Family with kids", "Multigenerational", "Empty Nester"],
  },
  {
    id: "occupation",
    label: "Occupation",
    chips: ["Student", "Full-time Employee", "Part-time Employee", "Gig Worker", "Self-employed", "Unemployed", "Retired", "Homemaker", "Union Member"],
  },
  {
    id: "gender",
    label: "Gender",
    chips: ["Men", "Women", "Non-binary", "Prefer not to say"],
  },
  {
    id: "sexualOrientation",
    label: "Sexual Orientation",
    chips: ["Straight", "Gay / Lesbian", "Bisexual", "Queer", "Prefer not to say"],
  },
  {
    id: "maritalStatus",
    label: "Marital Status",
    chips: ["Single", "Married", "Divorced", "Domestic Partnership"],
  },
  {
    id: "veteranStatus",
    label: "Veteran Status",
    chips: ["Veteran", "Active Duty", "Non-veteran"],
  },
];

const PLATFORM_CHIPS: { id: Platform; label: string }[] = [
  { id: "story", label: "Story" },
  { id: "image", label: "Image Post" },
  { id: "audio", label: "Audio" },
  { id: "sms", label: "SMS" },
  { id: "email", label: "Email" },
];

function IncomeSlider({
  value,
  onChange,
}: {
  value: [number, number];
  onChange: (v: [number, number]) => void;
}) {
  const [low, high] = value;
  const pct = (v: number) => ((v - INCOME_MIN) / (INCOME_MAX - INCOME_MIN)) * 100;

  const handleLow = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = Math.min(Number(e.target.value), high - INCOME_STEP);
    onChange([v, high]);
  };
  const handleHigh = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = Math.max(Number(e.target.value), low + INCOME_STEP);
    onChange([low, v]);
  };

  const sliderBase: React.CSSProperties = {
    appearance: "none",
    position: "absolute",
    width: "100%",
    height: "100%",
    background: "transparent",
    pointerEvents: "none",
    outline: "none",
    margin: 0,
    padding: 0,
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: "#1d4ed8" }}>{formatIncome(low)}</span>
        <span style={{ fontSize: 12, color: "#94a3b8" }}>Income Range</span>
        <span style={{ fontSize: 13, fontWeight: 600, color: "#1d4ed8" }}>{formatIncome(high)}</span>
      </div>
      <div style={{ position: "relative", height: 28, display: "flex", alignItems: "center" }}>
        <div style={{ position: "absolute", width: "100%", height: 4, background: "#e5e7eb", borderRadius: 2 }} />
        <div
          style={{
            position: "absolute",
            height: 4,
            background: "#2563eb",
            borderRadius: 2,
            left: `${pct(low)}%`,
            width: `${pct(high) - pct(low)}%`,
          }}
        />
        <input
          type="range"
          className="income-thumb"
          min={INCOME_MIN}
          max={INCOME_MAX}
          step={INCOME_STEP}
          value={low}
          onChange={handleLow}
          style={{ ...sliderBase, zIndex: low > INCOME_MAX - INCOME_STEP ? 5 : 3 }}
        />
        <input
          type="range"
          className="income-thumb"
          min={INCOME_MIN}
          max={INCOME_MAX}
          step={INCOME_STEP}
          value={high}
          onChange={handleHigh}
          style={{ ...sliderBase, zIndex: 4 }}
        />
      </div>
    </div>
  );
}

function Chip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "7px 15px",
        borderRadius: 20,
        border: `1.5px solid ${active ? "#2563eb" : "rgba(0,0,0,0.09)"}`,
        background: active ? "#eff6ff" : "#fff",
        color: active ? "#1d4ed8" : "#475569",
        fontSize: 13,
        fontWeight: active ? 600 : 400,
        cursor: "pointer",
        transition: "all 0.15s",
        letterSpacing: "-0.01em",
      }}
    >
      {label}
    </button>
  );
}

function FieldLabel({ children, optional }: { children: React.ReactNode; optional?: boolean }) {
  return (
    <div
      style={{
        fontSize: 11,
        fontWeight: 600,
        color: "#94a3b8",
        marginBottom: 8,
        letterSpacing: "0.05em",
        textTransform: "uppercase",
        display: "flex",
        gap: 6,
        alignItems: "center",
      }}
    >
      {children}
      {optional && (
        <span style={{ fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>optional</span>
      )}
    </div>
  );
}

function ToggleSwitch({
  value,
  onChange,
  leftLabel,
  rightLabel,
}: {
  value: boolean;
  onChange: (v: boolean) => void;
  leftLabel: string;
  rightLabel: string;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <span
        style={{
          fontSize: 13,
          color: !value ? "#1d4ed8" : "#94a3b8",
          fontWeight: !value ? 600 : 400,
          transition: "color 0.2s",
        }}
      >
        {leftLabel}
      </span>
      <div
        onClick={() => onChange(!value)}
        style={{
          width: 44,
          height: 24,
          borderRadius: 12,
          background: value ? "#2563eb" : "#e2e8f0",
          position: "relative",
          cursor: "pointer",
          transition: "background 0.2s",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            width: 18,
            height: 18,
            borderRadius: 9,
            background: "#fff",
            position: "absolute",
            top: 3,
            left: value ? 23 : 3,
            transition: "left 0.2s",
            boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
          }}
        />
      </div>
      <span
        style={{
          fontSize: 13,
          color: value ? "#1d4ed8" : "#94a3b8",
          fontWeight: value ? 600 : 400,
          transition: "color 0.2s",
        }}
      >
        {rightLabel}
      </span>
    </div>
  );
}

function BillModal({ bill, onClose }: { bill: Bill; onClose: () => void }) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.4)",
        zIndex: 200,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: "#fff",
          borderRadius: 18,
          padding: "32px 36px",
          maxWidth: 620,
          width: "100%",
          maxHeight: "80vh",
          overflowY: "auto",
          boxShadow: "0 24px 60px rgba(0,0,0,0.18)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
          <div>
            <div
              style={{
                fontFamily: "var(--font-dm-mono), monospace",
                fontSize: 11,
                color: "#94a3b8",
                marginBottom: 4,
              }}
            >
              {bill.code}
            </div>
            <div
              style={{
                fontWeight: 800,
                fontSize: 20,
                color: "#0f172a",
                letterSpacing: "-0.03em",
                lineHeight: 1.3,
              }}
            >
              {bill.title}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "#f1f5f9",
              border: "none",
              borderRadius: 8,
              width: 32,
              height: 32,
              cursor: "pointer",
              fontSize: 16,
              color: "#64748b",
              flexShrink: 0,
              marginLeft: 16,
            }}
          >
            ✕
          </button>
        </div>
        <div
          style={{
            fontSize: 14,
            color: "#374151",
            lineHeight: 1.85,
            whiteSpace: "pre-wrap",
          }}
        >
          {bill.fullText}
        </div>
      </div>
    </div>
  );
}

interface PersonaBuilderProps {
  bill: Bill;
  onGenerate: (params: PersonaParams) => void;
  generating: boolean;
}

export default function PersonaBuilder({ bill, onGenerate, generating }: PersonaBuilderProps) {
  const [selections, setSelections] = useState<Record<string, string[]>>(
    Object.fromEntries(PERSONA_FIELDS.map(f => [f.id, []]))
  );
  const [incomeRange, setIncomeRange] = useState<[number, number]>([0, 200000]);
  const [location, setLocation] = useState("");
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [freeform, setFreeform] = useState("");
  const [actionBias, setActionBias] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const toggleChip = (fieldId: string, chip: string) => {
    setSelections(prev => ({
      ...prev,
      [fieldId]: prev[fieldId].includes(chip)
        ? prev[fieldId].filter(x => x !== chip)
        : [...prev[fieldId], chip],
    }));
  };

  const togglePlatform = (id: Platform) => {
    setPlatforms(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]));
  };

  const buildDescription = () => {
    if (freeform.trim()) return freeform.trim();
    const parts: string[] = [];
    if (location) parts.push(`Location: ${location}`);
    const incomeStr = `${formatIncome(incomeRange[0])}–${formatIncome(incomeRange[1])}`;
    if (incomeRange[0] > 0 || incomeRange[1] < INCOME_MAX)
      parts.push(`Income: ${incomeStr}`);
    PERSONA_FIELDS.forEach(f => {
      if (selections[f.id].length > 0) parts.push(`${f.label}: ${selections[f.id].join(", ")}`);
    });
    parts.push(`Goal: ${actionBias ? "Drive to Action" : "Inform"}`);
    return parts.join(" · ");
  };

  const hasPersona =
    location || freeform.trim() || PERSONA_FIELDS.some(f => selections[f.id].length > 0);
  const canGenerate = !!hasPersona && platforms.length > 0;

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "10px 14px",
    border: "1.5px solid rgba(0,0,0,0.09)",
    borderRadius: 10,
    fontSize: 13,
    color: "#0f172a",
    background: "#fff",
    outline: "none",
    boxSizing: "border-box",
    letterSpacing: "-0.01em",
    transition: "border-color 0.15s",
  };

  return (
    <div style={{ maxWidth: 640, margin: "0 auto", paddingBottom: 100 }}>
      {/* Selected bill bar */}
      <div
        style={{
          background: "#fff",
          borderRadius: 14,
          padding: "16px 20px",
          marginBottom: 24,
          boxShadow: "0 1px 6px rgba(0,0,0,0.05)",
          display: "flex",
          gap: 16,
          alignItems: "center",
        }}
      >
        <div style={{ flex: 1 }}>
          <div
            style={{
              fontFamily: "var(--font-dm-mono), monospace",
              fontSize: 11,
              color: "#94a3b8",
              marginBottom: 2,
            }}
          >
            {bill.code}
          </div>
          <div
            onClick={() => setShowModal(true)}
            style={{
              fontWeight: 700,
              fontSize: 14,
              color: "#2563eb",
              letterSpacing: "-0.02em",
              cursor: "pointer",
              textDecoration: "underline",
              textDecorationStyle: "dotted",
              textUnderlineOffset: 3,
            }}
          >
            {bill.title}
          </div>
        </div>
      </div>

      {/* Persona form card */}
      <div
        style={{
          background: "#fff",
          borderRadius: 16,
          padding: "26px 28px",
          boxShadow: "0 1px 6px rgba(0,0,0,0.05)",
          marginBottom: 14,
        }}
      >
        {/* Location */}
        <div style={{ marginBottom: 24 }}>
          <FieldLabel>Location</FieldLabel>
          <input
            value={location}
            onChange={e => setLocation(e.target.value)}
            placeholder="e.g. East Oakland, CA or California"
            style={inputStyle}
            onFocus={e => (e.target.style.borderColor = "#2563eb")}
            onBlur={e => (e.target.style.borderColor = "rgba(0,0,0,0.09)")}
          />
        </div>

        {/* Income slider */}
        <div style={{ marginBottom: 24 }}>
          <FieldLabel>Income</FieldLabel>
          <div style={{ background: "#f8fafc", borderRadius: 10, padding: "16px 18px" }}>
            <IncomeSlider value={incomeRange} onChange={setIncomeRange} />
          </div>
        </div>

        {/* Chip fields */}
        {PERSONA_FIELDS.map(field => (
          <div key={field.id} style={{ marginBottom: 22 }}>
            <FieldLabel>{field.label}</FieldLabel>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {field.chips.map(chip => (
                <Chip
                  key={chip}
                  label={chip}
                  active={selections[field.id].includes(chip)}
                  onClick={() => toggleChip(field.id, chip)}
                />
              ))}
            </div>
          </div>
        ))}

        {/* Other information */}
        <div style={{ marginBottom: 24 }}>
          <FieldLabel optional>Other Information</FieldLabel>
          <textarea
            value={freeform}
            onChange={e => setFreeform(e.target.value)}
            placeholder="Any other details — language, religion, neighborhood, specific concerns…"
            rows={3}
            style={{
              ...inputStyle,
              resize: "vertical",
              lineHeight: 1.6,
              borderColor: freeform ? "#2563eb" : "rgba(0,0,0,0.09)",
            }}
          />
        </div>

        {/* Action Goal + Platforms */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            paddingTop: 20,
            borderTop: "1px solid rgba(0,0,0,0.05)",
            flexWrap: "wrap",
            gap: 20,
          }}
        >
          <div>
            <FieldLabel>Action Goal</FieldLabel>
            <ToggleSwitch
              value={actionBias}
              onChange={setActionBias}
              leftLabel="Inform"
              rightLabel="Drive to Action"
            />
          </div>
          <div style={{ flex: 1 }}>
            <FieldLabel>Platforms</FieldLabel>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {PLATFORM_CHIPS.map(p => (
                <Chip
                  key={p.id}
                  label={p.label}
                  active={platforms.includes(p.id)}
                  onClick={() => togglePlatform(p.id)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Sticky generate button */}
      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          background: "linear-gradient(to top, #f6f5f2 60%, transparent)",
          padding: "20px 24px 28px",
          zIndex: 50,
          display: "flex",
          justifyContent: "center",
        }}
      >
        <div style={{ position: "relative", maxWidth: 520, width: "100%", display: "flex", justifyContent: "center" }}>
          <button
            onClick={() => {
              if (canGenerate && !generating) {
                onGenerate({
                  selections,
                  incomeRange,
                  location,
                  platforms,
                  freeform,
                  actionBias,
                  description: buildDescription(),
                });
              }
            }}
            disabled={!canGenerate || generating}
            style={{
              padding: "15px 40px",
              maxWidth: 520,
              width: "100%",
              background: !canGenerate ? "#e5e7eb" : generating ? "#1e40af" : "#2563eb",
              color: !canGenerate ? "#9ca3af" : "#fff",
              border: "none",
              borderRadius: 12,
              fontSize: 15,
              fontWeight: 700,
              cursor: !canGenerate || generating ? "default" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 12,
              letterSpacing: "-0.02em",
              boxShadow: canGenerate && !generating ? "0 4px 20px rgba(37,99,235,0.32)" : "none",
              transition: "all 0.2s",
            }}
          >
            {generating ? (
              <>
                <span style={{ display: "inline-block", animation: "spin 1s linear infinite" }}>⟳</span>
                Claude is analyzing…
              </>
            ) : (
              <>
                Generate Campaign{" "}
                <span
                  style={{
                    fontSize: 11,
                    opacity: 0.6,
                    fontWeight: 400,
                    background: "rgba(255,255,255,0.15)",
                    padding: "3px 10px",
                    borderRadius: 20,
                  }}
                >
                  Powered by Claude
                </span>
              </>
            )}
          </button>
          {!canGenerate && (
            <div style={{ position: "absolute", top: -20, fontSize: 12, color: "#94a3b8" }}>
              {!hasPersona ? "Describe your community to continue" : "Select at least one platform"}
            </div>
          )}
        </div>
      </div>

      {showModal && <BillModal bill={bill} onClose={() => setShowModal(false)} />}
    </div>
  );
}
