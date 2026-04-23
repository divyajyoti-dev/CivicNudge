"use client";
import { useEffect, useState } from "react";

interface BiasSignal {
  type: string;
  examples?: string[];
  severity: "low" | "medium" | "high";
}

interface BiasResult {
  verdict: "neutral" | "mixed" | "advocacy";
  confidence: number;
  signals: BiasSignal[];
  summary: string;
}

const VERDICT_CONFIG = {
  neutral: {
    icon: "✓",
    label: "Neutral document",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    text: "text-emerald-700",
    iconBg: "bg-emerald-500",
  },
  mixed: {
    icon: "⚠",
    label: "Some bias detected",
    bg: "bg-amber-50",
    border: "border-amber-200",
    text: "text-amber-700",
    iconBg: "bg-amber-500",
  },
  advocacy: {
    icon: "✗",
    label: "Advocacy document",
    bg: "bg-red-50",
    border: "border-red-200",
    text: "text-red-700",
    iconBg: "bg-red-500",
  },
};

const SIGNAL_LABELS: Record<string, string> = {
  loaded_language: "Loaded language",
  framing_asymmetry: "One-sided framing",
  missing_stakeholders: "Missing stakeholders",
  calls_to_action: "Calls to action",
  party_attribution: "Party/political attribution",
};

export default function BiasReport({ billText }: { billText: string }) {
  const [result, setResult] = useState<BiasResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (!billText.trim() || billText.length < 100) return;
    setResult(null);
    setLoading(true);
    fetch("/api/bias", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ billText }),
    })
      .then((r) => r.json())
      .then((data) => { if (!data.error) setResult(data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [billText]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-slate-500 py-2">
        <svg className="animate-spin h-4 w-4 text-indigo-500" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
        </svg>
        Checking document for bias…
      </div>
    );
  }

  if (!result) return null;

  const cfg = VERDICT_CONFIG[result.verdict];

  return (
    <div className={`rounded-xl border ${cfg.bg} ${cfg.border} p-4`}>
      <div className="flex items-center gap-3">
        <span className={`w-7 h-7 rounded-full ${cfg.iconBg} text-white flex items-center justify-center text-sm font-bold`}>
          {cfg.icon}
        </span>
        <div className="flex-1">
          <p className={`text-sm font-semibold ${cfg.text}`}>{cfg.label}</p>
          <p className="text-xs text-slate-500 mt-0.5">{result.summary}</p>
        </div>
        {result.signals.length > 0 && (
          <button
            onClick={() => setExpanded(!expanded)}
            className={`text-xs font-medium ${cfg.text} hover:underline shrink-0`}
          >
            {expanded ? "Hide details" : `${result.signals.length} signal${result.signals.length > 1 ? "s" : ""} →`}
          </button>
        )}
      </div>

      {expanded && result.signals.length > 0 && (
        <div className="mt-3 space-y-2 pl-10">
          {result.signals.map((sig, i) => (
            <div key={i} className="flex items-start gap-2">
              <span className={`shrink-0 text-xs font-semibold px-1.5 py-0.5 rounded ${
                sig.severity === "high" ? "bg-red-100 text-red-600" :
                sig.severity === "medium" ? "bg-amber-100 text-amber-600" :
                "bg-slate-100 text-slate-500"
              }`}>
                {sig.severity}
              </span>
              <div>
                <p className="text-xs font-medium text-slate-700">{SIGNAL_LABELS[sig.type] ?? sig.type}</p>
                {sig.examples && sig.examples.length > 0 && (
                  <p className="text-xs text-slate-400">e.g. "{sig.examples.slice(0, 3).join('", "')}"</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
