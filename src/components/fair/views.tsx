import { useState, type FormEvent, type ReactNode } from "react";
import { ChevronLeft, ChevronRight, Pencil } from "lucide-react";
import { cadenceLabel, clock, kindLabel, messageDay, money, monthGrid, monthLabel, prettyDate, problemLabel, shiftMonth } from "@/lib/house/format";
import { PROBLEM_KINDS, type EventKind, type HouseSnapshot, type HouseUtility } from "@/lib/house/types";
import { Button, SelectField, SectionLabel, TextArea, TextField, copyText, maskValue } from "./ui";

function nameOf(snap: HouseSnapshot, id: string): string {
  return snap.members.find((member) => member.id === id)?.displayName ?? "Someone who left";
}

export function HomeView({ snap, onOpen }: { snap: HouseSnapshot; onOpen: (view: "chat" | "calendar" | "rent") => void }) {
  const upcoming = snap.events.filter((event) => event.startsOn >= snap.today).slice(0, 3);
  const last = snap.messages[snap.messages.length - 1];
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-8 px-5 py-6 md:px-10 md:py-10">
      <header>
        <SectionLabel>Home</SectionLabel>
        <h1 className="mt-2 font-display text-4xl tracking-tight">{snap.household.street}</h1>
        <p className="mt-1 text-muted">{snap.household.suburb} {snap.household.state} {snap.household.postcode}</p>
      </header>
      <button type="button" onClick={() => onOpen("rent")} className="rounded-lg border border-line bg-sheet px-4 py-4 text-left">
        <p className="text-sm text-muted">You owe · {prettyDate(snap.rent.period)}</p>
        <p className="mt-1 font-display text-3xl">{snap.rent.livesHere ? money(snap.rent.owedCents) : "Nothing"}</p>
        <p className="mt-1 text-sm text-muted">{snap.rent.livesHere ? `Each ${cadenceLabel(snap.household.cadence)}, including your share of the bills.` : "You manage the house and don't pay rent here."}</p>
      </button>
      <section>
        <div className="flex items-center justify-between">
          <SectionLabel>Coming up</SectionLabel>
          <Button variant="quiet" onClick={() => onOpen("calendar")}>Calendar</Button>
        </div>
        <ul className="mt-2 flex flex-col gap-2">
          {upcoming.length === 0 ? <li className="text-sm text-muted">Nothing dated yet.</li> : null}
          {upcoming.map((event) => (
            <li key={event.id} className="flex items-baseline gap-3">
              <span className="w-28 shrink-0 text-sm text-muted">{prettyDate(event.startsOn)}</span>
              <span>{event.title}</span>
            </li>
          ))}
        </ul>
      </section>
      <section>
        <div className="flex items-center justify-between">
          <SectionLabel>Chat</SectionLabel>
          <Button variant="quiet" onClick={() => onOpen("chat")}>Open</Button>
        </div>
        <p className="mt-2 text-base">{last ? `${nameOf(snap, last.memberId)}: ${last.body}` : "No messages yet."}</p>
      </section>
      {snap.household.rules ? (
        <section>
          <SectionLabel>House rules</SectionLabel>
          <p className="mt-2 whitespace-pre-wrap">{snap.household.rules}</p>
        </section>
      ) : null}
    </div>
  );
}

export function ChatView({ snap, busy, onSend }: { snap: HouseSnapshot; busy: boolean; onSend: (body: string) => Promise<boolean> }) {
  const [body, setBody] = useState("");
  return (
    <div className="mx-auto flex min-h-full max-w-3xl flex-col px-5 py-6 md:px-10 md:py-10">
      <SectionLabel>Chat</SectionLabel>
      <h1 className="mt-2 font-display text-4xl tracking-tight">The house</h1>
      <ul className="mt-6 flex flex-1 flex-col gap-4">
        {snap.messages.length === 0 ? <li className="text-sm text-muted">Say something the house should see.</li> : null}
        {snap.messages.map((message) => {
          const day = messageDay(message.createdAt);
          return (
            <li key={message.id}>
              <p className="text-sm text-muted">{nameOf(snap, message.memberId)} · {day === snap.today ? "Today" : prettyDate(day)} · {clock(message.createdAt)}</p>
              <p className="whitespace-pre-wrap">{message.body}</p>
            </li>
          );
        })}
      </ul>
      <form className="mt-6 flex flex-col gap-3" onSubmit={(event) => { event.preventDefault(); void onSend(body.trim()).then((ok) => { if (ok) setBody(""); }); }}>
        <TextArea label="Message" value={body} onChange={(event) => setBody(event.target.value)} required />
        <Button type="submit" disabled={busy}>Send</Button>
      </form>
    </div>
  );
}

export function CalendarView({
  snap, selected, busy, onSelect, onAdd, onDelete,
}: {
  snap: HouseSnapshot;
  selected: string;
  busy: boolean;
  onSelect: (iso: string) => void;
  onAdd: (input: { title: string; startsOn: string; kind: EventKind; notes: string }) => Promise<boolean>;
  onDelete: (id: string) => void;
}) {
  const [cursor, setCursor] = useState(() => {
    const [year, month] = (selected || snap.today).split("-").map(Number);
    return { year, month };
  });
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [kind, setKind] = useState<EventKind>("plan");
  const [notes, setNotes] = useState("");
  const cells = monthGrid(cursor.year, cursor.month);
  const dayEvents = snap.events.filter((event) => event.startsOn === selected);
  const upcoming = snap.events.filter((event) => event.startsOn >= snap.today).slice(0, 5);
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 px-5 py-6 md:px-10 md:py-10">
      <header className="flex items-end justify-between gap-3">
        <div>
          <SectionLabel>Calendar</SectionLabel>
          <h1 className="mt-2 font-display text-4xl tracking-tight">{monthLabel(cursor.year, cursor.month)}</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" aria-label="Previous month" onClick={() => setCursor((current) => shiftMonth(current.year, current.month, -1))}><ChevronLeft aria-hidden size={18} /></Button>
          <Button variant="secondary" aria-label="Next month" onClick={() => setCursor((current) => shiftMonth(current.year, current.month, 1))}><ChevronRight aria-hidden size={18} /></Button>
        </div>
      </header>
      <div className="grid grid-cols-7 gap-1 text-center text-sm text-muted">
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((label) => <div key={label} className="h-8 leading-8">{label}</div>)}
        {cells.map((cell) => {
          const has = snap.events.some((event) => event.startsOn === cell.iso);
          const isSelected = cell.iso === selected;
          const isToday = cell.iso === snap.today;
          return (
            <button key={cell.iso} type="button" onClick={() => { onSelect(cell.iso); const [year, month] = cell.iso.split("-").map(Number); if (year && month) setCursor({ year, month }); }}
              className={`flex h-11 flex-col items-center justify-center rounded-md border text-sm tabular-nums focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink ${isSelected ? "border-ink bg-ink text-paper" : isToday ? "border-ink bg-sheet" : cell.inMonth ? "border-line bg-sheet" : "border-transparent text-faint"}`}>
              {Number(cell.iso.slice(8))}
              <span className={`h-1 w-1 rounded-full ${has ? (isSelected ? "bg-accent-soft" : "bg-ink") : "bg-transparent"}`} />
            </button>
          );
        })}
      </div>
      <section>
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-display text-2xl tracking-tight">{prettyDate(selected || snap.today)}</h2>
          <Button onClick={() => setOpen((value) => !value)}>{open ? "Close" : "Add event"}</Button>
        </div>
        {open ? (
          <form className="mt-4 flex flex-col gap-3 rounded-lg border border-line bg-sheet p-4" onSubmit={(event: FormEvent) => {
            event.preventDefault();
            void onAdd({ title: title.trim(), startsOn: selected || snap.today, kind, notes: notes.trim() }).then((ok) => { if (!ok) return; setTitle(""); setNotes(""); setKind("plan"); setOpen(false); });
          }}>
            <TextField label="Title" value={title} onChange={(event) => setTitle(event.target.value)} required />
            <SelectField label="Kind" value={kind} onChange={(event) => setKind(event.target.value as EventKind)}>
              <option value="plan">Plan</option>
              <option value="bins">Bins</option>
              <option value="guest">Guest</option>
              <option value="inspection">Inspection</option>
              <option value="rent">Rent</option>
            </SelectField>
            <TextArea label="Notes" value={notes} onChange={(event) => setNotes(event.target.value)} />
            <Button type="submit" disabled={busy}>Add to the calendar</Button>
          </form>
        ) : null}
        <ul className="mt-4 flex flex-col gap-3">
          {dayEvents.length === 0 ? <li className="text-sm text-muted">Nothing on this day.</li> : null}
          {dayEvents.map((event) => (
            <li key={event.id} className="rounded-lg border border-line bg-sheet px-4 py-3">
              <p className="text-sm text-muted">{kindLabel(event.kind)}</p>
              <p className="font-medium">{event.title}</p>
              {event.notes ? <p className="mt-1 whitespace-pre-wrap">{event.notes}</p> : null}
              <p className="mt-1 text-sm text-muted">{nameOf(snap, event.memberId)}</p>
              <Button variant="quiet" className="px-0" disabled={busy} onClick={() => onDelete(event.id)}>Remove</Button>
            </li>
          ))}
        </ul>
      </section>
      <section>
        <SectionLabel>Coming up</SectionLabel>
        <ul className="mt-3 flex flex-col gap-2">
          {upcoming.map((event) => (
            <li key={event.id}>
              <button type="button" className="flex min-h-11 w-full items-center gap-3 text-left" onClick={() => onSelect(event.startsOn)}>
                <span className="w-28 shrink-0 text-sm text-muted">{prettyDate(event.startsOn)}</span>
                <span className="truncate">{event.title}</span>
              </button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function utilityLine(row: HouseUtility | undefined, cadence: HouseSnapshot["household"]["cadence"]): string {
  if (!row || (!row.provider && row.amountCents === 0)) return "Not set";
  return `${row.provider || "No provider"} · ${money(row.amountCents)} a ${cadenceLabel(row.cadence)}`;
}

export function HouseView({
  snap, busy, onSave, onAddMember, onLeave, onReport, onSort, onSchedule,
}: {
  snap: HouseSnapshot;
  busy: boolean;
  onSave: (input: Record<string, unknown>) => Promise<boolean>;
  onAddMember: (input: { displayName: string; room: string; weeklyRent: number }) => Promise<boolean>;
  onLeave: () => Promise<boolean>;
  onReport: (input: { kind: string; detail: string; taggedMemberId: string }) => Promise<boolean>;
  onSort: (id: string) => Promise<boolean>;
  onSchedule: (input: { id: string; startsOn: string }) => Promise<boolean>;
}) {
  const [editing, setEditing] = useState(false);
  const [adding, setAdding] = useState(false);
  const [mate, setMate] = useState({ displayName: "", room: "", weeklyRent: "" });
  const [draft, setDraft] = useState({
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
    internetCadence: snap.utilities.find((row) => row.kind === "internet")?.cadence ?? "monthly",
  });
  const house = snap.household;
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-8 px-5 py-6 md:px-10 md:py-10">
      <header className="flex items-start justify-between gap-3">
        <div>
          <SectionLabel>House</SectionLabel>
          <h1 className="mt-2 font-display text-4xl tracking-tight">{house.street}</h1>
        </div>
        {snap.youLead ? <button type="button" aria-label="Edit the house" onClick={() => setEditing((value) => !value)} className="grid h-11 w-11 place-items-center rounded-full text-ink"><Pencil size={16} /></button> : null}
      </header>
      {editing && snap.youLead ? (
        <form className="flex flex-col gap-3" onSubmit={(event) => {
          event.preventDefault();
          const pack = (kind: "power" | "water" | "internet") => ({ provider: draft[`${kind}Provider`], amount: Number(draft[`${kind}Amount`] || 0), cadence: draft[`${kind}Cadence`] });
          void onSave({
            ...draft,
            bedrooms: Number(draft.bedrooms), bathrooms: Number(draft.bathrooms), garages: Number(draft.garages),
            utilities: { power: pack("power"), water: pack("water"), internet: pack("internet") },
          }).then((ok) => { if (ok) setEditing(false); });
        }}>
          <TextField label="Street address" value={draft.street} onChange={(event) => setDraft({ ...draft, street: event.target.value })} required />
          <TextField label="Suburb" value={draft.suburb} onChange={(event) => setDraft({ ...draft, suburb: event.target.value })} required />
          <SelectField label="State" value={draft.state} onChange={(event) => setDraft({ ...draft, state: event.target.value })}>
            {["ACT", "NSW", "NT", "QLD", "SA", "TAS", "VIC", "WA"].map((item) => <option key={item}>{item}</option>)}
          </SelectField>
          <TextField label="Postcode" value={draft.postcode} onChange={(event) => setDraft({ ...draft, postcode: event.target.value })} required />
          <TextField label="Bedrooms" type="number" value={draft.bedrooms} onChange={(event) => setDraft({ ...draft, bedrooms: event.target.value })} required />
          <TextField label="Bathrooms" type="number" value={draft.bathrooms} onChange={(event) => setDraft({ ...draft, bathrooms: event.target.value })} required />
          <TextField label="Garages" type="number" value={draft.garages} onChange={(event) => setDraft({ ...draft, garages: event.target.value })} required />
          <SelectField label="How often rent is due" value={draft.cadence} onChange={(event) => setDraft({ ...draft, cadence: event.target.value === "fortnightly" || event.target.value === "monthly" ? event.target.value : "weekly" })}>
            <option value="weekly">Weekly</option>
            <option value="fortnightly">Fortnightly</option>
            <option value="monthly">Monthly</option>
          </SelectField>
          <TextField label="Next date rent is due" type="date" value={draft.dueOn} onChange={(event) => setDraft({ ...draft, dueOn: event.target.value })} required />
          <TextField label="Wi-Fi name" value={draft.wifiName} onChange={(event) => setDraft({ ...draft, wifiName: event.target.value })} />
          <TextField label="Wi-Fi password" value={draft.wifiPassword} onChange={(event) => setDraft({ ...draft, wifiPassword: event.target.value })} />
          <TextField label="Account name" value={draft.bankName} onChange={(event) => setDraft({ ...draft, bankName: event.target.value })} />
          <TextField label="BSB" value={draft.bankBsb} onChange={(event) => setDraft({ ...draft, bankBsb: event.target.value })} />
          <TextField label="Account number" value={draft.bankAccount} onChange={(event) => setDraft({ ...draft, bankAccount: event.target.value })} />
          <TextField label="Reference" value={draft.bankReference} onChange={(event) => setDraft({ ...draft, bankReference: event.target.value })} />
          <TextArea label="House rules" value={draft.rules} onChange={(event) => setDraft({ ...draft, rules: event.target.value })} />
          <TextArea label="Spare key and notes" value={draft.spareNotes} onChange={(event) => setDraft({ ...draft, spareNotes: event.target.value })} />
          {(["power", "water", "internet"] as const).map((kind) => (
            <div key={kind} className="flex flex-col gap-3 border-t border-line pt-3">
              <p className="font-medium">{kind[0].toUpperCase() + kind.slice(1)}</p>
              <TextField label="Provider" value={draft[`${kind}Provider`]} onChange={(event) => setDraft({ ...draft, [`${kind}Provider`]: event.target.value })} />
              <TextField label="Amount" inputMode="decimal" value={draft[`${kind}Amount`]} onChange={(event) => setDraft({ ...draft, [`${kind}Amount`]: event.target.value })} />
            </div>
          ))}
          <Button type="submit" disabled={busy}>Save the house</Button>
        </form>
      ) : (
        <div className="grid grid-cols-2 gap-x-6 gap-y-5">
          <Fact title="Suburb" body={`${house.suburb}, ${house.state} ${house.postcode}`} />
          <Fact title="Bedrooms" body={String(house.bedrooms)} />
          <Fact title="Bathrooms" body={String(house.bathrooms)} />
          <Fact title="Garages" body={String(house.garages)} />
          <Fact title="Rent" body={`Due ${prettyDate(house.dueOn)}, each ${cadenceLabel(house.cadence)}`} />
          <Secret title="Wi-Fi" value={[house.wifiName, house.wifiPassword].filter(Boolean).join("\n")} empty="Not set" />
          <Secret title="Bank transfer" value={[house.bankName, house.bankBsb, house.bankAccount, house.bankReference].filter(Boolean).join("\n")} empty="Not set" />
          <CopyFact title="Invite code" value={house.inviteCode} />
        </div>
      )}
      {house.spareNotes && !editing ? <section><SectionLabel>Notes</SectionLabel><p className="mt-2 whitespace-pre-wrap">{house.spareNotes}</p></section> : null}
      <Problems snap={snap} busy={busy} onReport={onReport} onSort={onSort} onSchedule={onSchedule} />
      <section>
        <SectionLabel>People</SectionLabel>
        <ul className="mt-3 divide-y divide-line border-y border-line">
          {snap.members.map((member) => (
            <li key={member.id} className="py-3">
              <p className="font-medium">{member.displayName}{member.isYou ? " (you)" : ""}{member.role === "lead" ? " · house manager" : ""}</p>
              <p className="text-sm text-muted">{member.room || "No room yet"}{member.onApp ? "" : " · not on the app yet"}</p>
              {member.email ? <p className="text-sm text-muted">{member.email}</p> : null}
            </li>
          ))}
        </ul>
        {snap.youLead ? (
          <div className="mt-3">
            <Button variant="secondary" onClick={() => setAdding((value) => !value)}>{adding ? "Close" : "Add a housemate"}</Button>
            {adding ? (
              <form className="mt-3 flex flex-col gap-3" onSubmit={(event) => { event.preventDefault(); void onAddMember({ displayName: mate.displayName.trim(), room: mate.room.trim(), weeklyRent: Number(mate.weeklyRent) }).then((ok) => { if (ok) { setMate({ displayName: "", room: "", weeklyRent: "" }); setAdding(false); } }); }}>
                <TextField label="Name" value={mate.displayName} onChange={(event) => setMate({ ...mate, displayName: event.target.value })} required />
                <TextField label="Room" value={mate.room} onChange={(event) => setMate({ ...mate, room: event.target.value })} />
                <TextField label="What they pay each period" inputMode="decimal" value={mate.weeklyRent} onChange={(event) => setMate({ ...mate, weeklyRent: event.target.value })} required />
                <Button type="submit" disabled={busy}>Add</Button>
              </form>
            ) : null}
          </div>
        ) : null}
        <Button variant="quiet" className="mt-4 px-0" disabled={busy} onClick={() => void onLeave()}>Leave this house</Button>
      </section>
    </div>
  );
}

function Fact({ title, body }: { title: string; body: string }) {
  return <section><h2 className="text-sm font-medium text-muted">{title}</h2><p className="mt-1 whitespace-pre-wrap">{body}</p></section>;
}

function CopyFact({ title, value }: { title: string; value: string }) {
  const [note, setNote] = useState("");
  return (
    <section>
      <h2 className="text-sm font-medium text-muted">{title}</h2>
      <button type="button" className="mt-1 text-left font-medium tracking-wide" onClick={() => void copyText(value).then((ok) => setNote(ok ? "Copied" : "Couldn't copy"))}>{value}</button>
      {note ? <p className="text-sm text-muted">{note}</p> : null}
    </section>
  );
}

function Secret({ title, value, empty }: { title: string; value: string; empty: string }) {
  const [shown, setShown] = useState(false);
  const [note, setNote] = useState("");
  const display = value ? (shown ? value : maskValue(value)) : empty;
  return (
    <section>
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-medium text-muted">{title}</h2>
        {value ? <button type="button" className="h-11 px-1 text-sm font-medium text-muted" onClick={() => setShown((current) => !current)}>{shown ? "HIDE" : "SHOW"}</button> : null}
      </div>
      <button type="button" className="mt-1 text-left whitespace-pre-wrap" disabled={!value} onClick={() => { if (!value) return; void copyText(value).then((ok) => setNote(ok ? "Copied" : "Couldn't copy")); }}>{display}</button>
      {note ? <p className="text-sm text-muted">{note}</p> : null}
    </section>
  );
}

function Problems({ snap, busy, onReport, onSort, onSchedule }: { snap: HouseSnapshot; busy: boolean; onReport: (input: { kind: string; detail: string; taggedMemberId: string }) => Promise<boolean>; onSort: (id: string) => Promise<boolean>; onSchedule: (input: { id: string; startsOn: string }) => Promise<boolean> }) {
  const [open, setOpen] = useState(false);
  const [kind, setKind] = useState("noise");
  const [detail, setDetail] = useState("");
  const [taggedMemberId, setTaggedMemberId] = useState("");
  const [scheduleId, setScheduleId] = useState("");
  const [scheduleDay, setScheduleDay] = useState(snap.today);
  const manager = snap.members.find((member) => member.role === "lead");
  const others = snap.members.filter((member) => !member.isYou);
  const housemate = PROBLEM_KINDS.filter((item) => item.side === "housemate");
  const landlord = PROBLEM_KINDS.filter((item) => item.side === "landlord");
  return (
    <section>
      <SectionLabel>Problems</SectionLabel>
      <p className="mt-2 text-sm text-muted">{snap.youLead ? "Reports come to you, as house manager. Include a housemate if it involves them." : `Goes to the house manager${manager ? `, ${manager.displayName}` : ""}. Include a housemate if it involves them.`} If you are unsafe, call triple zero.</p>
      <Button variant="secondary" className="mt-3" onClick={() => setOpen((value) => !value)}>{open ? "Close" : "Report a problem"}</Button>
      {open ? (
        <form className="mt-3 flex flex-col gap-3" onSubmit={(event) => { event.preventDefault(); void onReport({ kind, detail: detail.trim(), taggedMemberId }).then((ok) => { if (ok) { setDetail(""); setTaggedMemberId(""); setOpen(false); } }); }}>
          <SelectField label="What's wrong" value={kind} onChange={(event) => setKind(event.target.value)}>
            <optgroup label="With a housemate">{housemate.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</optgroup>
            <optgroup label="With the landlord">{landlord.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</optgroup>
          </SelectField>
          <SelectField label="Include a housemate" value={taggedMemberId} onChange={(event) => setTaggedMemberId(event.target.value)}>
            <option value="">No one else</option>
            {others.map((member) => <option key={member.id} value={member.id}>{member.displayName}</option>)}
          </SelectField>
          <TextArea label="What happened" value={detail} onChange={(event) => setDetail(event.target.value)} placeholder="Optional. Say when, and which room." />
          <Button type="submit" disabled={busy}>{manager && !snap.youLead ? `Send to ${manager.displayName}` : "Send"}</Button>
        </form>
      ) : null}
      <ul className="mt-4 flex flex-col gap-3">
        {snap.problems.length === 0 ? <li className="text-sm text-muted">{snap.youLead ? "Nothing has been sent to you." : "You have not sent a report."}</li> : null}
        {snap.problems.map((problem) => {
          const tagged = problem.taggedMemberId ? nameOf(snap, problem.taggedMemberId) : "";
          const booked = snap.events.find((event) => event.id === problem.eventId);
          const canSort = problem.status === "open" && (problem.memberId === snap.you.id || snap.youLead);
          const day = messageDay(problem.createdAt);
          return (
            <li key={problem.id} className="rounded-lg border border-line bg-sheet px-4 py-3">
              <p className="text-sm text-muted">{problem.side === "landlord" ? "Landlord" : "Housemate"} · {problem.status === "sorted" ? "Sorted" : "Open"}</p>
              <p className="font-medium">{problemLabel(problem.kind)}</p>
              {problem.detail ? <p className="mt-1 whitespace-pre-wrap">{problem.detail}</p> : null}
              <p className="mt-1 text-sm text-muted">{nameOf(snap, problem.memberId)}{tagged ? ` · Includes ${tagged}` : ""} · {day === snap.today ? "Today" : prettyDate(day)} · {clock(problem.createdAt)}</p>
              {booked ? <p className="mt-1 text-sm text-muted">On the calendar · {prettyDate(booked.startsOn)}</p> : null}
              {snap.youLead && !booked ? (
                scheduleId === problem.id ? (
                  <form className="mt-3 flex flex-col gap-3" onSubmit={(event) => { event.preventDefault(); void onSchedule({ id: problem.id, startsOn: scheduleDay }).then((ok) => { if (ok) setScheduleId(""); }); }}>
                    <TextField label="Day" type="date" value={scheduleDay} onChange={(event) => setScheduleDay(event.target.value)} required />
                    <p className="text-sm text-muted">Everyone in the house will see this on the calendar.</p>
                    <div className="flex flex-wrap gap-2">
                      <Button type="submit" disabled={busy}>Add to the calendar</Button>
                      <Button variant="secondary" type="button" onClick={() => setScheduleId("")}>Cancel</Button>
                    </div>
                  </form>
                ) : (
                  <Button variant="secondary" className="mt-3" disabled={busy} onClick={() => { setScheduleId(problem.id); setScheduleDay(snap.today); }}>Add to the calendar</Button>
                )
              ) : null}
              {canSort ? <Button variant="quiet" className="mt-1 px-0" disabled={busy} onClick={() => void onSort(problem.id)}>Mark sorted</Button> : null}
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export function RentView({ snap, busy, onMark }: { snap: HouseSnapshot; busy: boolean; onMark: (status: "sent" | "due") => Promise<boolean> }) {
  const { rent, household } = snap;
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 px-5 py-6 md:px-10 md:py-10">
      <SectionLabel>Rent</SectionLabel>
      <h1 className="font-display text-4xl tracking-tight">{rent.livesHere ? money(rent.owedCents) : "Nothing due"}</h1>
      <p className="text-muted">{rent.livesHere ? `Due ${prettyDate(rent.period)}. This is only your share.` : "You are the house manager and you don't live here, so you are not asked to pay."}</p>
      {rent.livesHere ? (
        <ul className="flex flex-col gap-2 border-y border-line py-4">
          <li className="flex justify-between gap-3"><span>Your rent</span><span>{money(rent.rentCents)}</span></li>
          <li className="flex justify-between gap-3"><span>Your share of the bills</span><span>{money(rent.utilityCents)}</span></li>
          <li className="flex justify-between gap-3 font-medium"><span>Each {cadenceLabel(household.cadence)}</span><span>{money(rent.owedCents)}</span></li>
        </ul>
      ) : null}
      {rent.livesHere ? (
        <Button variant="secondary" disabled={busy} onClick={() => void onMark(rent.status === "sent" ? "due" : "sent")}>
          {rent.status === "sent" ? "Marked as sent" : "I've sent it"}
        </Button>
      ) : null}
      <SecretBlock title="Pay by bank transfer" lines={[household.bankName, household.bankBsb, household.bankAccount, household.bankReference]} />
    </div>
  );
}

function SecretBlock({ title, lines }: { title: string; lines: string[] }) {
  const value = lines.filter(Boolean).join("\n");
  const [shown, setShown] = useState(false);
  const [note, setNote] = useState("");
  return (
    <section>
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-muted">{title}</h2>
        {value ? <button type="button" className="h-11 text-sm font-medium" onClick={() => setShown((current) => !current)}>{shown ? "HIDE" : "SHOW"}</button> : null}
      </div>
      <button type="button" className="mt-1 text-left whitespace-pre-wrap" disabled={!value} onClick={() => void copyText(value).then((ok) => setNote(ok ? "Copied" : "Couldn't copy"))}>{value ? (shown ? value : maskValue(value)) : "Not set yet"}</button>
      {note ? <p className="text-sm text-muted">{note}</p> : null}
    </section>
  );
}

export function ProfileView({ snap, busy, onSave, onDelete, onClose }: { snap: HouseSnapshot; busy: boolean; onSave: (input: { displayName: string; dateOfBirth: string; email: string; phone: string }) => Promise<boolean>; onDelete: (confirmHouse: boolean) => Promise<boolean>; onClose: () => void }) {
  const [name, setName] = useState(snap.you.displayName);
  const [dob, setDob] = useState(snap.you.dateOfBirth);
  const [email, setEmail] = useState(snap.you.email);
  const [phone, setPhone] = useState(snap.you.phone);
  const [step, setStep] = useState<"idle" | "confirm" | "last">("idle");
  const last = snap.members.length === 1;
  return (
    <div className="mx-auto flex max-w-xl flex-col gap-4 px-5 py-6 md:px-10 md:py-10">
      <Button variant="quiet" className="self-start px-0" onClick={onClose}>Back</Button>
      <h1 className="font-display text-4xl tracking-tight">Your details</h1>
      <form className="flex flex-col gap-3" onSubmit={(event) => { event.preventDefault(); void onSave({ displayName: name.trim(), dateOfBirth: dob, email: email.trim(), phone: phone.trim() }); }}>
        <TextField label="Name" value={name} onChange={(event) => setName(event.target.value)} required />
        <TextField label="Date of birth" type="date" value={dob} onChange={(event) => setDob(event.target.value)} />
        <TextField label="Email address" type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
        <TextField label="Phone number" type="tel" value={phone} onChange={(event) => setPhone(event.target.value)} />
        <Button type="submit" disabled={busy}>Save</Button>
      </form>
      <div className="mt-8 border-t border-line pt-6">
        {step === "idle" ? <Button variant="danger" onClick={() => setStep("confirm")}>Delete your profile</Button> : null}
        {step === "confirm" ? (
          <Dialog title="Delete your profile?" body="This removes you from the house. It cannot be undone." confirm="Delete profile" onCancel={() => setStep("idle")} onConfirm={() => { if (last) { setStep("last"); return; } void onDelete(false); }} />
        ) : null}
        {step === "last" ? (
          <Dialog title="The house will be deleted too" body="You are the last person in this house. Deleting your profile deletes the house, the chat, and the calendar." confirm="Delete the house and my profile" onCancel={() => setStep("idle")} onConfirm={() => void onDelete(true)} />
        ) : null}
      </div>
    </div>
  );
}

function Dialog({ title, body, confirm, onCancel, onConfirm }: { title: string; body: string; confirm: string; onCancel: () => void; onConfirm: () => void }) {
  return (
    <div role="dialog" aria-modal="true" className="rounded-lg border border-line bg-sheet p-4">
      <h2 className="font-display text-2xl">{title}</h2>
      <p className="mt-2 text-muted">{body}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        <Button variant="danger" className="rounded-full bg-danger px-4 text-accent-fg" onClick={onConfirm}>{confirm}</Button>
        <Button variant="secondary" onClick={onCancel}>Cancel</Button>
      </div>
    </div>
  );
}

export function Frame({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
