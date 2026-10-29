import { n as createMiddleware } from "./ssr.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/format-B09JfAme.js
/**
* Auth middleware for server functions — the standard way to get the caller's
* verified user id. When deployed the session cookie is same-origin and rides
* along automatically. In the live preview the client also forwards the bearer
* token (partitioned cookies) via the `.client` hook below — call sites do not
* thread it themselves.
*
*   import { createServerFn } from "@tanstack/react-start";
*   import { getSql } from "@/lib/db";
*   import { authMiddleware } from "@/lib/auth/middleware";
*
*   export const listTodos = createServerFn({ method: "GET" })
*     .middleware([authMiddleware])
*     .handler(async ({ context }) => {
*       const sql = await getSql();
*       return sql`select * from todos where user_id = ${context.userId}`;
*     });
*
* Signed out with auth on (live preview included) -> throws `UnauthorizedError`
* (see `verify.server.ts`). With auth disabled (`VITE_AUTH_ENABLED=false`, the
* shipped default) it resolves the shared dev user — but throws instead when a
* `DATABASE_URL` is also set, so an app without sign-in must not use this at
* all. On the auth-on path, use it on every server function that touches
* per-user data and scope every query by `context.userId`.
*/
var authMiddleware = createMiddleware({ type: "function" }).client(async ({ next }) => {
	const { getBearerToken } = await import("./client-1vAx-gM_.mjs").then((n) => n.n);
	return next({ sendContext: { bearerToken: getBearerToken() ?? void 0 } });
}).server(async ({ next, context }) => {
	const { assertSameSiteRequest } = await import("./isolation.server-CGNg1r0B.mjs");
	const { requireUserId } = await import("./verify.server-DpHMv7Xw.mjs");
	assertSameSiteRequest();
	return next({ context: { userId: await requireUserId(context.bearerToken) } });
});
var PROBLEM_KINDS = [
	{
		id: "noise",
		side: "housemate",
		label: "Noise after quiet hours"
	},
	{
		id: "chores",
		side: "housemate",
		label: "Chores not done"
	},
	{
		id: "guests",
		side: "housemate",
		label: "Guests staying too long"
	},
	{
		id: "space",
		side: "housemate",
		label: "Shared space left a mess"
	},
	{
		id: "food",
		side: "housemate",
		label: "Food taken or left out"
	},
	{
		id: "bills",
		side: "housemate",
		label: "A bill not paid"
	},
	{
		id: "pets",
		side: "housemate",
		label: "A pet"
	},
	{
		id: "smoking",
		side: "housemate",
		label: "Smoking inside"
	},
	{
		id: "repairs",
		side: "landlord",
		label: "Something needs repairing"
	},
	{
		id: "water",
		side: "landlord",
		label: "Hot water or a leak"
	},
	{
		id: "mould",
		side: "landlord",
		label: "Mould or damp"
	},
	{
		id: "pests",
		side: "landlord",
		label: "Pests"
	},
	{
		id: "locks",
		side: "landlord",
		label: "Locks, keys, or access"
	},
	{
		id: "inspection",
		side: "landlord",
		label: "An inspection"
	},
	{
		id: "bond",
		side: "landlord",
		label: "Bond or a rent change"
	}
];
var WEEK_FACTOR = {
	weekly: 1,
	fortnightly: 2,
	monthly: 4
};
function brisbaneToday(now = /* @__PURE__ */ new Date()) {
	return new Intl.DateTimeFormat("en-CA", {
		timeZone: "Australia/Brisbane",
		year: "numeric",
		month: "2-digit",
		day: "2-digit"
	}).format(now);
}
function atBrisbaneNoon(iso) {
	return /* @__PURE__ */ new Date(`${iso.slice(0, 10)}T12:00:00+10:00`);
}
function prettyDate(iso) {
	return new Intl.DateTimeFormat("en-AU", {
		timeZone: "Australia/Brisbane",
		weekday: "short",
		day: "numeric",
		month: "short"
	}).format(atBrisbaneNoon(iso));
}
function clock(iso) {
	const date = new Date(iso);
	if (Number.isNaN(date.getTime())) return "";
	return new Intl.DateTimeFormat("en-AU", {
		timeZone: "Australia/Brisbane",
		hour: "numeric",
		minute: "2-digit"
	}).format(date);
}
function messageDay(iso) {
	return new Intl.DateTimeFormat("en-CA", {
		timeZone: "Australia/Brisbane",
		year: "numeric",
		month: "2-digit",
		day: "2-digit"
	}).format(new Date(iso));
}
function money(cents) {
	const value = cents / 100;
	return value.toLocaleString("en-AU", {
		style: "currency",
		currency: "AUD",
		maximumFractionDigits: value % 1 === 0 ? 0 : 2
	});
}
function cadenceLabel(cadence) {
	if (cadence === "fortnightly") return "fortnight";
	if (cadence === "monthly") return "month";
	return "week";
}
function toCadence(cents, from, to) {
	const weekly = cents / WEEK_FACTOR[from];
	return Math.round(weekly * WEEK_FACTOR[to]);
}
function addCadence(iso, cadence) {
	const [y, m, d] = iso.slice(0, 10).split("-").map(Number);
	const date = new Date(Date.UTC(y, m - 1, d));
	if (cadence === "weekly") date.setUTCDate(date.getUTCDate() + 7);
	else if (cadence === "fortnightly") date.setUTCDate(date.getUTCDate() + 14);
	else date.setUTCMonth(date.getUTCMonth() + 1);
	return date.toISOString().slice(0, 10);
}
function upcomingDue(dueOn, cadence, today) {
	let cursor = dueOn.slice(0, 10);
	let guard = 0;
	while (cursor < today && guard < 520) {
		cursor = addCadence(cursor, cadence);
		guard += 1;
	}
	return cursor;
}
function kindLabel(kind) {
	if (kind === "bins") return "Bins";
	if (kind === "guest") return "Guest";
	if (kind === "inspection") return "Inspection";
	if (kind === "rent") return "Rent";
	return "Plan";
}
function problemLabel(kind) {
	return PROBLEM_KINDS.find((item) => item.id === kind)?.label ?? "A problem";
}
function monthLabel(year, month) {
	return new Intl.DateTimeFormat("en-AU", {
		month: "long",
		year: "numeric"
	}).format(new Date(Date.UTC(year, month - 1, 1)));
}
function shiftMonth(year, month, delta) {
	const date = new Date(Date.UTC(year, month - 1 + delta, 1));
	return {
		year: date.getUTCFullYear(),
		month: date.getUTCMonth() + 1
	};
}
function monthGrid(year, month) {
	const startPad = (new Date(Date.UTC(year, month - 1, 1)).getUTCDay() + 6) % 7;
	const days = new Date(Date.UTC(year, month, 0)).getUTCDate();
	const cells = [];
	for (let i = 0; i < startPad; i += 1) {
		const date = new Date(Date.UTC(year, month - 1, 1 - (startPad - i)));
		cells.push({
			iso: date.toISOString().slice(0, 10),
			inMonth: false
		});
	}
	for (let day = 1; day <= days; day += 1) {
		const date = new Date(Date.UTC(year, month - 1, day));
		cells.push({
			iso: date.toISOString().slice(0, 10),
			inMonth: true
		});
	}
	while (cells.length % 7 !== 0) {
		const last = cells[cells.length - 1].iso;
		const date = /* @__PURE__ */ new Date(`${last}T00:00:00Z`);
		date.setUTCDate(date.getUTCDate() + 1);
		cells.push({
			iso: date.toISOString().slice(0, 10),
			inMonth: false
		});
	}
	return cells;
}
function isProblemKind(value) {
	return PROBLEM_KINDS.some((item) => item.id === value);
}
//#endregion
export { clock as a, messageDay as c, monthLabel as d, prettyDate as f, upcomingDue as g, toCadence as h, cadenceLabel as i, money as l, shiftMonth as m, authMiddleware as n, isProblemKind as o, problemLabel as p, brisbaneToday as r, kindLabel as s, PROBLEM_KINDS as t, monthGrid as u };
