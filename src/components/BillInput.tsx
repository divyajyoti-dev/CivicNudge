"use client";
import { useCallback, useRef, useState } from "react";
import { Bill } from "@/lib/types";

interface LibraryBill {
  id: string;
  title: string;
  source: string;
  date: string;
  summary: string;
}

export default function BillInput({
  onBillReady,
}: {
  onBillReady: (bill: Bill, rawText?: string) => void;
}) {
  const [text, setText] = useState("");
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<{
    count: number;
    sources: Record<string, number>;
  } | null>(null);
  const [query, setQuery] = useState("");
  const [libraryBills, setLibraryBills] = useState<LibraryBill[]>([]);
  const [searching, setSearching] = useState(false);
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  async function runSync() {
    setSyncing(true);
    try {
      const res = await fetch("/api/bills/sync", { method: "POST" });
      const data = await res.json();
      setSyncResult(data);
      // Sync response includes bills directly — no second request needed
      setLibraryBills(data.bills ?? []);
    } finally {
      setSyncing(false);
    }
  }

  function handleSearch(q: string) {
    setQuery(q);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(async () => {
      if (!syncResult) return;
      setSearching(true);
      try {
        const res = await fetch(`/api/bills?q=${encodeURIComponent(q)}`);
        const data = await res.json();
        setLibraryBills(data.bills ?? []);
      } finally {
        setSearching(false);
      }
    }, 300);
  }

  function readFile(file: File) {
    const reader = new FileReader();
    reader.onload = (e) => setText((e.target?.result as string) ?? "");
    reader.readAsText(file);
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) readFile(file);
  }, []);

  function selectLibraryBill(lb: LibraryBill) {
    const fullText = [lb.title, lb.summary].filter(Boolean).join("\n\n");
    const bill: Bill = {
      id: Date.now(),
      code: lb.id,
      title: lb.title,
      source: lb.source as Bill["source"],
      score: 5,
      tag: "Legislation",
      date: lb.date,
      summary: lb.summary,
      fullText,
    };
    onBillReady(bill);
  }

  function confirmPasted() {
    if (!text.trim()) return;
    const bill: Bill = {
      id: Date.now(),
      code: "Custom",
      title: text.trim().split("\n")[0].slice(0, 120) || "Uploaded Bill",
      source: "STATE",
      score: 5,
      tag: "Uploaded",
      date: new Date().toISOString().slice(0, 10),
      summary: text.trim().slice(0, 200),
      fullText: text.trim(),
    };
    onBillReady(bill, text.trim());
  }

  return (
    <div className="space-y-5">
      {/* Paste / Upload */}
      <div>
        <p className="text-sm font-semibold text-slate-700 mb-2">
          Paste or upload a bill document
        </p>
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          className={`relative rounded-xl border-2 border-dashed transition-colors ${
            dragging ? "border-indigo-400 bg-indigo-50" : "border-slate-200 bg-white"
          }`}
        >
          <textarea
            rows={6}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste bill text here, or drag & drop a .txt file…"
            className="w-full px-4 py-3 text-sm text-slate-700 bg-transparent resize-none focus:outline-none placeholder:text-slate-400 rounded-xl"
          />
          {dragging && (
            <div className="absolute inset-0 flex items-center justify-center rounded-xl pointer-events-none">
              <p className="text-indigo-600 font-semibold text-sm">Drop file here</p>
            </div>
          )}
        </div>
        <div className="mt-2 flex items-center gap-3">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="text-sm text-indigo-600 hover:underline flex items-center gap-1"
          >
            📁 Upload file
          </button>
          <input
            ref={fileRef}
            type="file"
            accept=".txt,.pdf,.doc,.docx"
            className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) readFile(f); }}
          />
          {text.trim() && (
            <button
              onClick={confirmPasted}
              className="ml-auto px-4 py-1.5 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700"
            >
              Use this document →
            </button>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <hr className="flex-1 border-slate-200" />
        <span className="text-xs text-slate-400 uppercase tracking-wide">or search the live database</span>
        <hr className="flex-1 border-slate-200" />
      </div>

      {/* Live Sync + Search */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <button
            onClick={runSync}
            disabled={syncing}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white text-sm font-semibold rounded-lg hover:bg-slate-900 disabled:opacity-60 transition-colors"
          >
            {syncing ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                Syncing…
              </>
            ) : (
              <>↻ Sync Now</>
            )}
          </button>
          {syncResult && (
            <span className="text-xs text-slate-500">
              {syncResult.count} bills loaded · {syncResult.sources.state ?? 0} state · {syncResult.sources.federal ?? 0} federal · {syncResult.sources.local ?? 0} local
            </span>
          )}
        </div>

        {syncResult && (
          <div className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search bills…"
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
            <span className="absolute left-3 top-2.5 text-slate-400 text-sm">🔍</span>
            {searching && (
              <span className="absolute right-3 top-2.5 text-slate-400 text-xs">…</span>
            )}
          </div>
        )}

        {libraryBills.length > 0 && (
          <div className="space-y-1 max-h-56 overflow-y-auto pr-1">
            {libraryBills.slice(0, 20).map((bill) => (
              <button
                key={bill.id}
                onClick={() => selectLibraryBill(bill)}
                className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-indigo-50 border border-transparent hover:border-indigo-200 transition-all group"
              >
                <div className="flex items-center gap-2">
                  <span className={`shrink-0 text-xs font-semibold px-1.5 py-0.5 rounded ${
                    bill.source === "STATE" ? "bg-blue-100 text-blue-700" :
                    bill.source === "FEDERAL" ? "bg-purple-100 text-purple-700" :
                    "bg-emerald-100 text-emerald-700"
                  }`}>{bill.source}</span>
                  <p className="text-sm text-slate-700 truncate group-hover:text-indigo-700">{bill.title}</p>
                  <span className="ml-auto shrink-0 text-xs text-slate-400">{bill.date}</span>
                </div>
                {bill.summary && (
                  <p className="text-xs text-slate-400 mt-0.5 ml-8 truncate">{bill.summary}</p>
                )}
              </button>
            ))}
          </div>
        )}

        {syncResult && libraryBills.length === 0 && !searching && (
          <p className="text-sm text-slate-400 text-center py-4">
            {query ? "No bills match your search." : "No bills found. Check your API keys in .env.local."}
          </p>
        )}
      </div>
    </div>
  );
}
