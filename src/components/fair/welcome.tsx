import { useState, type FormEvent } from "react";
import type { AppUser } from "@/lib/auth/use-current-user";
import { Button, SelectField, TextField } from "./ui";

type Tenant = { firstName: string; lastName: string; dateOfBirth: string; email: string; phone: string; rentAmount: string };
type Bill = { provider: string; amount: string; cadence: "weekly" | "fortnightly" | "monthly" };

export function Welcome({
  user,
  busy,
  error,
  onSample,
  onBlank,
  onJoin,
}: {
  user: AppUser;
  busy: boolean;
  error: string | null;
  onSample: (input: { displayName: string; weeklyRent: number }) => Promise<boolean>;
  onBlank: (input: {
    capacity: "landlord" | "tenant";
    displayName: string;
    dateOfBirth: string;
    street: string;
    suburb: string;
    state: string;
    postcode: string;
    rentAmount: number;
    dueOn: string;
    cadence: "weekly" | "fortnightly" | "monthly";
    bedrooms: number;
    bathrooms: number;
    garages: number;
    email: string;
    tenants: { firstName: string; lastName: string; dateOfBirth: string; email: string; phone: string; rentAmount: number }[];
    utilities: { power: { provider: string; amount: number; cadence: Bill["cadence"] }; water: { provider: string; amount: number; cadence: Bill["cadence"] }; internet: { provider: string; amount: number; cadence: Bill["cadence"] }; };
  }) => Promise<boolean>;
  onJoin: (input: { code: string; displayName: string; room: string; weeklyRent: number }) => Promise<boolean>;
}) {
  const [path, setPath] = useState<"choose" | "blank" | "rooms" | "utilities" | "join">("choose");
  const [displayName, setDisplayName] = useState(user.displayName ?? "");
  const [weeklyRent, setWeeklyRent] = useState("265");
  const [capacity, setCapacity] = useState<"landlord" | "tenant">("tenant");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [street, setStreet] = useState("");
  const [suburb, setSuburb] = useState("");
  const [state, setState] = useState("");
  const [postcode, setPostcode] = useState("");
  const [rentAmount, setRentAmount] = useState("");
  const [dueOn, setDueOn] = useState("");
  const [cadence, setCadence] = useState<"weekly" | "fortnightly" | "monthly">("weekly");
  const [bedrooms, setBedrooms] = useState("");
  const [bathrooms, setBathrooms] = useState("");
  const [garages, setGarages] = useState("");
  const [addingTenant, setAddingTenant] = useState(false);
  const [tenantError, setTenantError] = useState<string | null>(null);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [tenant, setTenant] = useState<Tenant>({ firstName: "", lastName: "", dateOfBirth: "", email: "", phone: "", rentAmount: "" });
  const [room, setRoom] = useState("");
  const [code, setCode] = useState("");
  const [bills, setBills] = useState({
    power: { provider: "", amount: "", cadence: "monthly" as Bill["cadence"] },
    water: { provider: "", amount: "", cadence: "monthly" as Bill["cadence"] },
    internet: { provider: "", amount: "", cadence: "monthly" as Bill["cadence"] },
  });

  return (
    <main className="mx-auto grid min-h-dvh max-w-5xl items-start gap-10 bg-paper px-5 py-12 text-ink md:grid-cols-2 md:items-center md:px-10">
      <div>
        <p className="text-sm font-medium tracking-wide text-muted uppercase">My Fair Share</p>
        <h1 className="mt-3 font-display text-4xl leading-tight tracking-tight md:text-6xl">Move in.</h1>
        <p className="mt-4 max-w-md text-base text-muted">
          Open a lived-in sample terrace, start a house of your own, or join with a code from someone you live with.
        </p>
      </div>
      <div className="rounded-xl border border-line bg-sheet p-6 md:p-8">
        {path === "choose" || path === "join" ? (
          <TextField label="Your name on the board" value={displayName} onChange={(event) => setDisplayName(event.target.value)} autoComplete="name" />
        ) : null}
        {error ? <p role="alert" className="mt-3 text-sm text-danger">{error}</p> : null}
        {path === "choose" ? (
          <div className="mt-5 flex flex-col gap-3">
            <TextField label="Your weekly rent" inputMode="decimal" value={weeklyRent} onChange={(event) => setWeeklyRent(event.target.value)} hint="Australian dollars. You can change the house later." />
            <Button className="w-full" disabled={busy} onClick={() => void onSample({ displayName: displayName.trim(), weeklyRent: Number(weeklyRent) })}>
              {busy ? "Setting the house…" : "Open the sample terrace"}
            </Button>
            <p className="text-sm text-muted">18 Latrobe Terrace, Paddington. Three housemates, bin night, and this week's rent.</p>
            <Button variant="secondary" className="w-full" onClick={() => setPath("blank")}>Set up a new house</Button>
            <Button variant="secondary" className="w-full" onClick={() => setPath("join")}>Join with a code</Button>
          </div>
        ) : null}
        {path === "blank" ? (
          <form className="mt-1 flex flex-col gap-3" onSubmit={(event) => { event.preventDefault(); setPath("rooms"); }}>
            <p className="text-sm text-muted">You will be the house manager. That can be the landlord, or the first tenant in.</p>
            <TextField label="Your name" value={displayName} onChange={(event) => setDisplayName(event.target.value)} required />
            <SelectField label="You are" value={capacity} onChange={(event) => setCapacity(event.target.value === "landlord" ? "landlord" : "tenant")}>
              <option value="tenant">A tenant</option>
              <option value="landlord">The landlord</option>
            </SelectField>
            <TextField label="Date of birth" type="date" value={dateOfBirth} onChange={(event) => setDateOfBirth(event.target.value)} required />
            <TextField
              label="Rent amount"
              inputMode="decimal"
              value={rentAmount}
              onChange={(event) => setRentAmount(event.target.value)}
              hint={capacity === "landlord" ? "What is due for the house each period. You won't be asked to pay this." : "What is due each period. Because you live here, this is what you owe."}
              required
            />
            <SelectField label="How often" value={cadence} onChange={(event) => setCadence(event.target.value === "fortnightly" || event.target.value === "monthly" ? event.target.value : "weekly")}>
              <option value="weekly">Weekly</option>
              <option value="fortnightly">Fortnightly</option>
              <option value="monthly">Monthly</option>
            </SelectField>
            <TextField label="Next date rent is due" type="date" value={dueOn} onChange={(event) => setDueOn(event.target.value)} required />
            <Button type="submit" className="w-full">Next</Button>
            <Button variant="quiet" onClick={() => setPath("choose")}>Back</Button>
          </form>
        ) : null}
        {path === "rooms" ? (
          <form className="mt-1 flex flex-col gap-3" onSubmit={(event) => { event.preventDefault(); setPath("utilities"); }}>
            <TextField label="Street address" value={street} onChange={(event) => setStreet(event.target.value)} required />
            <TextField label="Suburb" value={suburb} onChange={(event) => setSuburb(event.target.value)} required />
            <SelectField label="State" value={state} onChange={(event) => setState(event.target.value)} required>
              <option value="" disabled>Select a state</option>
              {["ACT", "NSW", "NT", "QLD", "SA", "TAS", "VIC", "WA"].map((item) => <option key={item} value={item}>{item}</option>)}
            </SelectField>
            <TextField label="Postcode" inputMode="numeric" value={postcode} onChange={(event) => setPostcode(event.target.value)} required />
            <TextField label="Bedrooms" type="number" min={1} value={bedrooms} onChange={(event) => setBedrooms(event.target.value)} required />
            <TextField label="Bathrooms" type="number" min={0} value={bathrooms} onChange={(event) => setBathrooms(event.target.value)} required />
            <TextField label="Garages" type="number" min={0} value={garages} onChange={(event) => setGarages(event.target.value)} required />
            {tenants.length > 0 ? (
              <ul className="divide-y divide-line border-y border-line">
                {tenants.map((person, index) => (
                  <li key={`${person.email}-${index}`} className="flex items-center justify-between gap-3 py-3">
                    <div className="min-w-0">
                      <p className="truncate font-medium">{person.firstName} {person.lastName}</p>
                      <p className="truncate text-sm text-muted">{person.email}</p>
                    </div>
                    <Button variant="quiet" onClick={() => setTenants((current) => current.filter((_, item) => item !== index))}>Remove</Button>
                  </li>
                ))}
              </ul>
            ) : null}
            <Button variant="secondary" className="w-full" onClick={() => setAddingTenant((value) => !value)}>{addingTenant ? "Close" : "Add tenant"}</Button>
            {addingTenant ? (
              <div className="flex flex-col gap-3 rounded-lg border border-line p-4">
                {(["firstName", "lastName"] as const).map((key) => (
                  <TextField key={key} label={key === "firstName" ? "First name" : "Last name"} value={tenant[key]} onChange={(event) => setTenant({ ...tenant, [key]: event.target.value })} />
                ))}
                <TextField label="Date of birth" type="date" value={tenant.dateOfBirth} onChange={(event) => setTenant({ ...tenant, dateOfBirth: event.target.value })} />
                <TextField label="Email address" type="email" value={tenant.email} onChange={(event) => setTenant({ ...tenant, email: event.target.value })} />
                <TextField label="Phone number" type="tel" value={tenant.phone} onChange={(event) => setTenant({ ...tenant, phone: event.target.value })} />
                <TextField label="Amount they pay in rent" inputMode="decimal" value={tenant.rentAmount} onChange={(event) => setTenant({ ...tenant, rentAmount: event.target.value })} />
                {tenantError ? <p role="alert" className="text-sm text-danger">{tenantError}</p> : null}
                <Button variant="secondary" onClick={() => {
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
                  setTenants((current) => [...current, { ...tenant, firstName: tenant.firstName.trim(), lastName: tenant.lastName.trim(), email: tenant.email.trim(), phone: tenant.phone.trim() }]);
                  setTenant({ firstName: "", lastName: "", dateOfBirth: "", email: "", phone: "", rentAmount: "" });
                  setTenantError(null);
                  setAddingTenant(false);
                }}>Save tenant</Button>
              </div>
            ) : null}
            <Button type="submit" className="w-full">Next</Button>
            <Button variant="quiet" onClick={() => setPath("blank")}>Back</Button>
          </form>
        ) : null}
        {path === "utilities" ? (
          <form className="mt-1 flex flex-col gap-5" onSubmit={(event: FormEvent) => {
            event.preventDefault();
            const pack = (kind: "power" | "water" | "internet") => ({ ...bills[kind], amount: Number(bills[kind].amount || 0) });
            void onBlank({
              capacity, displayName: displayName.trim(), dateOfBirth, street: street.trim(), suburb: suburb.trim(), state, postcode,
              rentAmount: Number(rentAmount), dueOn, cadence, bedrooms: Number(bedrooms), bathrooms: Number(bathrooms || 0), garages: Number(garages || 0),
              email: user.primaryEmail ?? "",
              tenants: tenants.map((person) => ({ ...person, rentAmount: Number(person.rentAmount) })),
              utilities: { power: pack("power"), water: pack("water"), internet: pack("internet") },
            });
          }}>
            <p className="text-sm text-muted">These are split evenly between the people who live here, then added to each person's rent.</p>
            {(["power", "water", "internet"] as const).map((kind) => (
              <div key={kind} className="flex flex-col gap-3">
                <p className="font-medium">{kind === "power" ? "Power" : kind === "water" ? "Water" : "Internet"}</p>
                <TextField label="Provider" value={bills[kind].provider} onChange={(event) => setBills((current) => ({ ...current, [kind]: { ...current[kind], provider: event.target.value } }))} />
                <TextField label="Amount" inputMode="decimal" value={bills[kind].amount} onChange={(event) => setBills((current) => ({ ...current, [kind]: { ...current[kind], amount: event.target.value } }))} />
                <SelectField label="Payment frequency" value={bills[kind].cadence} onChange={(event) => setBills((current) => ({ ...current, [kind]: { ...current[kind], cadence: event.target.value === "weekly" || event.target.value === "fortnightly" ? event.target.value : "monthly" } }))}>
                  <option value="weekly">Weekly</option>
                  <option value="fortnightly">Fortnightly</option>
                  <option value="monthly">Monthly</option>
                </SelectField>
              </div>
            ))}
            <Button type="submit" className="w-full" disabled={busy}>{busy ? "Opening…" : "Create the house"}</Button>
            <Button variant="quiet" onClick={() => setPath("rooms")}>Back</Button>
          </form>
        ) : null}
        {path === "join" ? (
          <form className="mt-5 flex flex-col gap-3" onSubmit={(event) => { event.preventDefault(); void onJoin({ code: code.trim(), displayName: displayName.trim(), room: room.trim(), weeklyRent: Number(weeklyRent) }); }}>
            <TextField label="House code" value={code} onChange={(event) => setCode(event.target.value.toUpperCase())} autoCapitalize="characters" required />
            <TextField label="Your room" value={room} onChange={(event) => setRoom(event.target.value)} />
            <TextField label="What you pay each period" inputMode="decimal" value={weeklyRent} onChange={(event) => setWeeklyRent(event.target.value)} required />
            <Button type="submit" className="w-full" disabled={busy}>{busy ? "Joining…" : "Join the house"}</Button>
            <Button variant="quiet" onClick={() => setPath("choose")}>Back</Button>
          </form>
        ) : null}
      </div>
    </main>
  );
}
