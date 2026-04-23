"use client";
import { Bill } from "@/lib/types";

const SOURCE_COLORS: Record<string, string> = {
  STATE: "bg-blue-100 text-blue-700",
  FEDERAL: "bg-purple-100 text-purple-700",
  LOCAL: "bg-emerald-100 text-emerald-700",
};

export default function BillCard({
  bill,
  selected,
  onClick,
}: {
  bill: Bill;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
        selected
          ? "border-indigo-500 bg-indigo-50"
          : "border-slate-200 bg-white hover:border-indigo-300 hover:shadow-sm"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <span
          className={`shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full ${SOURCE_COLORS[bill.source]}`}
        >
          {bill.source}
        </span>
        <span className="shrink-0 text-xs text-slate-400">{bill.date}</span>
      </div>
      <p className="mt-2 font-semibold text-sm text-slate-800 leading-snug">
        {bill.title}
      </p>
      <p className="mt-1 text-xs text-slate-500 line-clamp-2">{bill.summary}</p>
      <div className="mt-2 flex items-center gap-1">
        <span className="text-xs text-slate-400">Relevance</span>
        <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-indigo-500 rounded-full"
            style={{ width: `${(bill.relevanceScore ?? 0) * 10}%` }}
          />
        </div>
        <span className="text-xs font-bold text-indigo-600">
          {bill.relevanceScore}/10
        </span>
      </div>
    </button>
  );
}
