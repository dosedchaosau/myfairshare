import { o as __toESM } from "../_runtime.mjs";
import { J as require_react, b as useRouter, x as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { r as signIn, t as authClient } from "./client-1vAx-gM_.mjs";
import { t as GROK_PROVIDERS } from "./server-DiJWroI6.mjs";
import { a as TextField, t as Button } from "./ui-DZVu6tQV.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/login-HTlRp0vK.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Login() {
	const router = useRouter();
	const [mode, setMode] = (0, import_react.useState)("in");
	const [name, setName] = (0, import_react.useState)("");
	const [email, setEmail] = (0, import_react.useState)("");
	const [password, setPassword] = (0, import_react.useState)("");
	const [error, setError] = (0, import_react.useState)(null);
	const [busy, setBusy] = (0, import_react.useState)(false);
	async function submit(event) {
		event.preventDefault();
		setBusy(true);
		setError(null);
		const result = mode === "up" ? await authClient.signUp.email({
			email,
			password,
			name,
			callbackURL: "/"
		}) : await authClient.signIn.email({
			email,
			password,
			callbackURL: "/"
		});
		setBusy(false);
		if (result.error) {
			setError(result.error.message ?? "That didn't work.");
			return;
		}
		await router.navigate({ to: "/" });
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "mx-auto grid min-h-dvh max-w-5xl items-center gap-10 bg-paper px-5 py-12 text-ink md:grid-cols-2 md:px-10",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm font-medium tracking-wide text-muted uppercase",
				children: "My Fair Share"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "mt-3 font-display text-4xl leading-tight tracking-tight md:text-6xl",
				children: "Keep the house in one place."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-4 max-w-md text-muted",
				children: "A chat, a calendar, the spare-key notes, and a record of your rent. Shared only with the people you live with."
			})
		] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "rounded-xl border border-line bg-sheet p-6 md:p-8",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "font-display text-3xl",
				children: mode === "up" ? "Create an account" : "Come in"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-5 flex flex-col gap-2",
					children: GROK_PROVIDERS.map((provider) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "secondary",
						className: "w-full",
						onClick: () => void signIn(provider.providerId, { callbackURL: "/" }),
						children: ["Continue with ", provider.label]
					}, provider.providerId))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					className: "mt-5 flex flex-col gap-3",
					onSubmit: (event) => void submit(event),
					children: [
						mode === "up" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextField, {
							label: "Name",
							value: name,
							onChange: (event) => setName(event.target.value),
							autoComplete: "name",
							required: true
						}) : null,
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextField, {
							label: "Email",
							type: "email",
							value: email,
							onChange: (event) => setEmail(event.target.value),
							autoComplete: "email",
							required: true
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextField, {
							label: "Password",
							type: "password",
							value: password,
							onChange: (event) => setPassword(event.target.value),
							autoComplete: mode === "up" ? "new-password" : "current-password",
							hint: mode === "up" ? "At least 8 characters." : void 0,
							minLength: 8,
							required: true
						}),
						error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							role: "alert",
							className: "text-sm text-danger",
							children: error
						}) : null,
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "submit",
							className: "w-full",
							disabled: busy,
							children: busy ? "One moment…" : mode === "up" ? "Create account" : "Sign in"
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "quiet",
					className: "mt-2 px-0",
					onClick: () => {
						setMode((current) => current === "in" ? "up" : "in");
						setError(null);
					},
					children: mode === "up" ? "I already have an account" : "Create an account"
				})
			] })]
		})]
	});
}
//#endregion
export { Login as component };
