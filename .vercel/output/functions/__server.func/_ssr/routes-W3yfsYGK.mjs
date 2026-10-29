import { o as __toESM } from "../_runtime.mjs";
import { J as require_react, x as require_jsx_runtime, y as Navigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as getServerFnById, i as TSS_SERVER_FUNCTION, r as createServerFn } from "./ssr.mjs";
import { i as signOut, t as authClient } from "./client-1vAx-gM_.mjs";
import { a as hasGateSessionMarker } from "./server-DiJWroI6.mjs";
import { a as TextField, i as TextArea, n as SectionLabel, o as copyText, r as SelectField, s as maskValue, t as Button } from "./ui-DZVu6tQV.mjs";
import { a as House, c as CalendarDays, i as MessageCircle, o as ChevronRight, r as Pencil, s as ChevronLeft, t as Wallet } from "../_libs/lucide-react.mjs";
import { a as clock, c as messageDay, d as monthLabel, f as prettyDate, i as cadenceLabel, l as money, m as shiftMonth, n as authMiddleware, o as isProblemKind, p as problemLabel, s as kindLabel, t as PROBLEM_KINDS, u as monthGrid } from "./format-B09JfAme.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-W3yfsYGK.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/**
* Current user + loading state. Same behavior in live preview and when deployed:
*   - Auth enabled -> the real signed-in user; `user` is `null` while
*                            the session resolves (`isPending: true`) and when
*                            signed out (`isPending: false`). Session comes from
*                            Better Auth `useSession()` → `/api/auth/get-session`
*                            (cookie when deployed; bearer in live preview).
*   - Auth disabled (`VITE_AUTH_ENABLED=false`) -> `DEV_USER`, never pending.
*
* Protect a route by waiting out `isPending` before acting on `user` —
* redirecting on `user: null` alone bounces signed-in visitors to sign-in on
* every hard reload:
*
*   import { RedirectToSignIn } from "@/lib/auth/gates";
*   const { user, isPending } = useCurrentUserState();
*   if (isPending) return null;              // still resolving — don't redirect yet
*   if (!user) return <RedirectToSignIn />;  // definitely signed out
*
* `authEnabled` is a module-level constant fixed at load, so the guarded hook
* call keeps a stable hook order across every render of a given component.
*/
function useCurrentUserState() {
	return useSessionUserState();
}
function useSessionUserState() {
	const { data, isPending } = authClient.useSession();
	const id = data?.user.id;
	const displayName = data?.user.name ?? null;
	const primaryEmail = data?.user.email ?? null;
	const profileImageUrl = data?.user.image ?? null;
	const user = (0, import_react.useMemo)(() => id ? {
		id,
		displayName,
		primaryEmail,
		profileImageUrl,
		isDevFallback: false
	} : null, [
		id,
		displayName,
		primaryEmail,
		profileImageUrl
	]);
	return (0, import_react.useMemo)(() => ({
		user,
		isPending
	}), [user, isPending]);
}
/**
* Convenience view of `useCurrentUserState().user` for display (e.g.
* `user?.displayName ?? "Guest"`). NOTE: `null` means *loading OR signed out* —
* for redirects/guards use `useCurrentUserState()` and check `isPending`.
*/
function useCurrentUser() {
	return useCurrentUserState().user;
}
var subscribeToNothing = () => () => {};
var noGateSessionOnServer = () => false;
/**
* Auth state components — plain wrappers around `useCurrentUserState()`.
*
* With auth on, visitors are signed out until they authenticate — in the sandbox
* live preview too, which does real sign-in. The shared dev user appears only
* when auth is disabled (`VITE_AUTH_ENABLED=false`, the shipped default).
* While the session is still resolving, gates that care about signed-out state
* render nothing so there's no signed-out flash on hard reload.
*/
/** Where `RedirectToSignIn` sends signed-out visitors. Create this route. */
var SIGN_IN_PATH = "/login";
/**
* Client-side redirect to the sign-in route (TanStack `<Navigate>` — NOT a full
* `window.location` reload). A hard navigation re-bootstraps the SPA and re-runs
* session loading, which feels like a second "Loading…" on /login.
*
* Guard routes by waiting out `isPending` first (see `use-current-user`), then
* render this.
*/
function RedirectToSignIn({ to = SIGN_IN_PATH }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navigate, { to });
}
/**
* Minimal signed-in identity chip + sign-out. Restyle freely (see the
* `design-ui` skill). Sign-out is only shown when auth is enabled (the
* disabled-auth dev user has nothing to sign out of) and the session is not
* gate-materialized — behind the gate the next request signs the viewer
* straight back in, so a sign-out control there is a broken loop.
*/
function UserButton() {
	const user = useCurrentUser();
	const [signingOut, setSigningOut] = (0, import_react.useState)(false);
	const gateSession = (0, import_react.useSyncExternalStore)(subscribeToNothing, hasGateSessionMarker, noGateSessionOnServer);
	if (!user) return null;
	const label = user.displayName ?? user.primaryEmail ?? "Account";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-center gap-2",
		children: [
			user.profileImageUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
				src: user.profileImageUrl,
				alt: "",
				className: "h-8 w-8 rounded-full object-cover"
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "grid h-8 w-8 place-items-center rounded-full bg-black/10 text-sm font-medium dark:bg-white/20",
				children: label.charAt(0).toUpperCase()
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-sm font-medium",
				children: label
			}),
			!gateSession && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				disabled: signingOut,
				onClick: () => {
					setSigningOut(true);
					signOut().catch(() => setSigningOut(false));
				},
				className: "cursor-pointer text-sm underline-offset-4 opacity-70 hover:underline disabled:cursor-wait disabled:no-underline",
				children: signingOut ? "Signing out…" : "Sign out"
			})
		]
	});
}
var createSsrRpc = (functionId) => {
	const url = "/_serverFn/" + functionId;
	const serverFnMeta = { id: functionId };
	const fn = async (...args) => {
		return (await getServerFnById(functionId, { origin: "server" }))(...args);
	};
	return Object.assign(fn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
function fail(message) {
	throw new Error(message);
}
function asObject(input) {
	if (!input || typeof input !== "object") fail("That didn't come through.");
	return input;
}
function text(value, max) {
	if (typeof value !== "string") return "";
	return value.trim().slice(0, max);
}
function required(obj, key, max, label) {
	const value = text(obj[key], max);
	if (!value) fail(`Enter ${label}.`);
	return value;
}
function isoDay(value, label) {
	if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) fail(`Pick a date for ${label}.`);
	const [y, m, d] = value.split("-").map(Number);
	const dt = new Date(Date.UTC(y, m - 1, d));
	if (dt.getUTCFullYear() !== y || dt.getUTCMonth() !== m - 1 || dt.getUTCDate() !== d) fail(`Pick a real date for ${label}.`);
	return value;
}
function cadenceOf(value) {
	if (value === "fortnightly" || value === "monthly" || value === "weekly") return value;
	fail("Pick how often.");
}
function dollars(value, label) {
	const amount = typeof value === "number" ? value : Number(value);
	if (!Number.isFinite(amount) || amount < 0 || amount > 1e5) fail(`Enter ${label}.`);
	return Math.round(amount * 100);
}
function whole(value, min, max, label) {
	const amount = typeof value === "number" ? value : Number(value);
	if (!Number.isInteger(amount) || amount < min || amount > max) fail(`Enter ${label}.`);
	return amount;
}
var STATES = /* @__PURE__ */ new Set([
	"ACT",
	"NSW",
	"NT",
	"QLD",
	"SA",
	"TAS",
	"VIC",
	"WA"
]);
function bill(input) {
	const obj = asObject(input);
	return {
		provider: text(obj.provider, 80),
		amountCents: dollars(obj.amount ?? 0, "the amount"),
		cadence: cadenceOf(obj.cadence ?? "monthly")
	};
}
var getHouse = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("ea755c3c44952531e581050fc29494124f1a8b2c986c113476ec02bf874168fa"));
var openSample = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	const obj = asObject(input);
	return {
		displayName: required(obj, "displayName", 80, "your name"),
		weeklyRent: dollars(obj.weeklyRent, "your weekly rent")
	};
}).handler(createSsrRpc("2c23693a47fe74fb982c0af143c128d91694c54583f93179584314af55f69292"));
var tenantShape = (input) => {
	const obj = asObject(input);
	const email = required(obj, "email", 120, "an email address");
	if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) fail("Enter a valid email address.");
	return {
		firstName: required(obj, "firstName", 40, "a first name"),
		lastName: required(obj, "lastName", 40, "a last name"),
		dateOfBirth: isoDay(required(obj, "dateOfBirth", 10, "a date of birth"), "date of birth"),
		email,
		phone: required(obj, "phone", 30, "a phone number"),
		rentAmount: dollars(obj.rentAmount, "the amount they pay")
	};
};
var createHouse = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	const obj = asObject(input);
	const state = required(obj, "state", 3, "a state").toUpperCase();
	if (!STATES.has(state)) fail("Pick a state.");
	const postcode = required(obj, "postcode", 4, "a postcode");
	if (!/^\d{4}$/.test(postcode)) fail("Enter a 4-digit postcode.");
	const capacity = obj.capacity === "landlord" ? "landlord" : "tenant";
	const tenantsRaw = Array.isArray(obj.tenants) ? obj.tenants : [];
	if (tenantsRaw.length > 12) fail("That's more tenants than this house can hold.");
	const utilities = asObject(obj.utilities ?? {});
	return {
		capacity,
		displayName: required(obj, "displayName", 80, "your name"),
		dateOfBirth: isoDay(required(obj, "dateOfBirth", 10, "your date of birth"), "your date of birth"),
		street: required(obj, "street", 120, "a street address"),
		suburb: required(obj, "suburb", 80, "a suburb"),
		state,
		postcode,
		rentAmount: dollars(obj.rentAmount, "the rent amount"),
		dueOn: isoDay(required(obj, "dueOn", 10, "the next rent date"), "rent"),
		cadence: cadenceOf(obj.cadence),
		bedrooms: whole(obj.bedrooms, 1, 20, "the number of bedrooms"),
		bathrooms: whole(obj.bathrooms, 0, 20, "the number of bathrooms"),
		garages: whole(obj.garages, 0, 10, "the number of garages"),
		email: text(obj.email, 120),
		tenants: tenantsRaw.map(tenantShape),
		utilities: {
			power: bill(utilities.power ?? {}),
			water: bill(utilities.water ?? {}),
			internet: bill(utilities.internet ?? {})
		}
	};
}).handler(createSsrRpc("bdafb266ebc111acf7c1ab18a64e89c1f70d8c3f6cfd4ea2964a65605547e610"));
var joinHouse = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	const obj = asObject(input);
	return {
		code: required(obj, "code", 12, "the house code").toUpperCase().replace(/[^A-Z0-9]/g, ""),
		displayName: required(obj, "displayName", 80, "your name"),
		room: text(obj.room, 40),
		weeklyRent: dollars(obj.weeklyRent, "what you pay")
	};
}).handler(createSsrRpc("514e9cdef68a9428c9efa06fd484c7a3b7b82997e601590146f3afb2a91cd169"));
var saveMe = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	const obj = asObject(input);
	const dob = text(obj.dateOfBirth, 10);
	return {
		displayName: required(obj, "displayName", 80, "your name"),
		dateOfBirth: dob ? isoDay(dob, "date of birth") : "",
		email: text(obj.email, 120),
		phone: text(obj.phone, 30)
	};
}).handler(createSsrRpc("f6d8d5cb1b665a8219f8859f29fc3c11f6480a78b46c47ff463f4e9bc26368a2"));
var saveHouse = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	const obj = asObject(input);
	const state = required(obj, "state", 3, "a state").toUpperCase();
	if (!STATES.has(state)) fail("Pick a state.");
	const postcode = required(obj, "postcode", 4, "a postcode");
	if (!/^\d{4}$/.test(postcode)) fail("Enter a 4-digit postcode.");
	const utilities = asObject(obj.utilities ?? {});
	return {
		street: required(obj, "street", 120, "a street address"),
		suburb: required(obj, "suburb", 80, "a suburb"),
		state,
		postcode,
		bedrooms: whole(obj.bedrooms, 1, 20, "the number of bedrooms"),
		bathrooms: whole(obj.bathrooms, 0, 20, "the number of bathrooms"),
		garages: whole(obj.garages, 0, 10, "the number of garages"),
		cadence: cadenceOf(obj.cadence),
		dueOn: isoDay(required(obj, "dueOn", 10, "the next rent date"), "rent"),
		wifiName: text(obj.wifiName, 80),
		wifiPassword: text(obj.wifiPassword, 80),
		bankName: text(obj.bankName, 80),
		bankBsb: text(obj.bankBsb, 20),
		bankAccount: text(obj.bankAccount, 30),
		bankReference: text(obj.bankReference, 40),
		rules: text(obj.rules, 1e3),
		spareNotes: text(obj.spareNotes, 1e3),
		utilities: {
			power: bill(utilities.power ?? {}),
			water: bill(utilities.water ?? {}),
			internet: bill(utilities.internet ?? {})
		}
	};
}).handler(createSsrRpc("cb98da945b0a90bb5573b9eeb3af92d0a8b6f1e6c875f3c64fdd18df8fb3b19b"));
var addMember = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	const obj = asObject(input);
	return {
		displayName: required(obj, "displayName", 80, "their name"),
		room: text(obj.room, 40),
		weeklyRent: dollars(obj.weeklyRent, "what they pay")
	};
}).handler(createSsrRpc("25cc9181e04f24979d1d859431e1f24b1840ad68b3e4277dae696ef29d492e4f"));
var leaveHouse = createServerFn({ method: "POST" }).middleware([authMiddleware]).handler(createSsrRpc("f374c90dca6631b42748315eede584a2bc7e0ab7c6e3342a7a91018077ee522b"));
var deleteProfile = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	return { confirmHouse: asObject(input).confirmHouse === true };
}).handler(createSsrRpc("dcfe7d9c82111da1aed4a7ba1a0a7078d40257d09741d2a5dba8b2f227a7c05a"));
var postMessage = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	return { body: required(asObject(input), "body", 1e3, "a message") };
}).handler(createSsrRpc("f3c2f9e4f197d41f2d875262e8dcff9513f28a92c76df5883282c73d0d503a24"));
var addEvent = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	const obj = asObject(input);
	const kind = obj.kind;
	if (kind !== "plan" && kind !== "bins" && kind !== "guest" && kind !== "inspection" && kind !== "rent") fail("Pick a kind of event.");
	return {
		title: required(obj, "title", 120, "a title"),
		startsOn: isoDay(required(obj, "startsOn", 10, "a date"), "the event"),
		kind,
		notes: text(obj.notes, 500)
	};
}).handler(createSsrRpc("423fa0e72f1137703dc9168a60cc30d76640ba65ed4ffa6c14c3c8085fb27f0c"));
var deleteEvent = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => ({ id: required(asObject(input), "id", 80, "the event") })).handler(createSsrRpc("dbd4daeeee8cc4362f62c333f2e305ff4cc148e7e2dd3321a5869cd8aa7a4d86"));
var reportProblem = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	const obj = asObject(input);
	const kind = required(obj, "kind", 40, "what's wrong");
	if (!isProblemKind(kind)) fail("Pick what's wrong.");
	return {
		kind,
		detail: text(obj.detail, 1e3),
		taggedMemberId: text(obj.taggedMemberId, 80)
	};
}).handler(createSsrRpc("f6a6a1b2eec6efbed08990acb278c273974f436d5930b23bcbd28b351112cb08"));
var sortProblem = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => ({ id: required(asObject(input), "id", 80, "the report") })).handler(createSsrRpc("b1c2b5492952b231374e0ef8a341dcf5aa9695f843f908d9d8cdd6050f86739d"));
var scheduleProblem = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	const obj = asObject(input);
	return {
		id: required(obj, "id", 80, "the report"),
		startsOn: isoDay(required(obj, "startsOn", 10, "a date"), "the calendar")
	};
}).handler(createSsrRpc("bce6fcaf4f322bfcf9f69a7728789cd30fc46d6fb2b31a85edde760e276d553a"));
var markRent = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	const status = asObject(input).status;
	if (status !== "sent" && status !== "due") fail("That status is not valid.");
	return { status };
}).handler(createSsrRpc("4af2e2a08b96b1a6afee70681e07da45ad36d35be330bf28dea397c793be236b"));
function Welcome({ user, busy, error, onSample, onBlank, onJoin }) {
	const [path, setPath] = (0, import_react.useState)("choose");
	const [displayName, setDisplayName] = (0, import_react.useState)(user.displayName ?? "");
	const [weeklyRent, setWeeklyRent] = (0, import_react.useState)("265");
	const [capacity, setCapacity] = (0, import_react.useState)("tenant");
	const [dateOfBirth, setDateOfBirth] = (0, import_react.useState)("");
	const [street, setStreet] = (0, import_react.useState)("");
	const [suburb, setSuburb] = (0, import_react.useState)("");
	const [state, setState] = (0, import_react.useState)("");
	const [postcode, setPostcode] = (0, import_react.useState)("");
	const [rentAmount, setRentAmount] = (0, import_react.useState)("");
	const [dueOn, setDueOn] = (0, import_react.useState)("");
	const [cadence, setCadence] = (0, import_react.useState)("weekly");
	const [bedrooms, setBedrooms] = (0, import_react.useState)("");
	const [bathrooms, setBathrooms] = (0, import_react.useState)("");
	const [garages, setGarages] = (0, import_react.useState)("");
	const [addingTenant, setAddingTenant] = (0, import_react.useState)(false);
	const [tenantError, setTenantError] = (0, import_react.useState)(null);
	const [tenants, setTenants] = (0, import_react.useState)([]);
	const [tenant, setTenant] = (0, import_react.useState)({
		firstName: "",
		lastName: "",
		dateOfBirth: "",
		email: "",
		phone: "",
		rentAmount: ""
	});
	const [room, setRoom] = (0, import_react.useState)("");
	const [code, setCode] = (0, import_react.useState)("");
	const [bills, setBills] = (0, import_react.useState)({
		power: {
			provider: "",
			amount: "",
			cadence: "monthly"
		},
		water: {
			provider: "",
			amount: "",
			cadence: "monthly"
		},
		internet: {
			provider: "",
			amount: "",
			cadence: "monthly"
		}
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "mx-auto grid min-h-dvh max-w-5xl items-start gap-10 bg-paper px-5 py-12 text-ink md:grid-cols-2 md:items-center md:px-10",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm font-medium tracking-wide text-muted uppercase",
				children: "My Fair Share"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "mt-3 font-display text-4xl leading-tight tracking-tight md:text-6xl",
				children: "Move in."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-4 max-w-md text-base text-muted",
				children: "Open a lived-in sample terrace, start a house of your own, or join with a code from someone you live with."
			})
		] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "rounded-xl border border-line bg-sheet p-6 md:p-8",
			children: [
				path === "choose" || path === "join" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextField, {
					label: "Your name on the board",
					value: displayName,
					onChange: (event) => setDisplayName(event.target.value),
					autoComplete: "name"
				}) : null,
				error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					role: "alert",
					className: "mt-3 text-sm text-danger",
					children: error
				}) : null,
				path === "choose" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-5 flex flex-col gap-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextField, {
							label: "Your weekly rent",
							inputMode: "decimal",
							value: weeklyRent,
							onChange: (event) => setWeeklyRent(event.target.value),
							hint: "Australian dollars. You can change the house later."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							className: "w-full",
							disabled: busy,
							onClick: () => void onSample({
								displayName: displayName.trim(),
								weeklyRent: Number(weeklyRent)
							}),
							children: busy ? "Setting the house…" : "Open the sample terrace"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted",
							children: "18 Latrobe Terrace, Paddington. Three housemates, bin night, and this week's rent."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "secondary",
							className: "w-full",
							onClick: () => setPath("blank"),
							children: "Set up a new house"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "secondary",
							className: "w-full",
							onClick: () => setPath("join"),
							children: "Join with a code"
						})
					]
				}) : null,
				path === "blank" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					className: "mt-1 flex flex-col gap-3",
					onSubmit: (event) => {
						event.preventDefault();
						setPath("rooms");
					},
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted",
							children: "You will be the house manager. That can be the landlord, or the first tenant in."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextField, {
							label: "Your name",
							value: displayName,
							onChange: (event) => setDisplayName(event.target.value),
							required: true
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectField, {
							label: "You are",
							value: capacity,
							onChange: (event) => setCapacity(event.target.value === "landlord" ? "landlord" : "tenant"),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "tenant",
								children: "A tenant"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "landlord",
								children: "The landlord"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextField, {
							label: "Date of birth",
							type: "date",
							value: dateOfBirth,
							onChange: (event) => setDateOfBirth(event.target.value),
							required: true
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextField, {
							label: "Rent amount",
							inputMode: "decimal",
							value: rentAmount,
							onChange: (event) => setRentAmount(event.target.value),
							hint: capacity === "landlord" ? "What is due for the house each period. You won't be asked to pay this." : "What is due each period. Because you live here, this is what you owe.",
							required: true
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectField, {
							label: "How often",
							value: cadence,
							onChange: (event) => setCadence(event.target.value === "fortnightly" || event.target.value === "monthly" ? event.target.value : "weekly"),
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "weekly",
									children: "Weekly"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "fortnightly",
									children: "Fortnightly"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "monthly",
									children: "Monthly"
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextField, {
							label: "Next date rent is due",
							type: "date",
							value: dueOn,
							onChange: (event) => setDueOn(event.target.value),
							required: true
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "submit",
							className: "w-full",
							children: "Next"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "quiet",
							onClick: () => setPath("choose"),
							children: "Back"
						})
					]
				}) : null,
				path === "rooms" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					className: "mt-1 flex flex-col gap-3",
					onSubmit: (event) => {
						event.preventDefault();
						setPath("utilities");
					},
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextField, {
							label: "Street address",
							value: street,
							onChange: (event) => setStreet(event.target.value),
							required: true
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextField, {
							label: "Suburb",
							value: suburb,
							onChange: (event) => setSuburb(event.target.value),
							required: true
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectField, {
							label: "State",
							value: state,
							onChange: (event) => setState(event.target.value),
							required: true,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "",
								disabled: true,
								children: "Select a state"
							}), [
								"ACT",
								"NSW",
								"NT",
								"QLD",
								"SA",
								"TAS",
								"VIC",
								"WA"
							].map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: item,
								children: item
							}, item))]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextField, {
							label: "Postcode",
							inputMode: "numeric",
							value: postcode,
							onChange: (event) => setPostcode(event.target.value),
							required: true
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextField, {
							label: "Bedrooms",
							type: "number",
							min: 1,
							value: bedrooms,
							onChange: (event) => setBedrooms(event.target.value),
							required: true
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextField, {
							label: "Bathrooms",
							type: "number",
							min: 0,
							value: bathrooms,
							onChange: (event) => setBathrooms(event.target.value),
							required: true
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextField, {
							label: "Garages",
							type: "number",
							min: 0,
							value: garages,
							onChange: (event) => setGarages(event.target.value),
							required: true
						}),
						tenants.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
							className: "divide-y divide-line border-y border-line",
							children: tenants.map((person, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								className: "flex items-center justify-between gap-3 py-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "min-w-0",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "truncate font-medium",
										children: [
											person.firstName,
											" ",
											person.lastName
										]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "truncate text-sm text-muted",
										children: person.email
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: "quiet",
									onClick: () => setTenants((current) => current.filter((_, item) => item !== index)),
									children: "Remove"
								})]
							}, `${person.email}-${index}`))
						}) : null,
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "secondary",
							className: "w-full",
							onClick: () => setAddingTenant((value) => !value),
							children: addingTenant ? "Close" : "Add tenant"
						}),
						addingTenant ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-col gap-3 rounded-lg border border-line p-4",
							children: [
								["firstName", "lastName"].map((key) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextField, {
									label: key === "firstName" ? "First name" : "Last name",
									value: tenant[key],
									onChange: (event) => setTenant({
										...tenant,
										[key]: event.target.value
									})
								}, key)),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextField, {
									label: "Date of birth",
									type: "date",
									value: tenant.dateOfBirth,
									onChange: (event) => setTenant({
										...tenant,
										dateOfBirth: event.target.value
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextField, {
									label: "Email address",
									type: "email",
									value: tenant.email,
									onChange: (event) => setTenant({
										...tenant,
										email: event.target.value
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextField, {
									label: "Phone number",
									type: "tel",
									value: tenant.phone,
									onChange: (event) => setTenant({
										...tenant,
										phone: event.target.value
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextField, {
									label: "Amount they pay in rent",
									inputMode: "decimal",
									value: tenant.rentAmount,
									onChange: (event) => setTenant({
										...tenant,
										rentAmount: event.target.value
									})
								}),
								tenantError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									role: "alert",
									className: "text-sm text-danger",
									children: tenantError
								}) : null,
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: "secondary",
									onClick: () => {
										if (!tenant.firstName.trim() || !tenant.lastName.trim() || !tenant.dateOfBirth || !tenant.email.trim() || !tenant.phone.trim()) {
											setTenantError("Fill in the tenant's name, date of birth, email, and phone.");
											return;
										}
										if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(tenant.email.trim())) {
											setTenantError("Enter a valid email address.");
											return;
										}
										if (!Number.isFinite(Number(tenant.rentAmount)) || Number(tenant.rentAmount) < 0) {
											setTenantError("Enter the amount they pay in rent.");
											return;
										}
										setTenants((current) => [...current, {
											...tenant,
											firstName: tenant.firstName.trim(),
											lastName: tenant.lastName.trim(),
											email: tenant.email.trim(),
											phone: tenant.phone.trim()
										}]);
										setTenant({
											firstName: "",
											lastName: "",
											dateOfBirth: "",
											email: "",
											phone: "",
											rentAmount: ""
										});
										setTenantError(null);
										setAddingTenant(false);
									},
									children: "Save tenant"
								})
							]
						}) : null,
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "submit",
							className: "w-full",
							children: "Next"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "quiet",
							onClick: () => setPath("blank"),
							children: "Back"
						})
					]
				}) : null,
				path === "utilities" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					className: "mt-1 flex flex-col gap-5",
					onSubmit: (event) => {
						event.preventDefault();
						const pack = (kind) => ({
							...bills[kind],
							amount: Number(bills[kind].amount || 0)
						});
						onBlank({
							capacity,
							displayName: displayName.trim(),
							dateOfBirth,
							street: street.trim(),
							suburb: suburb.trim(),
							state,
							postcode,
							rentAmount: Number(rentAmount),
							dueOn,
							cadence,
							bedrooms: Number(bedrooms),
							bathrooms: Number(bathrooms || 0),
							garages: Number(garages || 0),
							email: user.primaryEmail ?? "",
							tenants: tenants.map((person) => ({
								...person,
								rentAmount: Number(person.rentAmount)
							})),
							utilities: {
								power: pack("power"),
								water: pack("water"),
								internet: pack("internet")
							}
						});
					},
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted",
							children: "These are split evenly between the people who live here, then added to each person's rent."
						}),
						[
							"power",
							"water",
							"internet"
						].map((kind) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-col gap-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "font-medium",
									children: kind === "power" ? "Power" : kind === "water" ? "Water" : "Internet"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextField, {
									label: "Provider",
									value: bills[kind].provider,
									onChange: (event) => setBills((current) => ({
										...current,
										[kind]: {
											...current[kind],
											provider: event.target.value
										}
									}))
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextField, {
									label: "Amount",
									inputMode: "decimal",
									value: bills[kind].amount,
									onChange: (event) => setBills((current) => ({
										...current,
										[kind]: {
											...current[kind],
											amount: event.target.value
										}
									}))
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectField, {
									label: "Payment frequency",
									value: bills[kind].cadence,
									onChange: (event) => setBills((current) => ({
										...current,
										[kind]: {
											...current[kind],
											cadence: event.target.value === "weekly" || event.target.value === "fortnightly" ? event.target.value : "monthly"
										}
									})),
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "weekly",
											children: "Weekly"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "fortnightly",
											children: "Fortnightly"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "monthly",
											children: "Monthly"
										})
									]
								})
							]
						}, kind)),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "submit",
							className: "w-full",
							disabled: busy,
							children: busy ? "Opening…" : "Create the house"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "quiet",
							onClick: () => setPath("rooms"),
							children: "Back"
						})
					]
				}) : null,
				path === "join" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					className: "mt-5 flex flex-col gap-3",
					onSubmit: (event) => {
						event.preventDefault();
						onJoin({
							code: code.trim(),
							displayName: displayName.trim(),
							room: room.trim(),
							weeklyRent: Number(weeklyRent)
						});
					},
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextField, {
							label: "House code",
							value: code,
							onChange: (event) => setCode(event.target.value.toUpperCase()),
							autoCapitalize: "characters",
							required: true
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextField, {
							label: "Your room",
							value: room,
							onChange: (event) => setRoom(event.target.value)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextField, {
							label: "What you pay each period",
							inputMode: "decimal",
							value: weeklyRent,
							onChange: (event) => setWeeklyRent(event.target.value),
							required: true
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "submit",
							className: "w-full",
							disabled: busy,
							children: busy ? "Joining…" : "Join the house"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "quiet",
							onClick: () => setPath("choose"),
							children: "Back"
						})
					]
				}) : null
			]
		})]
	});
}
function nameOf(snap, id) {
	return snap.members.find((member) => member.id === id)?.displayName ?? "Someone who left";
}
function HomeView({ snap, onOpen }) {
	const upcoming = snap.events.filter((event) => event.startsOn >= snap.today).slice(0, 3);
	const last = snap.messages[snap.messages.length - 1];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto flex max-w-3xl flex-col gap-8 px-5 py-6 md:px-10 md:py-10",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionLabel, { children: "Home" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "mt-2 font-display text-4xl tracking-tight",
					children: snap.household.street
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-1 text-muted",
					children: [
						snap.household.suburb,
						" ",
						snap.household.state,
						" ",
						snap.household.postcode
					]
				})
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				onClick: () => onOpen("rent"),
				className: "rounded-lg border border-line bg-sheet px-4 py-4 text-left",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-sm text-muted",
						children: ["You owe · ", prettyDate(snap.rent.period)]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 font-display text-3xl",
						children: snap.rent.livesHere ? money(snap.rent.owedCents) : "Nothing"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-sm text-muted",
						children: snap.rent.livesHere ? `Each ${cadenceLabel(snap.household.cadence)}, including your share of the bills.` : "You manage the house and don't pay rent here."
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionLabel, { children: "Coming up" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "quiet",
					onClick: () => onOpen("calendar"),
					children: "Calendar"
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
				className: "mt-2 flex flex-col gap-2",
				children: [upcoming.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
					className: "text-sm text-muted",
					children: "Nothing dated yet."
				}) : null, upcoming.map((event) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "flex items-baseline gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "w-28 shrink-0 text-sm text-muted",
						children: prettyDate(event.startsOn)
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: event.title })]
				}, event.id))]
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionLabel, { children: "Chat" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "quiet",
					onClick: () => onOpen("chat"),
					children: "Open"
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-base",
				children: last ? `${nameOf(snap, last.memberId)}: ${last.body}` : "No messages yet."
			})] }),
			snap.household.rules ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionLabel, { children: "House rules" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 whitespace-pre-wrap",
				children: snap.household.rules
			})] }) : null
		]
	});
}
function ChatView({ snap, busy, onSend }) {
	const [body, setBody] = (0, import_react.useState)("");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto flex min-h-full max-w-3xl flex-col px-5 py-6 md:px-10 md:py-10",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionLabel, { children: "Chat" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "mt-2 font-display text-4xl tracking-tight",
				children: "The house"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
				className: "mt-6 flex flex-1 flex-col gap-4",
				children: [snap.messages.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
					className: "text-sm text-muted",
					children: "Say something the house should see."
				}) : null, snap.messages.map((message) => {
					const day = messageDay(message.createdAt);
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-sm text-muted",
						children: [
							nameOf(snap, message.memberId),
							" · ",
							day === snap.today ? "Today" : prettyDate(day),
							" · ",
							clock(message.createdAt)
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "whitespace-pre-wrap",
						children: message.body
					})] }, message.id);
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "mt-6 flex flex-col gap-3",
				onSubmit: (event) => {
					event.preventDefault();
					onSend(body.trim()).then((ok) => {
						if (ok) setBody("");
					});
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextArea, {
					label: "Message",
					value: body,
					onChange: (event) => setBody(event.target.value),
					required: true
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "submit",
					disabled: busy,
					children: "Send"
				})]
			})
		]
	});
}
function CalendarView({ snap, selected, busy, onSelect, onAdd, onDelete }) {
	const [cursor, setCursor] = (0, import_react.useState)(() => {
		const [year, month] = (selected || snap.today).split("-").map(Number);
		return {
			year,
			month
		};
	});
	const [open, setOpen] = (0, import_react.useState)(false);
	const [title, setTitle] = (0, import_react.useState)("");
	const [kind, setKind] = (0, import_react.useState)("plan");
	const [notes, setNotes] = (0, import_react.useState)("");
	const cells = monthGrid(cursor.year, cursor.month);
	const dayEvents = snap.events.filter((event) => event.startsOn === selected);
	const upcoming = snap.events.filter((event) => event.startsOn >= snap.today).slice(0, 5);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto flex max-w-3xl flex-col gap-6 px-5 py-6 md:px-10 md:py-10",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "flex items-end justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionLabel, { children: "Calendar" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "mt-2 font-display text-4xl tracking-tight",
					children: monthLabel(cursor.year, cursor.month)
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "secondary",
						"aria-label": "Previous month",
						onClick: () => setCursor((current) => shiftMonth(current.year, current.month, -1)),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronLeft, {
							"aria-hidden": true,
							size: 18
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "secondary",
						"aria-label": "Next month",
						onClick: () => setCursor((current) => shiftMonth(current.year, current.month, 1)),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, {
							"aria-hidden": true,
							size: 18
						})
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-7 gap-1 text-center text-sm text-muted",
				children: [[
					"Mon",
					"Tue",
					"Wed",
					"Thu",
					"Fri",
					"Sat",
					"Sun"
				].map((label) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "h-8 leading-8",
					children: label
				}, label)), cells.map((cell) => {
					const has = snap.events.some((event) => event.startsOn === cell.iso);
					const isSelected = cell.iso === selected;
					const isToday = cell.iso === snap.today;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => {
							onSelect(cell.iso);
							const [year, month] = cell.iso.split("-").map(Number);
							if (year && month) setCursor({
								year,
								month
							});
						},
						className: `flex h-11 flex-col items-center justify-center rounded-md border text-sm tabular-nums focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink ${isSelected ? "border-ink bg-ink text-paper" : isToday ? "border-ink bg-sheet" : cell.inMonth ? "border-line bg-sheet" : "border-transparent text-faint"}`,
						children: [Number(cell.iso.slice(8)), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: `h-1 w-1 rounded-full ${has ? isSelected ? "bg-accent-soft" : "bg-ink" : "bg-transparent"}` })]
					}, cell.iso);
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display text-2xl tracking-tight",
						children: prettyDate(selected || snap.today)
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						onClick: () => setOpen((value) => !value),
						children: open ? "Close" : "Add event"
					})]
				}),
				open ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					className: "mt-4 flex flex-col gap-3 rounded-lg border border-line bg-sheet p-4",
					onSubmit: (event) => {
						event.preventDefault();
						onAdd({
							title: title.trim(),
							startsOn: selected || snap.today,
							kind,
							notes: notes.trim()
						}).then((ok) => {
							if (!ok) return;
							setTitle("");
							setNotes("");
							setKind("plan");
							setOpen(false);
						});
					},
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextField, {
							label: "Title",
							value: title,
							onChange: (event) => setTitle(event.target.value),
							required: true
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectField, {
							label: "Kind",
							value: kind,
							onChange: (event) => setKind(event.target.value),
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "plan",
									children: "Plan"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "bins",
									children: "Bins"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "guest",
									children: "Guest"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "inspection",
									children: "Inspection"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "rent",
									children: "Rent"
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextArea, {
							label: "Notes",
							value: notes,
							onChange: (event) => setNotes(event.target.value)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "submit",
							disabled: busy,
							children: "Add to the calendar"
						})
					]
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
					className: "mt-4 flex flex-col gap-3",
					children: [dayEvents.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
						className: "text-sm text-muted",
						children: "Nothing on this day."
					}) : null, dayEvents.map((event) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "rounded-lg border border-line bg-sheet px-4 py-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm text-muted",
								children: kindLabel(event.kind)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-medium",
								children: event.title
							}),
							event.notes ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 whitespace-pre-wrap",
								children: event.notes
							}) : null,
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-sm text-muted",
								children: nameOf(snap, event.memberId)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "quiet",
								className: "px-0",
								disabled: busy,
								onClick: () => onDelete(event.id),
								children: "Remove"
							})
						]
					}, event.id))]
				})
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionLabel, { children: "Coming up" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-3 flex flex-col gap-2",
				children: upcoming.map((event) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					className: "flex min-h-11 w-full items-center gap-3 text-left",
					onClick: () => onSelect(event.startsOn),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "w-28 shrink-0 text-sm text-muted",
						children: prettyDate(event.startsOn)
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "truncate",
						children: event.title
					})]
				}) }, event.id))
			})] })
		]
	});
}
function HouseView({ snap, busy, onSave, onAddMember, onLeave, onReport, onSort, onSchedule }) {
	const [editing, setEditing] = (0, import_react.useState)(false);
	const [adding, setAdding] = (0, import_react.useState)(false);
	const [mate, setMate] = (0, import_react.useState)({
		displayName: "",
		room: "",
		weeklyRent: ""
	});
	const [draft, setDraft] = (0, import_react.useState)({
		street: snap.household.street,
		suburb: snap.household.suburb,
		state: snap.household.state,
		postcode: snap.household.postcode,
		bedrooms: String(snap.household.bedrooms),
		bathrooms: String(snap.household.bathrooms),
		garages: String(snap.household.garages),
		cadence: snap.household.cadence,
		dueOn: snap.household.dueOn,
		wifiName: snap.household.wifiName,
		wifiPassword: snap.household.wifiPassword,
		bankName: snap.household.bankName,
		bankBsb: snap.household.bankBsb,
		bankAccount: snap.household.bankAccount,
		bankReference: snap.household.bankReference,
		rules: snap.household.rules,
		spareNotes: snap.household.spareNotes,
		powerProvider: snap.utilities.find((row) => row.kind === "power")?.provider ?? "",
		powerAmount: String((snap.utilities.find((row) => row.kind === "power")?.amountCents ?? 0) / 100),
		powerCadence: snap.utilities.find((row) => row.kind === "power")?.cadence ?? "monthly",
		waterProvider: snap.utilities.find((row) => row.kind === "water")?.provider ?? "",
		waterAmount: String((snap.utilities.find((row) => row.kind === "water")?.amountCents ?? 0) / 100),
		waterCadence: snap.utilities.find((row) => row.kind === "water")?.cadence ?? "monthly",
		internetProvider: snap.utilities.find((row) => row.kind === "internet")?.provider ?? "",
		internetAmount: String((snap.utilities.find((row) => row.kind === "internet")?.amountCents ?? 0) / 100),
		internetCadence: snap.utilities.find((row) => row.kind === "internet")?.cadence ?? "monthly"
	});
	const house = snap.household;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto flex max-w-3xl flex-col gap-8 px-5 py-6 md:px-10 md:py-10",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "flex items-start justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionLabel, { children: "House" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "mt-2 font-display text-4xl tracking-tight",
					children: house.street
				})] }), snap.youLead ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					"aria-label": "Edit the house",
					onClick: () => setEditing((value) => !value),
					className: "grid h-11 w-11 place-items-center rounded-full text-ink",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, { size: 16 })
				}) : null]
			}),
			editing && snap.youLead ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "flex flex-col gap-3",
				onSubmit: (event) => {
					event.preventDefault();
					const pack = (kind) => ({
						provider: draft[`${kind}Provider`],
						amount: Number(draft[`${kind}Amount`] || 0),
						cadence: draft[`${kind}Cadence`]
					});
					onSave({
						...draft,
						bedrooms: Number(draft.bedrooms),
						bathrooms: Number(draft.bathrooms),
						garages: Number(draft.garages),
						utilities: {
							power: pack("power"),
							water: pack("water"),
							internet: pack("internet")
						}
					}).then((ok) => {
						if (ok) setEditing(false);
					});
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextField, {
						label: "Street address",
						value: draft.street,
						onChange: (event) => setDraft({
							...draft,
							street: event.target.value
						}),
						required: true
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextField, {
						label: "Suburb",
						value: draft.suburb,
						onChange: (event) => setDraft({
							...draft,
							suburb: event.target.value
						}),
						required: true
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectField, {
						label: "State",
						value: draft.state,
						onChange: (event) => setDraft({
							...draft,
							state: event.target.value
						}),
						children: [
							"ACT",
							"NSW",
							"NT",
							"QLD",
							"SA",
							"TAS",
							"VIC",
							"WA"
						].map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: item }, item))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextField, {
						label: "Postcode",
						value: draft.postcode,
						onChange: (event) => setDraft({
							...draft,
							postcode: event.target.value
						}),
						required: true
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextField, {
						label: "Bedrooms",
						type: "number",
						value: draft.bedrooms,
						onChange: (event) => setDraft({
							...draft,
							bedrooms: event.target.value
						}),
						required: true
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextField, {
						label: "Bathrooms",
						type: "number",
						value: draft.bathrooms,
						onChange: (event) => setDraft({
							...draft,
							bathrooms: event.target.value
						}),
						required: true
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextField, {
						label: "Garages",
						type: "number",
						value: draft.garages,
						onChange: (event) => setDraft({
							...draft,
							garages: event.target.value
						}),
						required: true
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectField, {
						label: "How often rent is due",
						value: draft.cadence,
						onChange: (event) => setDraft({
							...draft,
							cadence: event.target.value === "fortnightly" || event.target.value === "monthly" ? event.target.value : "weekly"
						}),
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "weekly",
								children: "Weekly"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "fortnightly",
								children: "Fortnightly"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "monthly",
								children: "Monthly"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextField, {
						label: "Next date rent is due",
						type: "date",
						value: draft.dueOn,
						onChange: (event) => setDraft({
							...draft,
							dueOn: event.target.value
						}),
						required: true
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextField, {
						label: "Wi-Fi name",
						value: draft.wifiName,
						onChange: (event) => setDraft({
							...draft,
							wifiName: event.target.value
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextField, {
						label: "Wi-Fi password",
						value: draft.wifiPassword,
						onChange: (event) => setDraft({
							...draft,
							wifiPassword: event.target.value
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextField, {
						label: "Account name",
						value: draft.bankName,
						onChange: (event) => setDraft({
							...draft,
							bankName: event.target.value
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextField, {
						label: "BSB",
						value: draft.bankBsb,
						onChange: (event) => setDraft({
							...draft,
							bankBsb: event.target.value
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextField, {
						label: "Account number",
						value: draft.bankAccount,
						onChange: (event) => setDraft({
							...draft,
							bankAccount: event.target.value
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextField, {
						label: "Reference",
						value: draft.bankReference,
						onChange: (event) => setDraft({
							...draft,
							bankReference: event.target.value
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextArea, {
						label: "House rules",
						value: draft.rules,
						onChange: (event) => setDraft({
							...draft,
							rules: event.target.value
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextArea, {
						label: "Spare key and notes",
						value: draft.spareNotes,
						onChange: (event) => setDraft({
							...draft,
							spareNotes: event.target.value
						})
					}),
					[
						"power",
						"water",
						"internet"
					].map((kind) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-col gap-3 border-t border-line pt-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-medium",
								children: kind[0].toUpperCase() + kind.slice(1)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextField, {
								label: "Provider",
								value: draft[`${kind}Provider`],
								onChange: (event) => setDraft({
									...draft,
									[`${kind}Provider`]: event.target.value
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextField, {
								label: "Amount",
								inputMode: "decimal",
								value: draft[`${kind}Amount`],
								onChange: (event) => setDraft({
									...draft,
									[`${kind}Amount`]: event.target.value
								})
							})
						]
					}, kind)),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "submit",
						disabled: busy,
						children: "Save the house"
					})
				]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-2 gap-x-6 gap-y-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Fact, {
						title: "Suburb",
						body: `${house.suburb}, ${house.state} ${house.postcode}`
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Fact, {
						title: "Bedrooms",
						body: String(house.bedrooms)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Fact, {
						title: "Bathrooms",
						body: String(house.bathrooms)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Fact, {
						title: "Garages",
						body: String(house.garages)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Fact, {
						title: "Rent",
						body: `Due ${prettyDate(house.dueOn)}, each ${cadenceLabel(house.cadence)}`
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Secret, {
						title: "Wi-Fi",
						value: [house.wifiName, house.wifiPassword].filter(Boolean).join("\n"),
						empty: "Not set"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Secret, {
						title: "Bank transfer",
						value: [
							house.bankName,
							house.bankBsb,
							house.bankAccount,
							house.bankReference
						].filter(Boolean).join("\n"),
						empty: "Not set"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CopyFact, {
						title: "Invite code",
						value: house.inviteCode
					})
				]
			}),
			house.spareNotes && !editing ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionLabel, { children: "Notes" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 whitespace-pre-wrap",
				children: house.spareNotes
			})] }) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Problems, {
				snap,
				busy,
				onReport,
				onSort,
				onSchedule
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionLabel, { children: "People" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "mt-3 divide-y divide-line border-y border-line",
					children: snap.members.map((member) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "py-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "font-medium",
								children: [
									member.displayName,
									member.isYou ? " (you)" : "",
									member.role === "lead" ? " · house manager" : ""
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-sm text-muted",
								children: [member.room || "No room yet", member.onApp ? "" : " · not on the app yet"]
							}),
							member.email ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm text-muted",
								children: member.email
							}) : null
						]
					}, member.id))
				}),
				snap.youLead ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "secondary",
						onClick: () => setAdding((value) => !value),
						children: adding ? "Close" : "Add a housemate"
					}), adding ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
						className: "mt-3 flex flex-col gap-3",
						onSubmit: (event) => {
							event.preventDefault();
							onAddMember({
								displayName: mate.displayName.trim(),
								room: mate.room.trim(),
								weeklyRent: Number(mate.weeklyRent)
							}).then((ok) => {
								if (ok) {
									setMate({
										displayName: "",
										room: "",
										weeklyRent: ""
									});
									setAdding(false);
								}
							});
						},
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextField, {
								label: "Name",
								value: mate.displayName,
								onChange: (event) => setMate({
									...mate,
									displayName: event.target.value
								}),
								required: true
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextField, {
								label: "Room",
								value: mate.room,
								onChange: (event) => setMate({
									...mate,
									room: event.target.value
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextField, {
								label: "What they pay each period",
								inputMode: "decimal",
								value: mate.weeklyRent,
								onChange: (event) => setMate({
									...mate,
									weeklyRent: event.target.value
								}),
								required: true
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "submit",
								disabled: busy,
								children: "Add"
							})
						]
					}) : null]
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "quiet",
					className: "mt-4 px-0",
					disabled: busy,
					onClick: () => void onLeave(),
					children: "Leave this house"
				})
			] })
		]
	});
}
function Fact({ title, body }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
		className: "text-sm font-medium text-muted",
		children: title
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "mt-1 whitespace-pre-wrap",
		children: body
	})] });
}
function CopyFact({ title, value }) {
	const [note, setNote] = (0, import_react.useState)("");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
			className: "text-sm font-medium text-muted",
			children: title
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			className: "mt-1 text-left font-medium tracking-wide",
			onClick: () => void copyText(value).then((ok) => setNote(ok ? "Copied" : "Couldn't copy")),
			children: value
		}),
		note ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm text-muted",
			children: note
		}) : null
	] });
}
function Secret({ title, value, empty }) {
	const [shown, setShown] = (0, import_react.useState)(false);
	const [note, setNote] = (0, import_react.useState)("");
	const display = value ? shown ? value : maskValue(value) : empty;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center justify-between gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "text-sm font-medium text-muted",
				children: title
			}), value ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				className: "h-11 px-1 text-sm font-medium text-muted",
				onClick: () => setShown((current) => !current),
				children: shown ? "HIDE" : "SHOW"
			}) : null]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			className: "mt-1 text-left whitespace-pre-wrap",
			disabled: !value,
			onClick: () => {
				if (!value) return;
				copyText(value).then((ok) => setNote(ok ? "Copied" : "Couldn't copy"));
			},
			children: display
		}),
		note ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm text-muted",
			children: note
		}) : null
	] });
}
function Problems({ snap, busy, onReport, onSort, onSchedule }) {
	const [open, setOpen] = (0, import_react.useState)(false);
	const [kind, setKind] = (0, import_react.useState)("noise");
	const [detail, setDetail] = (0, import_react.useState)("");
	const [taggedMemberId, setTaggedMemberId] = (0, import_react.useState)("");
	const [scheduleId, setScheduleId] = (0, import_react.useState)("");
	const [scheduleDay, setScheduleDay] = (0, import_react.useState)(snap.today);
	const manager = snap.members.find((member) => member.role === "lead");
	const others = snap.members.filter((member) => !member.isYou);
	const housemate = PROBLEM_KINDS.filter((item) => item.side === "housemate");
	const landlord = PROBLEM_KINDS.filter((item) => item.side === "landlord");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionLabel, { children: "Problems" }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "mt-2 text-sm text-muted",
			children: [snap.youLead ? "Reports come to you, as house manager. Include a housemate if it involves them." : `Goes to the house manager${manager ? `, ${manager.displayName}` : ""}. Include a housemate if it involves them.`, " If you are unsafe, call triple zero."]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			variant: "secondary",
			className: "mt-3",
			onClick: () => setOpen((value) => !value),
			children: open ? "Close" : "Report a problem"
		}),
		open ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
			className: "mt-3 flex flex-col gap-3",
			onSubmit: (event) => {
				event.preventDefault();
				onReport({
					kind,
					detail: detail.trim(),
					taggedMemberId
				}).then((ok) => {
					if (ok) {
						setDetail("");
						setTaggedMemberId("");
						setOpen(false);
					}
				});
			},
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectField, {
					label: "What's wrong",
					value: kind,
					onChange: (event) => setKind(event.target.value),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("optgroup", {
						label: "With a housemate",
						children: housemate.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: item.id,
							children: item.label
						}, item.id))
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("optgroup", {
						label: "With the landlord",
						children: landlord.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: item.id,
							children: item.label
						}, item.id))
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectField, {
					label: "Include a housemate",
					value: taggedMemberId,
					onChange: (event) => setTaggedMemberId(event.target.value),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
						value: "",
						children: "No one else"
					}), others.map((member) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
						value: member.id,
						children: member.displayName
					}, member.id))]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextArea, {
					label: "What happened",
					value: detail,
					onChange: (event) => setDetail(event.target.value),
					placeholder: "Optional. Say when, and which room."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "submit",
					disabled: busy,
					children: manager && !snap.youLead ? `Send to ${manager.displayName}` : "Send"
				})
			]
		}) : null,
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
			className: "mt-4 flex flex-col gap-3",
			children: [snap.problems.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
				className: "text-sm text-muted",
				children: snap.youLead ? "Nothing has been sent to you." : "You have not sent a report."
			}) : null, snap.problems.map((problem) => {
				const tagged = problem.taggedMemberId ? nameOf(snap, problem.taggedMemberId) : "";
				const booked = snap.events.find((event) => event.id === problem.eventId);
				const canSort = problem.status === "open" && (problem.memberId === snap.you.id || snap.youLead);
				const day = messageDay(problem.createdAt);
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "rounded-lg border border-line bg-sheet px-4 py-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-sm text-muted",
							children: [
								problem.side === "landlord" ? "Landlord" : "Housemate",
								" · ",
								problem.status === "sorted" ? "Sorted" : "Open"
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-medium",
							children: problemLabel(problem.kind)
						}),
						problem.detail ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 whitespace-pre-wrap",
							children: problem.detail
						}) : null,
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-1 text-sm text-muted",
							children: [
								nameOf(snap, problem.memberId),
								tagged ? ` · Includes ${tagged}` : "",
								" · ",
								day === snap.today ? "Today" : prettyDate(day),
								" · ",
								clock(problem.createdAt)
							]
						}),
						booked ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-1 text-sm text-muted",
							children: ["On the calendar · ", prettyDate(booked.startsOn)]
						}) : null,
						snap.youLead && !booked ? scheduleId === problem.id ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
							className: "mt-3 flex flex-col gap-3",
							onSubmit: (event) => {
								event.preventDefault();
								onSchedule({
									id: problem.id,
									startsOn: scheduleDay
								}).then((ok) => {
									if (ok) setScheduleId("");
								});
							},
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextField, {
									label: "Day",
									type: "date",
									value: scheduleDay,
									onChange: (event) => setScheduleDay(event.target.value),
									required: true
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-sm text-muted",
									children: "Everyone in the house will see this on the calendar."
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex flex-wrap gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										type: "submit",
										disabled: busy,
										children: "Add to the calendar"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										variant: "secondary",
										type: "button",
										onClick: () => setScheduleId(""),
										children: "Cancel"
									})]
								})
							]
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "secondary",
							className: "mt-3",
							disabled: busy,
							onClick: () => {
								setScheduleId(problem.id);
								setScheduleDay(snap.today);
							},
							children: "Add to the calendar"
						}) : null,
						canSort ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "quiet",
							className: "mt-1 px-0",
							disabled: busy,
							onClick: () => void onSort(problem.id),
							children: "Mark sorted"
						}) : null
					]
				}, problem.id);
			})]
		})
	] });
}
function RentView({ snap, busy, onMark }) {
	const { rent, household } = snap;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto flex max-w-3xl flex-col gap-6 px-5 py-6 md:px-10 md:py-10",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionLabel, { children: "Rent" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-4xl tracking-tight",
				children: rent.livesHere ? money(rent.owedCents) : "Nothing due"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-muted",
				children: rent.livesHere ? `Due ${prettyDate(rent.period)}. This is only your share.` : "You are the house manager and you don't live here, so you are not asked to pay."
			}),
			rent.livesHere ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
				className: "flex flex-col gap-2 border-y border-line py-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "flex justify-between gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Your rent" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: money(rent.rentCents) })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "flex justify-between gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Your share of the bills" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: money(rent.utilityCents) })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "flex justify-between gap-3 font-medium",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["Each ", cadenceLabel(household.cadence)] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: money(rent.owedCents) })]
					})
				]
			}) : null,
			rent.livesHere ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "secondary",
				disabled: busy,
				onClick: () => void onMark(rent.status === "sent" ? "due" : "sent"),
				children: rent.status === "sent" ? "Marked as sent" : "I've sent it"
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SecretBlock, {
				title: "Pay by bank transfer",
				lines: [
					household.bankName,
					household.bankBsb,
					household.bankAccount,
					household.bankReference
				]
			})
		]
	});
}
function SecretBlock({ title, lines }) {
	const value = lines.filter(Boolean).join("\n");
	const [shown, setShown] = (0, import_react.useState)(false);
	const [note, setNote] = (0, import_react.useState)("");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center justify-between",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "text-sm font-medium text-muted",
				children: title
			}), value ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				className: "h-11 text-sm font-medium",
				onClick: () => setShown((current) => !current),
				children: shown ? "HIDE" : "SHOW"
			}) : null]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			className: "mt-1 text-left whitespace-pre-wrap",
			disabled: !value,
			onClick: () => void copyText(value).then((ok) => setNote(ok ? "Copied" : "Couldn't copy")),
			children: value ? shown ? value : maskValue(value) : "Not set yet"
		}),
		note ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm text-muted",
			children: note
		}) : null
	] });
}
function ProfileView({ snap, busy, onSave, onDelete, onClose }) {
	const [name, setName] = (0, import_react.useState)(snap.you.displayName);
	const [dob, setDob] = (0, import_react.useState)(snap.you.dateOfBirth);
	const [email, setEmail] = (0, import_react.useState)(snap.you.email);
	const [phone, setPhone] = (0, import_react.useState)(snap.you.phone);
	const [step, setStep] = (0, import_react.useState)("idle");
	const last = snap.members.length === 1;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto flex max-w-xl flex-col gap-4 px-5 py-6 md:px-10 md:py-10",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "quiet",
				className: "self-start px-0",
				onClick: onClose,
				children: "Back"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-4xl tracking-tight",
				children: "Your details"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "flex flex-col gap-3",
				onSubmit: (event) => {
					event.preventDefault();
					onSave({
						displayName: name.trim(),
						dateOfBirth: dob,
						email: email.trim(),
						phone: phone.trim()
					});
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextField, {
						label: "Name",
						value: name,
						onChange: (event) => setName(event.target.value),
						required: true
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextField, {
						label: "Date of birth",
						type: "date",
						value: dob,
						onChange: (event) => setDob(event.target.value)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextField, {
						label: "Email address",
						type: "email",
						value: email,
						onChange: (event) => setEmail(event.target.value)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextField, {
						label: "Phone number",
						type: "tel",
						value: phone,
						onChange: (event) => setPhone(event.target.value)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "submit",
						disabled: busy,
						children: "Save"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-8 border-t border-line pt-6",
				children: [
					step === "idle" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "danger",
						onClick: () => setStep("confirm"),
						children: "Delete your profile"
					}) : null,
					step === "confirm" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
						title: "Delete your profile?",
						body: "This removes you from the house. It cannot be undone.",
						confirm: "Delete profile",
						onCancel: () => setStep("idle"),
						onConfirm: () => {
							if (last) {
								setStep("last");
								return;
							}
							onDelete(false);
						}
					}) : null,
					step === "last" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
						title: "The house will be deleted too",
						body: "You are the last person in this house. Deleting your profile deletes the house, the chat, and the calendar.",
						confirm: "Delete the house and my profile",
						onCancel: () => setStep("idle"),
						onConfirm: () => void onDelete(true)
					}) : null
				]
			})
		]
	});
}
function Dialog({ title, body, confirm, onCancel, onConfirm }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		role: "dialog",
		"aria-modal": "true",
		className: "rounded-lg border border-line bg-sheet p-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "font-display text-2xl",
				children: title
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-muted",
				children: body
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 flex flex-wrap gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "danger",
					className: "rounded-full bg-danger px-4 text-accent-fg",
					onClick: onConfirm,
					children: confirm
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "secondary",
					onClick: onCancel,
					children: "Cancel"
				})]
			})
		]
	});
}
var NAV = [
	{
		id: "home",
		label: "Home",
		icon: House
	},
	{
		id: "chat",
		label: "Chat",
		icon: MessageCircle
	},
	{
		id: "calendar",
		label: "Calendar",
		icon: CalendarDays
	},
	{
		id: "house",
		label: "House",
		icon: House
	},
	{
		id: "rent",
		label: "Rent",
		icon: Wallet
	}
];
function FairApp() {
	const { user, isPending } = useCurrentUserState();
	const [snap, setSnap] = (0, import_react.useState)(void 0);
	const [view, setView] = (0, import_react.useState)("home");
	const [profile, setProfile] = (0, import_react.useState)(false);
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [error, setError] = (0, import_react.useState)(null);
	const [selected, setSelected] = (0, import_react.useState)("");
	const refresh = (0, import_react.useCallback)(async () => {
		const next = await getHouse();
		setSnap(next);
		setSelected((current) => current || next?.today || "");
		return next;
	}, []);
	(0, import_react.useEffect)(() => {
		if (!user) return;
		let cancelled = false;
		getHouse().then((next) => {
			if (cancelled) return;
			setSnap(next);
			setSelected(next?.today ?? "");
		}).catch((reason) => {
			if (!cancelled) {
				setSnap(null);
				setError(reason instanceof Error ? reason.message : "The house didn't load.");
			}
		});
		return () => {
			cancelled = true;
		};
	}, [user?.id]);
	(0, import_react.useLayoutEffect)(() => {
		window.scrollTo(0, 0);
	}, [view, profile]);
	async function run(fn) {
		setBusy(true);
		setError(null);
		try {
			await fn();
			await refresh();
			return true;
		} catch (reason) {
			setError(reason instanceof Error ? reason.message : "That didn't work.");
			return false;
		} finally {
			setBusy(false);
		}
	}
	if (isPending || user && snap === void 0) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
		className: "grid min-h-dvh place-items-center bg-paper text-ink",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm text-muted",
			children: "Opening your house"
		})
	});
	if (!user) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RedirectToSignIn, {});
	if (!snap) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Welcome, {
		user,
		busy,
		error,
		onSample: (input) => run(() => openSample({ data: input })),
		onBlank: (input) => run(() => createHouse({ data: input })),
		onJoin: (input) => run(() => joinHouse({ data: input }))
	});
	const body = profile ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProfileView, {
		snap,
		busy,
		onClose: () => setProfile(false),
		onSave: (input) => run(() => saveMe({ data: input })),
		onDelete: (confirmHouse) => run(() => deleteProfile({ data: { confirmHouse } }))
	}) : view === "home" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HomeView, {
		snap,
		onOpen: setView
	}) : view === "chat" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChatView, {
		snap,
		busy,
		onSend: (bodyText) => run(() => postMessage({ data: { body: bodyText } }))
	}) : view === "calendar" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CalendarView, {
		snap,
		selected: selected || snap.today,
		busy,
		onSelect: setSelected,
		onAdd: (input) => run(() => addEvent({ data: input })),
		onDelete: (id) => void run(() => deleteEvent({ data: { id } }))
	}) : view === "house" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HouseView, {
		snap,
		busy,
		onSave: (input) => run(() => saveHouse({ data: input })),
		onAddMember: (input) => run(() => addMember({ data: input })),
		onLeave: () => run(() => leaveHouse()),
		onReport: (input) => run(() => reportProblem({ data: input })),
		onSort: (id) => run(() => sortProblem({ data: { id } })),
		onSchedule: (input) => run(() => scheduleProblem({ data: input }))
	}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RentView, {
		snap,
		busy,
		onMark: (status) => run(() => markRent({ data: { status } }))
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-dvh bg-paper text-ink md:grid md:grid-cols-[220px_1fr]",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
				className: "hidden border-r border-line md:flex md:flex-col md:gap-2 md:px-4 md:py-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "px-3 font-display text-2xl tracking-tight",
					children: "My Fair Share"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
					className: "mt-6 flex flex-col gap-1",
					children: NAV.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => {
							setProfile(false);
							setView(item.id);
						},
						className: `flex h-11 items-center gap-2 rounded-md px-3 text-left ${view === item.id && !profile ? "bg-ink text-paper" : "hover:bg-sheet"}`,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(item.icon, {
							size: 18,
							"aria-hidden": true
						}), item.label]
					}, item.id))
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex min-h-dvh flex-col pb-20 md:pb-0",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
						className: "flex items-center justify-between gap-3 border-b border-line px-5 py-3 md:px-10",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "truncate font-medium",
							children: snap.household.suburb
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							className: "flex h-11 items-center gap-2",
							onClick: () => setProfile(true),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "grid h-8 w-8 place-items-center rounded-full bg-ink text-sm text-paper",
								children: snap.you.displayName.slice(0, 1).toUpperCase()
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "max-w-40 truncate text-sm font-medium",
								children: snap.you.displayName
							})]
						})]
					}),
					error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						role: "alert",
						className: "mx-5 mt-4 text-sm text-danger md:mx-10",
						children: error
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex-1",
						children: body
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "hidden px-10 py-4 md:block",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserButton, {})
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
				className: "fixed inset-x-0 bottom-0 grid grid-cols-5 border-t border-line bg-sheet md:hidden",
				children: NAV.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => {
						setProfile(false);
						setView(item.id);
					},
					className: `flex h-16 flex-col items-center justify-center gap-1 text-xs ${view === item.id && !profile ? "text-ink" : "text-muted"}`,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(item.icon, {
						size: 18,
						"aria-hidden": true
					}), item.label]
				}, item.id))
			})
		]
	});
}
function Home() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FairApp, {});
}
//#endregion
export { Home as component };
