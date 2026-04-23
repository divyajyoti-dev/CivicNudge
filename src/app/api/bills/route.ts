import { NextRequest, NextResponse } from "next/server";
import { getCachedBills } from "@/lib/bills-cache";

export async function GET(req: NextRequest) {
  const { bills, lastSync } = getCachedBills();
  const q = req.nextUrl.searchParams.get("q")?.toLowerCase() ?? "";

  const filtered = q
    ? bills.filter(
        (b) =>
          b.title.toLowerCase().includes(q) ||
          b.summary.toLowerCase().includes(q)
      )
    : bills;

  return NextResponse.json({ bills: filtered, lastSync, total: bills.length });
}
