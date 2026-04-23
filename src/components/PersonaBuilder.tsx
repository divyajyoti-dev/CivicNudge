"use client";
import { useState } from "react";
import { PersonaParams, Platform } from "@/lib/types";

const OCCUPATIONS = [
  "Student", "Renter", "Gig Worker", "Parent",
  "Retiree", "Small Business Owner", "Union Member", "Other",
];

const FAMILY_TYPES = [
  "Single", "Single Parent", "Couple",
  "Family with kids", "Multigenerational", "Other",
];

const PLATFORMS: { id: Platform; label: string; icon: string }[] = [
  { id: "instagram", label: "Instagram", icon: "📸" },
  { id: "twitter", label: "X / Twitter", icon: "𝕏" },
  { id: "sms", label: "SMS", icon: "💬" },
];

export default function PersonaBuilder({
  persona,
  onChange,
  onGenerate,
  loading,
}: {
  persona: PersonaParams;
  onChange: (p: PersonaParams) => void;
  onGenerate: () => void;
  loading: boolean;
}) {
  const [showExtra, setShowExtra] = useState(false);

  function togglePlatform(id: Platform) {
    const next = persona.platforms.includes(id)
      ? persona.platforms.filter((x) => x !== id)
      : [...persona.platforms, id];
    onChange({ ...persona, platforms: next });
  }

  return (
    <div className="space-y-5">
      {/* Natural language — primary input */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1">
          Who are you reaching?
        </label>
        <textarea
          rows={2}
          value={persona.naturalLanguage}
          onChange={(e) => onChange({ ...persona, naturalLanguage: e.target.value })}
          placeholder="e.g. Spanish-speaking single mothers in East Oakland who rent their homes"
          className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
        />
      </div>

      {/* Structured fields */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wide">Occupation</label>
          <select
            value={persona.occupation[0] ?? ""}
            onChange={(e) => onChange({ ...persona, occupation: [e.target.value], occupationOther: "" })}
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
          >
            <option value="">Select…</option>
            {OCCUPATIONS.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
          {persona.occupation[0] === "Other" && (
            <input
              type="text"
              value={persona.occupationOther}
              onChange={(e) => onChange({ ...persona, occupationOther: e.target.value })}
              placeholder="Describe occupation…"
              className="mt-1.5 w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wide">Family Type</label>
          <select
            value={persona.familyType[0] ?? ""}
            onChange={(e) => onChange({ ...persona, familyType: [e.target.value], familyTypeOther: "" })}
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
          >
            <option value="">Select…</option>
            {FAMILY_TYPES.map((f) => <option key={f} value={f}>{f}</option>)}
          </select>
          {persona.familyType[0] === "Other" && (
            <input
              type="text"
              value={persona.familyTypeOther}
              onChange={(e) => onChange({ ...persona, familyTypeOther: e.target.value })}
              placeholder="Describe family type…"
              className="mt-1.5 w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          )}
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wide">Location</label>
        <input
          type="text"
          value={persona.location}
          onChange={(e) => onChange({ ...persona, location: e.target.value })}
          placeholder="e.g. East Oakland, CA"
          className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />
      </div>

      {/* Extra details — collapsed by default */}
      <button
        type="button"
        onClick={() => setShowExtra(!showExtra)}
        className="text-sm text-indigo-600 hover:underline"
      >
        {showExtra ? "▾ Hide extra details" : "▸ Add more detail (demographic, language)"}
      </button>

      {showExtra && (
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wide">Demographic focus</label>
          <input
            type="text"
            value={persona.demographicFocus}
            onChange={(e) => onChange({ ...persona, demographicFocus: e.target.value })}
            placeholder="e.g. Spanish-speaking, AAPI seniors, formerly incarcerated"
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
        </div>
      )}

      {/* Tone toggle */}
      <div className="flex items-center gap-3">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Tone</span>
        <div className="flex items-center gap-2 ml-2">
          <span className={`text-sm ${persona.actionBias === "inform" ? "text-slate-800 font-semibold" : "text-slate-400"}`}>Inform</span>
          <button
            type="button"
            onClick={() => onChange({ ...persona, actionBias: persona.actionBias === "inform" ? "action" : "inform" })}
            className={`relative w-11 h-6 rounded-full transition-colors ${
              persona.actionBias === "action" ? "bg-indigo-600" : "bg-slate-300"
            }`}
          >
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
              persona.actionBias === "action" ? "translate-x-5" : ""
            }`} />
          </button>
          <span className={`text-sm ${persona.actionBias === "action" ? "text-indigo-600 font-semibold" : "text-slate-400"}`}>Drive to Action</span>
        </div>
      </div>

      {/* Content mode */}
      <div>
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-2">Content Mode</span>
        <div className="flex gap-2">
          {(["educate", "advocate"] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => onChange({ ...persona, contentMode: mode })}
              className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-all ${
                persona.contentMode === mode
                  ? "bg-indigo-600 text-white border-indigo-600"
                  : "bg-white text-slate-600 border-slate-200 hover:border-indigo-300"
              }`}
            >
              {mode === "educate" ? "📚 General Education" : "📣 Campaign Advocacy"}
            </button>
          ))}
        </div>
        <p className="text-xs text-slate-400 mt-1.5">
          {persona.contentMode === "advocate"
            ? "Advocacy content will be clearly labeled in the output."
            : "Neutral, factual tone. No calls to action."}
        </p>
      </div>

      {/* Platforms */}
      <div>
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-2">Output Platforms</span>
        <div className="flex gap-2 flex-wrap">
          {PLATFORMS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => togglePlatform(p.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium border transition-all ${
                persona.platforms.includes(p.id)
                  ? "bg-indigo-600 text-white border-indigo-600"
                  : "bg-white text-slate-600 border-slate-200 hover:border-indigo-300"
              }`}
            >
              <span>{p.icon}</span> {p.label}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={onGenerate}
        disabled={loading || persona.platforms.length === 0}
        className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 text-base"
      >
        {loading ? (
          <>
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
            Generating with Claude…
          </>
        ) : (
          "Generate Campaign ✦"
        )}
      </button>
    </div>
  );
}
