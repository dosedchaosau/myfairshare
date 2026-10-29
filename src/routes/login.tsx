import { useState, type FormEvent } from "react";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { GROK_PROVIDERS, authClient, authEnabled, signIn } from "@/lib/auth/client";
import { Button, TextField } from "@/components/fair/ui";

export const Route = createFileRoute("/login")({ component: Login });

function Login() {
  const router = useRouter();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!authEnabled) return;
    setBusy(true);
    setError(null);
    const result = mode === "up"
      ? await authClient.signUp.email({ email, password, name, callbackURL: "/" })
      : await authClient.signIn.email({ email, password, callbackURL: "/" });
    setBusy(false);
    if (result.error) {
      setError(result.error.message ?? "That didn't work.");
      return;
    }
    await router.navigate({ to: "/" });
  }

  return (
    <main className="mx-auto grid min-h-dvh max-w-5xl items-center gap-10 bg-paper px-5 py-12 text-ink md:grid-cols-2 md:px-10">
      <div>
        <p className="text-sm font-medium tracking-wide text-muted uppercase">My Fair Share</p>
        <h1 className="mt-3 font-display text-4xl leading-tight tracking-tight md:text-6xl">Keep the house in one place.</h1>
        <p className="mt-4 max-w-md text-muted">A chat, a calendar, the spare-key notes, and a record of your rent. Shared only with the people you live with.</p>
      </div>
      <div className="rounded-xl border border-line bg-sheet p-6 md:p-8">
        <h2 className="font-display text-3xl">{mode === "up" ? "Create an account" : "Come in"}</h2>
        {authEnabled ? (
          <>
            <div className="mt-5 flex flex-col gap-2">
              {GROK_PROVIDERS.map((provider) => (
                <Button key={provider.providerId} variant="secondary" className="w-full" onClick={() => void signIn(provider.providerId, { callbackURL: "/" })}>
                  Continue with {provider.label}
                </Button>
              ))}
            </div>
            <form className="mt-5 flex flex-col gap-3" onSubmit={(event) => void submit(event)}>
              {mode === "up" ? <TextField label="Name" value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" required /> : null}
              <TextField label="Email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" required />
              <TextField label="Password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete={mode === "up" ? "new-password" : "current-password"} hint={mode === "up" ? "At least 8 characters." : undefined} minLength={8} required />
              {error ? <p role="alert" className="text-sm text-danger">{error}</p> : null}
              <Button type="submit" className="w-full" disabled={busy}>{busy ? "One moment…" : mode === "up" ? "Create account" : "Sign in"}</Button>
            </form>
            <Button variant="quiet" className="mt-2 px-0" onClick={() => { setMode((current) => (current === "in" ? "up" : "in")); setError(null); }}>
              {mode === "up" ? "I already have an account" : "Create an account"}
            </Button>
          </>
        ) : (
          <p className="mt-4 text-sm text-muted">Sign-in is turned off.</p>
        )}
      </div>
    </main>
  );
}
