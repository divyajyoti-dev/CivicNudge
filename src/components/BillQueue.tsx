"use client";
import { useState, useEffect } from "react";
import { Bill } from "@/lib/types";
import { BILLS } from "@/lib/mock-data";
import BillCard from "./BillCard";

const SYNC_STEPS = [
  { label: "Initializing sync engine" },
  { label: "Fetching OpenStates API" },
  { label: "Fetching Congress.gov" },
  { label: "Fetching Berkeley Legistar" },
  { label: "AI triage complete — 5 bills flagged" },
];

function SyncProgress({ onDone }: { onDone: () => void }) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (step < SYNC_STEPS.length) {
      const delay = step === 0 ? 300 : 800;
      const t = setTimeout(() => setStep(s => s + 1), delay);
      return () => clearTimeout(t);
    } else {
      const t = setTimeout(onDone, 700);
      return () => clearTimeout(t);
    }
  }, [step, onDone]);

  return (
    <div
      style={{
        background: "#0f172a",
        borderRadius: 14,
        padding: "20px 24px",
        marginBottom: 28,
        fontFamily: "var(--font-dm-mono), monospace",
      }}
    >
      <div style={{ fontSize: 10, color: "#64748b", letterSpacing: "0.12em", marginBottom: 14 }}>
        NIGHTLY SYNC IN PROGRESS
      </div>
      {SYNC_STEPS.map((s, i) => (
        <div
          key={i}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "4px 0",
            opacity: i < step ? 1 : 0.2,
            transition: "opacity 0.5s ease",
            fontSize: 12,
          }}
        >
          <span style={{ color: i < step ? "#4ade80" : "#334155", fontWeight: 700 }}>
            {i < step ? "✓" : "○"}
          </span>
          <span style={{ color: i < step ? "#e2e8f0" : "#334155" }}>{s.label}</span>
          {i === SYNC_STEPS.length - 1 && i < step && (
            <span
              style={{
                marginLeft: "auto",
                fontSize: 10,
                background: "#dc2626",
                color: "#fff",
                padding: "2px 8px",
                borderRadius: 20,
                fontWeight: 700,
              }}
            >
              5 FLAGGED
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

interface BillQueueProps {
  onSelectBill: (bill: Bill) => void;
  synced: boolean;
  setSynced: (v: boolean) => void;
}

export default function BillQueue({ onSelectBill, synced, setSynced }: BillQueueProps) {
  const [syncing, setSyncing] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = BILLS.filter(
    b =>
      !search ||
      b.title.toLowerCase().includes(search.toLowerCase()) ||
      b.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ maxWidth: 700, margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <div style={{ flex: 1, position: "relative" }}>
          <span
            style={{
              position: "absolute",
              left: 14,
              top: "50%",
              transform: "translateY(-50%)",
              color: "#94a3b8",
              fontSize: 14,
              pointerEvents: "none",
            }}
          >
            ⌕
          </span>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search bills…"
            style={{
              width: "100%",
              padding: "11px 14px 11px 38px",
              border: "1.5px solid rgba(0,0,0,0.08)",
              borderRadius: 10,
              fontSize: 14,
              color: "#0f172a",
              background: "#fff",
              outline: "none",
              boxSizing: "border-box",
              boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
              transition: "border-color 0.15s",
            }}
            onFocus={e => (e.target.style.borderColor = "#2563eb")}
            onBlur={e => (e.target.style.borderColor = "rgba(0,0,0,0.08)")}
          />
        </div>
        <button
          onClick={() => !syncing && !synced && setSyncing(true)}
          style={{
            padding: "11px 20px",
            background: synced ? "#f1f5f9" : "#0f172a",
            color: synced ? "#64748b" : "#fff",
            border: "none",
            borderRadius: 10,
            fontSize: 13,
            fontWeight: 600,
            cursor: synced ? "default" : "pointer",
            whiteSpace: "nowrap",
            letterSpacing: "-0.01em",
            transition: "all 0.2s",
            boxShadow: synced ? "none" : "0 2px 8px rgba(0,0,0,0.15)",
          }}
        >
          {synced ? "✓ Synced" : syncing ? "Syncing…" : "Run Nightly Sync"}
        </button>
      </div>

      {syncing && !synced && (
        <SyncProgress
          onDone={() => {
            setSyncing(false);
            setSynced(true);
          }}
        />
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {filtered.map(bill => (
          <BillCard key={bill.id} bill={bill} onSelect={onSelectBill} />
        ))}
        {filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: "48px 0", color: "#94a3b8", fontSize: 14 }}>
            No bills match your search
          </div>
        )}
      </div>

      <div style={{ marginTop: 24, textAlign: "center", fontSize: 12, color: "#cbd5e1" }}>
        {filtered.length} of 150 bills · sorted by relevance
      </div>
    </div>
  );
}
