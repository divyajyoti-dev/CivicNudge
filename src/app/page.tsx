"use client";
import { useState, useEffect, Fragment } from "react";
import { Bill, PersonaParams, GeneratedContent } from "@/lib/types";
import BillQueue from "@/components/BillQueue";
import PersonaBuilder from "@/components/PersonaBuilder";
import ContentReview from "@/components/ContentReview";

type Step = "dashboard" | "persona" | "review";

const STEPS: { id: Step; num: number; label: string }[] = [
  { id: "dashboard", num: 1, label: "Pick a Bill" },
  { id: "persona", num: 2, label: "Target Audience" },
  { id: "review", num: 3, label: "Review & Distribute" },
];

function StepBar({ step, onBack }: { step: Step; onBack: () => void }) {
  const currentIdx = STEPS.findIndex(s => s.id === step);
  const canGoBack = currentIdx > 0;

  return (
    <div style={{ display: "flex", alignItems: "center" }}>
      {canGoBack ? (
        <button
          onClick={onBack}
          style={{
            background: "none",
            border: "1.5px solid rgba(0,0,0,0.1)",
            borderRadius: 8,
            padding: "5px 12px",
            fontSize: 12,
            color: "#64748b",
            cursor: "pointer",
            letterSpacing: "-0.01em",
            marginRight: 20,
            whiteSpace: "nowrap",
          }}
        >
          ← Back
        </button>
      ) : (
        <div style={{ width: 68, marginRight: 20 }} />
      )}
      {STEPS.map((s, i) => {
        const isActive = s.id === step;
        const isDone = currentIdx > i;
        return (
          <Fragment key={s.id}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
              <div
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 15,
                  background: isDone ? "#0f172a" : isActive ? "#0f172a" : "#e5e7eb",
                  color: isDone || isActive ? "#fff" : "#9ca3af",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: isDone ? 13 : 12,
                  fontWeight: 700,
                  transition: "all 0.3s",
                }}
              >
                {isDone ? "✓" : s.num}
              </div>
              <span
                style={{
                  fontSize: 12,
                  whiteSpace: "nowrap",
                  letterSpacing: "-0.01em",
                  color: isActive ? "#0f172a" : isDone ? "#64748b" : "#9ca3af",
                  fontWeight: isActive ? 600 : 400,
                  transition: "color 0.3s",
                }}
              >
                {s.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                style={{
                  width: 72,
                  height: 1.5,
                  marginBottom: 18,
                  flexShrink: 0,
                  background: isDone ? "#0f172a" : "#e5e7eb",
                  transition: "background 0.4s",
                }}
              />
            )}
          </Fragment>
        );
      })}
    </div>
  );
}

export default function Home() {
  const [step, setStep] = useState<Step>("dashboard");
  const [bill, setBill] = useState<Bill | null>(null);
  const [persona, setPersona] = useState<PersonaParams | null>(null);
  const [content, setContent] = useState<GeneratedContent | null>(null);
  const [generating, setGenerating] = useState(false);
  const [approved, setApproved] = useState(false);
  const [synced, setSynced] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("cn_state") || "{}");
      if (saved.step) setStep(saved.step);
      if (saved.bill) setBill(saved.bill);
      if (saved.persona) setPersona(saved.persona);
      if (saved.content) setContent(saved.content);
    } catch {}
  }, []);

  useEffect(() => {
    localStorage.setItem("cn_state", JSON.stringify({ step, bill, persona, content }));
  }, [step, bill, persona, content]);

  const handleSelectBill = (b: Bill) => {
    setBill(b);
    setStep("persona");
  };

  const handleGenerate = async (p: PersonaParams) => {
    setPersona(p);
    setGenerating(true);
    setError(null);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bill, persona: p }),
      });
      if (!res.ok) throw new Error("API error");
      const result = await res.json();
      setContent(result);
      setStep("review");
    } catch {
      setError("API error — check ANTHROPIC_API_KEY in .env.local");
    } finally {
      setGenerating(false);
    }
  };

  const handleBack = () => {
    if (step === "review") {
      setStep("persona");
      setApproved(false);
    } else if (step === "persona") {
      setStep("dashboard");
      setBill(null);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f6f5f2" }}>
      {/* Page content */}
      <main style={{ maxWidth: 980, margin: "0 auto", padding: "44px 32px 72px" }}>
        {/* Top bar: logo left, step bar center */}
        <div style={{ display: "flex", alignItems: "center", marginBottom: 40 }}>
          <div style={{ minWidth: 180 }}>
            <span style={{ fontWeight: 800, fontSize: 17, color: "#0f172a", letterSpacing: "-0.03em" }}>
              CivicNudge
            </span>
          </div>
          <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
            <StepBar step={step} onBack={handleBack} />
          </div>
          <div style={{ minWidth: 180, display: "flex", justifyContent: "flex-end" }}>
            {error && (
              <span style={{ fontSize: 12, color: "#b45309", background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 6, padding: "4px 12px" }}>
                {error}
              </span>
            )}
          </div>
        </div>
        {/* Step heading */}
        <div style={{ marginBottom: 32, textAlign: "center" }}>
          {step === "dashboard" && (
            <>
              <h1 style={{ margin: "0 0 6px", fontSize: 28, fontWeight: 800, color: "#0f172a", letterSpacing: "-0.03em" }}>
                Pick a Bill
              </h1>
              <p style={{ margin: 0, color: "#64748b", fontSize: 15 }}>
                Select a bill from the queue to generate a targeted campaign
              </p>
            </>
          )}
          {step === "persona" && bill && (
            <>
              <h1 style={{ margin: "0 0 6px", fontSize: 28, fontWeight: 800, color: "#0f172a", letterSpacing: "-0.03em" }}>
                Target Your Audience
              </h1>
              <p style={{ margin: 0, color: "#64748b", fontSize: 15 }}>
                Who is your target audience?
              </p>
            </>
          )}
          {step === "review" && (
            <>
              <h1 style={{ margin: "0 0 6px", fontSize: 28, fontWeight: 800, color: "#0f172a", letterSpacing: "-0.03em" }}>
                Review & Distribute
              </h1>
              <p style={{ margin: 0, color: "#64748b", fontSize: 15 }}>
                Edit content before approving — all text is inline-editable
              </p>
            </>
          )}
        </div>

        {step === "dashboard" && (
          <BillQueue onSelectBill={handleSelectBill} synced={synced} setSynced={setSynced} />
        )}
        {step === "persona" && bill && (
          <PersonaBuilder bill={bill} onGenerate={handleGenerate} generating={generating} />
        )}
        {step === "review" && bill && persona && content && (
          <ContentReview
            bill={bill}
            persona={persona}
            content={content}
            onApprove={() => setApproved(true)}
            approved={approved}
          />
        )}
      </main>
    </div>
  );
}
