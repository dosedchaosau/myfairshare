import { o as __toESM } from "../_runtime.mjs";
import { J as require_react, x as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/ui-DZVu6tQV.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var fieldClass = "w-full rounded-md border border-line bg-sheet px-3 text-base text-ink outline-none placeholder:text-faint focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink";
function Button({ variant = "primary", className = "", type = "button", ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type,
		className: `inline-flex items-center justify-center gap-2 text-sm font-medium transition-opacity duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink disabled:opacity-50 ${variant === "quiet" ? "h-11 px-1 text-muted hover:text-ink" : variant === "danger" ? "h-11 px-1 text-danger hover:opacity-80" : variant === "secondary" ? "press h-11 rounded-full border border-line bg-sheet px-4 text-ink hover:bg-paper" : "press h-11 rounded-full bg-accent px-4 text-accent-fg hover:bg-accent-press"} ${className}`,
		...props
	});
}
function TextField({ label, hint, ...props }) {
	const id = (0, import_react.useId)();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
		className: "block",
		htmlFor: id,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "mb-1 block text-sm font-medium",
				children: label
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
				id,
				className: `${fieldClass} h-11`,
				...props
			}),
			hint ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "mt-1 block text-sm text-muted",
				children: hint
			}) : null
		]
	});
}
function TextArea({ label, ...props }) {
	const id = (0, import_react.useId)();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
		className: "block",
		htmlFor: id,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "mb-1 block text-sm font-medium",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
			id,
			rows: 3,
			className: `${fieldClass} py-2`,
			...props
		})]
	});
}
function SelectField({ label, children, ...props }) {
	const id = (0, import_react.useId)();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
		className: "block",
		htmlFor: id,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "mb-1 block text-sm font-medium",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
			id,
			className: `${fieldClass} h-11`,
			...props,
			children
		})]
	});
}
function SectionLabel({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-sm font-medium tracking-wide text-muted uppercase",
		children
	});
}
async function copyText(value) {
	try {
		await navigator.clipboard.writeText(value);
		return true;
	} catch {
		try {
			const el = document.createElement("textarea");
			el.value = value;
			el.setAttribute("readonly", "");
			document.body.appendChild(el);
			el.select();
			const ok = document.execCommand("copy");
			el.remove();
			return ok;
		} catch {
			return false;
		}
	}
}
function maskValue(value) {
	return value.replace(/[^\s]/g, "*");
}
//#endregion
export { TextField as a, TextArea as i, SectionLabel as n, copyText as o, SelectField as r, maskValue as s, Button as t };
