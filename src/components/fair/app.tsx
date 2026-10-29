import { useCallback, useEffect, useLayoutEffect, useState } from "react";
import { CalendarDays, House, MessageCircle, Wallet, Home } from "lucide-react";
import { RedirectToSignIn, UserButton } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import {
  addEvent,
  addMember,
  createHouse,
  deleteEvent,
  deleteProfile,
  getHouse,
  joinHouse,
  leaveHouse,
  markRent,
  openSample,
  postMessage,
  reportProblem,
  saveHouse,
  saveMe,
  scheduleProblem,
  sortProblem,
} from "@/lib/house/server";
import type { EventKind, HouseSnapshot } from "@/lib/house/types";
import { Welcome } from "./welcome";
import { CalendarView, ChatView, HomeView, HouseView, ProfileView, RentView } from "./views";

type View = "home" | "chat" | "calendar" | "house" | "rent";

const NAV: { id: View; label: string; icon: typeof Home }[] = [
  { id: "home", label: "Home", icon: Home },
  { id: "chat", label: "Chat", icon: MessageCircle },
  { id: "calendar", label: "Calendar", icon: CalendarDays },
  { id: "house", label: "House", icon: House },
  { id: "rent", label: "Rent", icon: Wallet },
];

export function FairApp() {
  const { user, isPending } = useCurrentUserState();
  const [snap, setSnap] = useState<HouseSnapshot | null | undefined>(undefined);
  const [view, setView] = useState<View>("home");
  const [profile, setProfile] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState("");

  const refresh = useCallback(async () => {
    const next = await getHouse();
    setSnap(next);
    setSelected((current) => current || next?.today || "");
    return next;
  }, []);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    getHouse()
      .then((next) => {
        if (cancelled) return;
        setSnap(next);
        setSelected(next?.today ?? "");
      })
      .catch((reason: unknown) => {
        if (!cancelled) {
          setSnap(null);
          setError(reason instanceof Error ? reason.message : "The house didn't load.");
        }
      });
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, [view, profile]);

  async function run(fn: () => Promise<unknown>): Promise<boolean> {
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

  if (isPending || (user && snap === undefined)) {
    return (
      <main className="grid min-h-dvh place-items-center bg-paper text-ink">
        <p className="text-sm text-muted">Opening your house</p>
      </main>
    );
  }
  if (!user) return <RedirectToSignIn />;
  if (!snap) {
    return (
      <Welcome
        user={user}
        busy={busy}
        error={error}
        onSample={(input) => run(() => openSample({ data: input }))}
        onBlank={(input) => run(() => createHouse({ data: input }))}
        onJoin={(input) => run(() => joinHouse({ data: input }))}
      />
    );
  }

  const body = profile ? (
    <ProfileView
      snap={snap}
      busy={busy}
      onClose={() => setProfile(false)}
      onSave={(input) => run(() => saveMe({ data: input }))}
      onDelete={(confirmHouse) => run(() => deleteProfile({ data: { confirmHouse } }))}
    />
  ) : view === "home" ? (
    <HomeView snap={snap} onOpen={setView} />
  ) : view === "chat" ? (
    <ChatView snap={snap} busy={busy} onSend={(bodyText) => run(() => postMessage({ data: { body: bodyText } }))} />
  ) : view === "calendar" ? (
    <CalendarView
      snap={snap}
      selected={selected || snap.today}
      busy={busy}
      onSelect={setSelected}
      onAdd={(input: { title: string; startsOn: string; kind: EventKind; notes: string }) => run(() => addEvent({ data: input }))}
      onDelete={(id) => void run(() => deleteEvent({ data: { id } }))}
    />
  ) : view === "house" ? (
    <HouseView
      snap={snap}
      busy={busy}
      onSave={(input) => run(() => saveHouse({ data: input }))}
      onAddMember={(input) => run(() => addMember({ data: input }))}
      onLeave={() => run(() => leaveHouse())}
      onReport={(input) => run(() => reportProblem({ data: input }))}
      onSort={(id) => run(() => sortProblem({ data: { id } }))}
      onSchedule={(input) => run(() => scheduleProblem({ data: input }))}
    />
  ) : (
    <RentView snap={snap} busy={busy} onMark={(status) => run(() => markRent({ data: { status } }))} />
  );

  return (
    <div className="min-h-dvh bg-paper text-ink md:grid md:grid-cols-[220px_1fr]">
      <aside className="hidden border-r border-line md:flex md:flex-col md:gap-2 md:px-4 md:py-6">
        <p className="px-3 font-display text-2xl tracking-tight">My Fair Share</p>
        <nav className="mt-6 flex flex-col gap-1">
          {NAV.map((item) => (
            <button key={item.id} type="button" onClick={() => { setProfile(false); setView(item.id); }} className={`flex h-11 items-center gap-2 rounded-md px-3 text-left ${view === item.id && !profile ? "bg-ink text-paper" : "hover:bg-sheet"}`}>
              <item.icon size={18} aria-hidden />
              {item.label}
            </button>
          ))}
        </nav>
      </aside>
      <div className="flex min-h-dvh flex-col pb-20 md:pb-0">
        <header className="flex items-center justify-between gap-3 border-b border-line px-5 py-3 md:px-10">
          <p className="truncate font-medium">{snap.household.suburb}</p>
          <button type="button" className="flex h-11 items-center gap-2" onClick={() => setProfile(true)}>
            <span className="grid h-8 w-8 place-items-center rounded-full bg-ink text-sm text-paper">{snap.you.displayName.slice(0, 1).toUpperCase()}</span>
            <span className="max-w-40 truncate text-sm font-medium">{snap.you.displayName}</span>
          </button>
        </header>
        {error ? <p role="alert" className="mx-5 mt-4 text-sm text-danger md:mx-10">{error}</p> : null}
        <div className="flex-1">{body}</div>
        <div className="hidden px-10 py-4 md:block"><UserButton /></div>
      </div>
      <nav className="fixed inset-x-0 bottom-0 grid grid-cols-5 border-t border-line bg-sheet md:hidden">
        {NAV.map((item) => (
          <button key={item.id} type="button" onClick={() => { setProfile(false); setView(item.id); }} className={`flex h-16 flex-col items-center justify-center gap-1 text-xs ${view === item.id && !profile ? "text-ink" : "text-muted"}`}>
            <item.icon size={18} aria-hidden />
            {item.label}
          </button>
        ))}
      </nav>
    </div>
  );
}
