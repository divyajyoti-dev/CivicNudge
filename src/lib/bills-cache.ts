import { Bill } from "./types";

// Use globalThis so the cache survives Next.js module hot-reloads in dev
const g = globalThis as typeof globalThis & {
  _civicBills?: Bill[];
  _civicLastSync?: Date | null;
};

if (!g._civicBills) g._civicBills = [];
if (g._civicLastSync === undefined) g._civicLastSync = null;

export function getCachedBills(): { bills: Bill[]; lastSync: Date | null } {
  return { bills: g._civicBills!, lastSync: g._civicLastSync ?? null };
}

export function setCachedBills(bills: Bill[]) {
  g._civicBills = bills;
  g._civicLastSync = new Date();
}
