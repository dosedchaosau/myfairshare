import type { Cadence, EventKind, ProblemKind } from "./types";
import { PROBLEM_KINDS } from "./types";

const WEEK_FACTOR: Record<Cadence, number> = { weekly: 1, fortnightly: 2, monthly: 4 };

export function brisbaneToday(now = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Australia/Brisbane",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

function atBrisbaneNoon(iso: string): Date {
  return new Date(`${iso.slice(0, 10)}T12:00:00+10:00`);
}

export function prettyDate(iso: string): string {
  return new Intl.DateTimeFormat("en-AU", {
    timeZone: "Australia/Brisbane",
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(atBrisbaneNoon(iso));
}

export function clock(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-AU", {
    timeZone: "Australia/Brisbane",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export function messageDay(iso: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Australia/Brisbane",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(iso));
}

export function money(cents: number): string {
  const value = cents / 100;
  return value.toLocaleString("en-AU", { style: "currency", currency: "AUD", maximumFractionDigits: value % 1 === 0 ? 0 : 2 });
}

export function cadenceLabel(cadence: Cadence): string {
  if (cadence === "fortnightly") return "fortnight";
  if (cadence === "monthly") return "month";
  return "week";
}

export function toCadence(cents: number, from: Cadence, to: Cadence): number {
  const weekly = cents / WEEK_FACTOR[from];
  return Math.round(weekly * WEEK_FACTOR[to]);
}

export function addCadence(iso: string, cadence: Cadence): string {
  const [y, m, d] = iso.slice(0, 10).split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  if (cadence === "weekly") date.setUTCDate(date.getUTCDate() + 7);
  else if (cadence === "fortnightly") date.setUTCDate(date.getUTCDate() + 14);
  else date.setUTCMonth(date.getUTCMonth() + 1);
  return date.toISOString().slice(0, 10);
}

export function upcomingDue(dueOn: string, cadence: Cadence, today: string): string {
  let cursor = dueOn.slice(0, 10);
  let guard = 0;
  while (cursor < today && guard < 520) {
    cursor = addCadence(cursor, cadence);
    guard += 1;
  }
  return cursor;
}

export function kindLabel(kind: EventKind): string {
  if (kind === "bins") return "Bins";
  if (kind === "guest") return "Guest";
  if (kind === "inspection") return "Inspection";
  if (kind === "rent") return "Rent";
  return "Plan";
}

export function problemLabel(kind: string): string {
  return PROBLEM_KINDS.find((item) => item.id === kind)?.label ?? "A problem";
}

export function monthLabel(year: number, month: number): string {
  return new Intl.DateTimeFormat("en-AU", { month: "long", year: "numeric" }).format(new Date(Date.UTC(year, month - 1, 1)));
}

export function shiftMonth(year: number, month: number, delta: number): { year: number; month: number } {
  const date = new Date(Date.UTC(year, month - 1 + delta, 1));
  return { year: date.getUTCFullYear(), month: date.getUTCMonth() + 1 };
}

export function monthGrid(year: number, month: number): { iso: string; inMonth: boolean }[] {
  const first = new Date(Date.UTC(year, month - 1, 1));
  const startPad = (first.getUTCDay() + 6) % 7;
  const days = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const cells: { iso: string; inMonth: boolean }[] = [];
  for (let i = 0; i < startPad; i += 1) {
    const date = new Date(Date.UTC(year, month - 1, 1 - (startPad - i)));
    cells.push({ iso: date.toISOString().slice(0, 10), inMonth: false });
  }
  for (let day = 1; day <= days; day += 1) {
    const date = new Date(Date.UTC(year, month - 1, day));
    cells.push({ iso: date.toISOString().slice(0, 10), inMonth: true });
  }
  while (cells.length % 7 !== 0) {
    const last = cells[cells.length - 1].iso;
    const date = new Date(`${last}T00:00:00Z`);
    date.setUTCDate(date.getUTCDate() + 1);
    cells.push({ iso: date.toISOString().slice(0, 10), inMonth: false });
  }
  return cells;
}

export function isProblemKind(value: string): value is ProblemKind {
  return PROBLEM_KINDS.some((item) => item.id === value);
}
