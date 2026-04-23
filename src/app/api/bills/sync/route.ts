import { NextResponse } from "next/server";
import { Bill } from "@/lib/types";
import { setCachedBills } from "@/lib/bills-cache";

function normalizeOpenStates(item: Record<string, unknown>): Bill {
  return {
    id: `os-${item.id}`,
    title: `${item.identifier}: ${item.title}`,
    source: "STATE",
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
    id: `cg-${type}${num}`,
    title: `${type} ${num}: ${title}`,
    source: "FEDERAL",
    date: (item.updateDate as string)?.slice(0, 10) ?? "",
    summary: title,
    fullText: title,
  };
}

function normalizeLegistar(item: Record<string, unknown>): Bill {
  return {
    id: `bk-${item.MatterId}`,
    title: `Berkeley: ${item.MatterName ?? item.MatterTitle}`,
    source: "LOCAL",
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
      "https://webapi.legistar.com/v1/clients/Berkeley/matters?$top=20&$orderby=MatterLastModifiedUtc+desc",
      { next: { revalidate: 0 } }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return data.map(normalizeLegistar);
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

  const bills = [...openStates, ...congress, ...legistar];
  setCachedBills(bills);

  return NextResponse.json({
    count: bills.length,
    bills,
    sources: {
      state: openStates.length,
      federal: congress.length,
      local: legistar.length,
    },
  });
}
