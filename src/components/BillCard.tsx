"use client";
import { useState } from "react";
import { Bill } from "@/lib/types";

const sourceStyle: Record<string, { bg: string; text: string }> = {
  STATE:   { bg: "#e8f0fe", text: "#1a56db" },
  FEDERAL: { bg: "#fce7f3", text: "#9d174d" },
  LOCAL:   { bg: "#d1fae5", text: "#065f46" },
};

interface BillCardProps {
  bill: Bill;
  onSelect: (bill: Bill) => void;
}

export default function BillCard({ bill, onSelect }: BillCardProps) {
  const [hovered, setHovered] = useState(false);
  const src = sourceStyle[bill.source];
  const scoreHigh = bill.score >= 8;

  return (
    <div
      onClick={() => onSelect(bill)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? "#fafaf8" : "#fff",
        borderRadius: 14,
        padding: "18px 22px",
        cursor: "pointer",
        transition: "all 0.15s ease",
        display: "flex",
        alignItems: "center",
        gap: 18,
        boxShadow: hovered ? "0 4px 20px rgba(0,0,0,0.08)" : "0 1px 4px rgba(0,0,0,0.05)",
        border: `1.5px solid ${hovered ? "rgba(37,99,235,0.15)" : "rgba(0,0,0,0.04)"}`,
        transform: hovered ? "translateX(2px)" : "none",
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, flexWrap: "wrap" }}>
          <span
            style={{
              fontFamily: "var(--font-dm-mono), monospace",
              fontSize: 11,
              color: "#94a3b8",
              letterSpacing: "0.04em",
            }}
          >
            {bill.code}
          </span>
          <span
            style={{
              background: src.bg,
              color: src.text,
              padding: "2px 8px",
              borderRadius: 20,
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: "0.05em",
            }}
          >
            {bill.source}
          </span>
          <span
            style={{
              background: "#f1f5f9",
              color: "#64748b",
              padding: "2px 8px",
              borderRadius: 20,
              fontSize: 10,
            }}
          >
            {bill.tag}
          </span>
        </div>
        <div style={{ fontWeight: 600, fontSize: 15, color: "#0f172a", marginBottom: 4, letterSpacing: "-0.01em" }}>
          {bill.title}
        </div>
        <div
          style={{
            fontSize: 13,
            color: "#64748b",
            lineHeight: 1.6,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            maxWidth: 520,
          }}
        >
          {bill.summary}
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8, flexShrink: 0 }}>
        <div
          style={{
            fontFamily: "var(--font-dm-mono), monospace",
            fontWeight: 800,
            fontSize: 20,
            color: scoreHigh ? "#dc2626" : "#d97706",
            lineHeight: 1,
          }}
        >
          {bill.score}
          <span style={{ fontSize: 11, fontWeight: 400, color: "#cbd5e1" }}>/10</span>
        </div>
        <span style={{ fontSize: 11, color: "#94a3b8" }}>{bill.date}</span>
      </div>

      <div
        style={{
          color: "#2563eb",
          fontSize: 16,
          opacity: hovered ? 1 : 0,
          transition: "opacity 0.15s",
          flexShrink: 0,
          transform: "translateX(2px)",
        }}
      >
        →
      </div>
    </div>
  );
}
