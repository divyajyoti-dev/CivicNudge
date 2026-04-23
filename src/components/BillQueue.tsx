"use client";
import { useState, useEffect, useRef } from "react";
import { Bill } from "@/lib/types";
import { BILLS as MOCK_BILLS } from "@/lib/mock-data";
import BillCard from "./BillCard";

const SYNC_STEPS = [
  { label: "Initializing sync engine" },
  { label: "Fetching OpenStates API" },
  { label: "Fetching Congress.gov" },
  { label: "Fetching Berkeley Legistar" },
  { label: "AI triage complete — bills flagged" },
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
  const [bills, setBills] = useState<Bill[]>(MOCK_BILLS);
  const [totalCount, setTotalCount] = useState<number>(MOCK_BILLS.length);
  const [syncing, setSyncing] = useState(false);
  const [search, setSearch] = useState("");
  const pendingBills = useRef<Bill[] | null>(null);
  const animDone = useRef(false);

  // Auto-sync on first load
  useEffect(() => {
    if (!synced) startSync();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function startSync() {
    if (syncing || synced) return;
    setSyncing(true);
    animDone.current = false;
    pendingBills.current = null;

    // Fire real API call in parallel with the animation
    fetch("/api/bills/sync", { method: "POST" })
      .then(r => r.json())
      .then(data => {
        const fetched: Bill[] = data.bills ?? [];
        if (animDone.current) {
          // Animation already finished — apply immediately
          if (fetched.length) {
            setBills(fetched);
            setTotalCount(data.count ?? fetched.length);
          }
          setSyncing(false);
          setSynced(true);
        } else {
          // Animation still running — stash for when it finishes
          pendingBills.current = fetched.length ? fetched : null;
          if (fetched.length) setTotalCount(data.count ?? fetched.length);
        }
      })
      .catch(() => {
        // API failed — animation will still finish, just keep current bills
        pendingBills.current = null;
      });
  }

  function handleAnimationDone() {
    animDone.current = true;
    if (pendingBills.current) {
      setBills(pendingBills.current);
    }
    setSyncing(false);
    setSynced(true);
  }

  const filtered = bills.filter(
    b =>
      !search ||
      b.title.toLowerCase().includes(search.toLowerCase()) ||
      (b.code && b.code.toLowerCase().includes(search.toLowerCase()))
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
            onFocus={e => (e.target.style.borderColor = "#0f172a")}
            onBlur={e => (e.target.style.borderColor = "rgba(0,0,0,0.08)")}
          />
        </div>
        <button
          onClick={startSync}
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

      {syncing && <SyncProgress onDone={handleAnimationDone} />}

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
        {filtered.length} of {totalCount} bills · sorted by relevance
      </div>
    </div>
  );
}
