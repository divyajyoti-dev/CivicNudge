"use client";
import { useState } from "react";
const SYNC_STEPS = [
  { label: "Initializing sync engine…", duration: 600 },
  { label: "Fetching OpenStates API…", duration: 700 },
  { label: "Fetching Congress.gov…", duration: 500 },
  { label: "Running AI triage…", duration: 900 },
  { label: "5 high-priority bills flagged", duration: 400 },
];

export default function SyncButton({ onComplete }: { onComplete: () => void }) {
  const [state, setState] = useState<"idle" | "running" | "done">("idle");
  const [stepIndex, setStepIndex] = useState(0);

  async function runSync() {
    setState("running");
    setStepIndex(0);
    for (let i = 0; i < SYNC_STEPS.length; i++) {
      setStepIndex(i);
      await new Promise((r) => setTimeout(r, SYNC_STEPS[i].duration));
    }
    setState("done");
    onComplete();
  }

  if (state === "idle") {
    return (
      <button
        onClick={runSync}
        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 transition-colors"
      >
        <span>▶</span> Run Nightly Sync
      </button>
    );
  }

  if (state === "running") {
    return (
      <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-300 text-amber-700 text-sm font-medium rounded-lg">
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
        </svg>
        {SYNC_STEPS[stepIndex].label}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-300 text-emerald-700 text-sm font-semibold rounded-lg">
      ✓ Sync complete · 5 bills flagged
    </div>
  );
}
