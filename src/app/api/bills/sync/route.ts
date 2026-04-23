import { NextResponse } from "next/server";
import { Bill } from "@/lib/types";
import { setCachedBills } from "@/lib/bills-cache";
import { BILLS as MOCK_BILLS } from "@/lib/mock-data";

let idCounter = 100;
function nextId() { return ++idCounter; }

function normalizeOpenStates(item: Record<string, unknown>): Bill {
  return {
    id: nextId(),
    code: String(item.identifier ?? ""),
    title: `${item.identifier}: ${item.title}`,
    source: "STATE",
    score: 5,
    tag: "Legislation",
    date: (item.updated_at as string)?.slice(0, 10) ?? "",
    summary: (item.abstract as string) ?? (item.title as string) ?? "",
    fullText: (item.abstract as string) ?? (item.title as string) ?? "",
  };
}

function normalizeCongress(item: Record<string, unknown>): Bill {
  const num = item.number as string;
  const type = item.type as string;
  const title = item.title as string;
  return {
    id: nextId(),
    code: `${type} ${num}`,
    title: `${type} ${num}: ${title}`,
    source: "FEDERAL",
    score: 5,
    tag: "Legislation",
    date: (item.updateDate as string)?.slice(0, 10) ?? "",
    summary: title,
    fullText: title,
  };
}

function normalizeLegistar(item: Record<string, unknown>): Bill {
  return {
    id: nextId(),
    code: `Berkeley CC`,
    title: `Berkeley: ${item.MatterName ?? item.MatterTitle}`,
    source: "LOCAL",
    score: 5,
    tag: "Local",
    date: (item.MatterLastModifiedUtc as string)?.slice(0, 10) ?? "",
    summary: (item.MatterTitle as string) ?? "",
    fullText: (item.MatterTitle as string) ?? "",
  };
}

async function fetchOpenStates(): Promise<Bill[]> {
  const key = process.env.OPENSTATES_API_KEY;
  if (!key) return [];
  try {
    const res = await fetch(
      "https://v3.openstates.org/bills?jurisdiction=ca&sort=updated_at&per_page=20",
      { headers: { "X-API-KEY": key }, next: { revalidate: 0 } }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return (data.results ?? []).map(normalizeOpenStates);
  } catch {
    return [];
  }
}

async function fetchCongress(): Promise<Bill[]> {
  const key = process.env.CONGRESS_API_KEY;
  if (!key) return [];
  try {
    const res = await fetch(
      `https://api.congress.gov/v3/bill?limit=20&sort=updateDate+desc&api_key=${key}`,
      { next: { revalidate: 0 } }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return (data.bills ?? []).map(normalizeCongress);
  } catch {
    return [];
  }
}

async function fetchLegistar(): Promise<Bill[]> {
  try {
    const res = await fetch(
      "https://webapi.legistar.com/v1/BerkeleyCA/matters?$top=20&$orderby=MatterLastModifiedUtc+desc",
      { next: { revalidate: 0 } }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data.map(normalizeLegistar) : [];
  } catch {
    return [];
  }
}

export async function POST() {
  const [openStates, congress, legistar] = await Promise.all([
    fetchOpenStates(),
    fetchCongress(),
    fetchLegistar(),
  ]);

  const fetched = [...openStates, ...congress, ...legistar];
  // Fall back to curated mock bills when no API keys are configured
  const bills = fetched.length > 0 ? fetched : MOCK_BILLS;
  setCachedBills(bills);

  return NextResponse.json({
    count: bills.length,
    bills,
    usingMockData: fetched.length === 0,
    sources: {
      state: openStates.length,
      federal: congress.length,
      local: legistar.length,
    },
  });
}
