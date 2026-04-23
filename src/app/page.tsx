"use client";
import { useState } from "react";
import { Bill, GeneratedCampaign, PersonaParams } from "@/lib/types";
import BillInput from "@/components/BillInput";
import BiasReport from "@/components/BiasReport";
import PersonaBuilder from "@/components/PersonaBuilder";
import ContentReview from "@/components/ContentReview";

const DEFAULT_PERSONA: PersonaParams = {
  occupation: [],
  occupationOther: "",
  familyType: [],
  familyTypeOther: "",
  location: "",
  demographicFocus: "",
  naturalLanguage: "",
  actionBias: "action",
  contentMode: "educate",
  platforms: ["instagram", "sms"],
};

type Step = 1 | 2 | 3;

function StepBar({ current }: { current: Step }) {
  const steps = [
    { n: 1, label: "Add Bill" },
    { n: 2, label: "Your Community" },
    { n: 3, label: "Review" },
  ];
  return (
    <div className="flex items-center gap-0 mb-8">
      {steps.map((s, i) => (
        <div key={s.n} className="flex items-center flex-1">
          <div className={`flex items-center gap-2 ${current >= s.n ? "text-indigo-600" : "text-slate-300"}`}>
            <span className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-colors ${
              current > s.n
                ? "bg-indigo-600 border-indigo-600 text-white"
                : current === s.n
                ? "border-indigo-600 text-indigo-600"
                : "border-slate-200 text-slate-300"
            }`}>
              {current > s.n ? "✓" : s.n}
            </span>
            <span className={`text-sm font-medium hidden sm:block ${current >= s.n ? "text-slate-700" : "text-slate-400"}`}>
              {s.label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div className={`flex-1 h-0.5 mx-3 transition-colors ${current > s.n ? "bg-indigo-600" : "bg-slate-200"}`} />
          )}
        </div>
      ))}
    </div>
  );
}

export default function Home() {
  const [step, setStep] = useState<Step>(1);
  const [bill, setBill] = useState<Bill | null>(null);
  const [billText, setBillText] = useState("");
  const [persona, setPersona] = useState<PersonaParams>(DEFAULT_PERSONA);
  const [loading, setLoading] = useState(false);
  const [campaign, setCampaign] = useState<GeneratedCampaign | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleBillReady(b: Bill, rawText?: string) {
    setBill(b);
    setBillText(rawText ?? b.fullText);
    setStep(2);
    setCampaign(null);
    setError(null);
  }

  async function handleGenerate() {
    if (!bill) return;
    setLoading(true);
    setError(null);
    setCampaign(null);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bill, persona }),
      });
      if (!res.ok) throw new Error("API error");
      const data = await res.json();
      setCampaign(data);
      setStep(3);
    } catch {
      setError("Something went wrong. Check your API key in .env.local and restart the server.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-100 px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
              CN
            </div>
            <div>
              <h1 className="font-bold text-slate-900 leading-none text-base">CivicNudge</h1>
              <p className="text-xs text-slate-400">Policy → People</p>
            </div>
          </div>
          <span className="text-xs text-slate-400 hidden sm:block">Powered by Claude Haiku</span>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        <StepBar current={step} />

        {/* Step 1: Add Bill */}
        <div className={`bg-white rounded-2xl border border-slate-100 shadow-sm p-6 mb-4 ${step !== 1 && bill ? "opacity-60" : ""}`}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-slate-800 text-lg">① Add a Bill</h2>
            {bill && step !== 1 && (
              <button
                onClick={() => { setStep(1); setCampaign(null); }}
                className="text-sm text-indigo-600 hover:underline"
              >
                Change
              </button>
            )}
          </div>

          {bill && step !== 1 ? (
            <div className="flex items-start gap-3">
              <span className={`shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full ${
                bill.source === "STATE" ? "bg-blue-100 text-blue-700" :
                bill.source === "FEDERAL" ? "bg-purple-100 text-purple-700" :
                "bg-emerald-100 text-emerald-700"
              }`}>{bill.source}</span>
              <p className="text-sm text-slate-700 font-medium leading-snug">{bill.title}</p>
            </div>
          ) : (
            <BillInput onBillReady={handleBillReady} />
          )}
        </div>

        {/* Bias report — shown between steps 1 and 2 for uploaded/pasted docs */}
        {step >= 2 && billText && bill?.id.startsWith("uploaded-") && (
          <div className="mb-4">
            <BiasReport billText={billText} />
          </div>
        )}

        {/* Step 2: Community */}
        {step >= 2 && (
          <div className={`bg-white rounded-2xl border border-slate-100 shadow-sm p-6 mb-4 ${step !== 2 && campaign ? "opacity-60" : ""}`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-slate-800 text-lg">② Your Community</h2>
              {campaign && step !== 2 && (
                <button
                  onClick={() => { setStep(2); setCampaign(null); setError(null); }}
                  className="text-sm text-indigo-600 hover:underline"
                >
                  Change
                </button>
              )}
            </div>
            {step === 2 || !campaign ? (
              <>
                <PersonaBuilder
                  persona={persona}
                  onChange={setPersona}
                  onGenerate={handleGenerate}
                  loading={loading}
                />
                {error && (
                  <div className="mt-3 bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">
                    {error}
                  </div>
                )}
              </>
            ) : null}
          </div>
        )}

        {/* Step 3: Review */}
        {step === 3 && campaign && bill && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <h2 className="font-bold text-slate-800 text-lg mb-4">③ Review Campaign</h2>
            <ContentReview
              bill={bill}
              campaign={campaign}
              platforms={persona.platforms}
              contentMode={persona.contentMode}
              onApprove={() => {}}
            />
          </div>
        )}
      </main>
    </div>
  );
}
