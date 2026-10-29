import { useId, type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from "react";

const fieldClass =
  "w-full rounded-md border border-line bg-sheet px-3 text-base text-ink outline-none placeholder:text-faint focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink";

export function Button({
  variant = "primary",
  className = "",
  type = "button",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "quiet" | "danger" }) {
  const shape =
    variant === "quiet"
      ? "h-11 px-1 text-muted hover:text-ink"
      : variant === "danger"
        ? "h-11 px-1 text-danger hover:opacity-80"
        : variant === "secondary"
          ? "press h-11 rounded-full border border-line bg-sheet px-4 text-ink hover:bg-paper"
          : "press h-11 rounded-full bg-accent px-4 text-accent-fg hover:bg-accent-press";
  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center gap-2 text-sm font-medium transition-opacity duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink disabled:opacity-50 ${shape} ${className}`}
      {...props}
    />
  );
}

export function TextField({ label, hint, ...props }: { label: string; hint?: string } & InputHTMLAttributes<HTMLInputElement>) {
  const id = useId();
  return (
    <label className="block" htmlFor={id}>
      <span className="mb-1 block text-sm font-medium">{label}</span>
      <input id={id} className={`${fieldClass} h-11`} {...props} />
      {hint ? <span className="mt-1 block text-sm text-muted">{hint}</span> : null}
    </label>
  );
}

export function TextArea({ label, ...props }: { label: string } & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const id = useId();
  return (
    <label className="block" htmlFor={id}>
      <span className="mb-1 block text-sm font-medium">{label}</span>
      <textarea id={id} rows={3} className={`${fieldClass} py-2`} {...props} />
    </label>
  );
}

export function SelectField({ label, children, ...props }: { label: string; children: ReactNode } & SelectHTMLAttributes<HTMLSelectElement>) {
  const id = useId();
  return (
    <label className="block" htmlFor={id}>
      <span className="mb-1 block text-sm font-medium">{label}</span>
      <select id={id} className={`${fieldClass} h-11`} {...props}>
        {children}
      </select>
    </label>
  );
}

export function SectionLabel({ children }: { children: ReactNode }) {
  return <p className="text-sm font-medium tracking-wide text-muted uppercase">{children}</p>;
}

export async function copyText(value: string): Promise<boolean> {
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

export function maskValue(value: string): string {
  return value.replace(/[^\s]/g, "*");
}
