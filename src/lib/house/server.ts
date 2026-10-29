import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { getSql } from "@/lib/db";
import { blind, open, seal } from "./crypto";
import { brisbaneToday, isProblemKind, toCadence, upcomingDue } from "./format";
import { PROBLEM_KINDS, type Cadence, type EventKind, type HouseSnapshot, type ProblemKind, type UtilityKind } from "./types";

type Sql = Awaited<ReturnType<typeof getSql>>;

function fail(message: string): never {
  throw new Error(message);
}

function asObject(input: unknown): Record<string, unknown> {
  if (!input || typeof input !== "object") fail("That didn't come through.");
  return input as Record<string, unknown>;
}

function text(value: unknown, max: number): string {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, max);
}

function required(obj: Record<string, unknown>, key: string, max: number, label: string): string {
  const value = text(obj[key], max);
  if (!value) fail(`Enter ${label}.`);
  return value;
}

function isoDay(value: string, label: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) fail(`Pick a date for ${label}.`);
  const [y, m, d] = value.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  if (dt.getUTCFullYear() !== y || dt.getUTCMonth() !== m - 1 || dt.getUTCDate() !== d) fail(`Pick a real date for ${label}.`);
  return value;
}

function cadenceOf(value: unknown): Cadence {
  if (value === "fortnightly" || value === "monthly" || value === "weekly") return value;
  fail("Pick how often.");
}

function dollars(value: unknown, label: string): number {
  const amount = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(amount) || amount < 0 || amount > 100000) fail(`Enter ${label}.`);
  return Math.round(amount * 100);
}

function whole(value: unknown, min: number, max: number, label: string): number {
  const amount = typeof value === "number" ? value : Number(value);
  if (!Number.isInteger(amount) || amount < min || amount > max) fail(`Enter ${label}.`);
  return amount;
}

const STATES = new Set(["ACT", "NSW", "NT", "QLD", "SA", "TAS", "VIC", "WA"]);

function inviteCode(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = crypto.getRandomValues(new Uint8Array(6));
  return Array.from(bytes, (byte) => alphabet[byte % alphabet.length]).join("");
}

async function membership(sql: Sql, userId: string) {
  const rows = await sql<{ id: string; household_id: string; role: string }>`
    select id, household_id, role from members where user_id = ${userId} limit 1
  `;
  return rows[0] ?? null;
}

async function requireMember(sql: Sql, userId: string) {
  const found = await membership(sql, userId);
  if (!found) fail("You are not in a house yet.");
  return found;
}

function bill(input: unknown) {
  const obj = asObject(input);
  return {
    provider: text(obj.provider, 80),
    amountCents: dollars(obj.amount ?? 0, "the amount"),
    cadence: cadenceOf(obj.cadence ?? "monthly"),
  };
}

async function writeUtility(sql: Sql, householdId: string, kind: UtilityKind, row: { provider: string; amountCents: number; cadence: Cadence }) {
  await sql`
    insert into utilities (household_id, kind, provider, amount_cents, cadence)
    values (${householdId}, ${kind}, ${seal(row.provider)}, ${row.amountCents}, ${row.cadence})
    on conflict (household_id, kind) do update
      set provider = excluded.provider, amount_cents = excluded.amount_cents, cadence = excluded.cadence
  `;
}

export const getHouse = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }): Promise<HouseSnapshot | null> => {
    const sql = await getSql();
    const found = await membership(sql, context.userId);
    if (!found) return null;
    const today = brisbaneToday();
    const houses = await sql<{
      id: string;
      street: string;
      suburb: string;
      state: string;
      postcode: string;
      bedrooms: number;
      bathrooms: number;
      garages: number;
      rent_cents: number;
      rent_cadence: Cadence;
      rent_due_on: string;
      wifi_name: string;
      wifi_password: string;
      bank_name: string;
      bank_bsb: string;
      bank_account: string;
      bank_reference: string;
      rules: string;
      spare_notes: string;
      invite_code: string;
    }>`
      select id, street, suburb, state, postcode, bedrooms, bathrooms, garages, rent_cents, rent_cadence,
             rent_due_on, wifi_name, wifi_password, bank_name, bank_bsb, bank_account, bank_reference,
             rules, spare_notes, invite_code
      from households where id = ${found.household_id}
    `;
    const house = houses[0];
    if (!house) return null;
    const youLead = found.role === "lead";
    const people = await sql<{
      id: string;
      user_id: string | null;
      role: "lead" | "tenant";
      display_name: string;
      date_of_birth: string;
      email: string;
      phone: string;
      room: string;
      rent_cents: number;
      lives_here: boolean;
    }>`
      select id, user_id, role, display_name, date_of_birth, email, phone, room, rent_cents, lives_here
      from members where household_id = ${house.id} order by created_at
    `;
    const youRow = people.find((person) => person.id === found.id);
    if (!youRow) return null;
    const utils = await sql<{ kind: UtilityKind; provider: string; amount_cents: number; cadence: Cadence }>`
      select kind, provider, amount_cents, cadence from utilities where household_id = ${house.id}
    `;
    const liveCount = Math.max(1, people.filter((person) => person.lives_here).length);
    const cadence = house.rent_cadence;
    const utilityCents = youRow.lives_here
      ? utils.reduce((sum, row) => sum + Math.round(toCadence(row.amount_cents, row.cadence, cadence) / liveCount), 0)
      : 0;
    const dueOn = upcomingDue(house.rent_due_on, cadence, today);
    const marks = await sql<{ status: "due" | "sent" }>`
      select status from rent_marks where member_id = ${youRow.id} and period = ${dueOn}
    `;
    const messages = await sql<{ id: string; member_id: string | null; body: string; created_at: string }>`
      select id, member_id, body, created_at::text as created_at
      from messages where household_id = ${house.id}
      order by created_at desc limit 40
    `;
    const events = await sql<{ id: string; member_id: string | null; title: string; starts_on: string; kind: EventKind; notes: string }>`
      select id, member_id, title, starts_on, kind, notes
      from events where household_id = ${house.id}
      order by starts_on, title
    `;
    const problems = await sql<{
      id: string;
      member_id: string;
      tagged_member_id: string | null;
      event_id: string | null;
      kind: string;
      side: "housemate" | "landlord";
      detail: string;
      status: "open" | "sorted";
      created_at: string;
    }>`
      select id, member_id, tagged_member_id, event_id, kind, side, detail, status, created_at::text as created_at
      from problems
      where household_id = ${house.id}
        and (
          member_id = ${found.id}
          or tagged_member_id = ${found.id}
          or exists (select 1 from members where id = ${found.id} and role = 'lead')
        )
      order by created_at desc
    `;
    const seeContact = (personId: string) => youLead || personId === youRow.id;
    return {
      household: {
        id: house.id,
        street: open(house.street),
        suburb: open(house.suburb),
        state: house.state,
        postcode: house.postcode,
        bedrooms: house.bedrooms,
        bathrooms: house.bathrooms,
        garages: house.garages,
        cadence,
        dueOn,
        wifiName: open(house.wifi_name),
        wifiPassword: open(house.wifi_password),
        bankName: open(house.bank_name),
        bankBsb: open(house.bank_bsb),
        bankAccount: open(house.bank_account),
        bankReference: open(house.bank_reference),
        rules: open(house.rules),
        spareNotes: open(house.spare_notes),
        inviteCode: open(house.invite_code),
      },
      you: {
        id: youRow.id,
        role: youRow.role,
        displayName: open(youRow.display_name),
        room: open(youRow.room),
        livesHere: youRow.lives_here,
        onApp: Boolean(youRow.user_id),
        isYou: true,
        email: open(youRow.email),
        phone: open(youRow.phone),
        dateOfBirth: open(youRow.date_of_birth),
      },
      members: people.map((person) => ({
        id: person.id,
        role: person.role,
        displayName: open(person.display_name),
        room: open(person.room),
        livesHere: person.lives_here,
        onApp: Boolean(person.user_id),
        isYou: person.id === youRow.id,
        email: seeContact(person.id) ? open(person.email) : "",
        phone: seeContact(person.id) ? open(person.phone) : "",
      })),
      utilities: utils.map((row) => ({
        kind: row.kind,
        provider: open(row.provider),
        amountCents: row.amount_cents,
        cadence: row.cadence,
      })),
      messages: messages
        .reverse()
        .map((row) => ({ id: row.id, memberId: row.member_id ?? "", body: open(row.body), createdAt: row.created_at })),
      events: events.map((row) => ({
        id: row.id,
        memberId: row.member_id ?? "",
        title: open(row.title),
        startsOn: row.starts_on,
        kind: row.kind,
        notes: open(row.notes),
      })),
      problems: problems.flatMap((row) => {
        if (!isProblemKind(row.kind)) return [];
        return [{
          id: row.id,
          memberId: row.member_id,
          taggedMemberId: row.tagged_member_id ?? "",
          eventId: row.event_id ?? "",
          kind: row.kind,
          side: row.side,
          detail: open(row.detail),
          status: row.status,
          createdAt: row.created_at,
        }];
      }),
      rent: {
        rentCents: youRow.lives_here ? youRow.rent_cents : 0,
        utilityCents,
        owedCents: (youRow.lives_here ? youRow.rent_cents : 0) + utilityCents,
        period: dueOn,
        status: marks[0]?.status ?? "due",
        livesHere: youRow.lives_here,
      },
      today,
      youLead,
    };
  });

export const openSample = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) => {
    const obj = asObject(input);
    return {
      displayName: required(obj, "displayName", 80, "your name"),
      weeklyRent: dollars(obj.weeklyRent, "your weekly rent"),
    };
  })
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    if (await membership(sql, context.userId)) fail("You are already in a house.");
    const id = crypto.randomUUID();
    const code = inviteCode();
    const today = brisbaneToday();
    const due = upcomingDue(today, "weekly", today);
    await sql`
      insert into households (
        id, street, suburb, state, postcode, bedrooms, bathrooms, garages, rent_cents, rent_cadence, rent_due_on,
        wifi_name, wifi_password, bank_name, bank_bsb, bank_account, bank_reference, rules, spare_notes, invite_code, invite_lookup
      ) values (
        ${id}, ${seal("18 Latrobe Terrace")}, ${seal("Paddington")}, 'QLD', '4064', 3, 1, 0, ${28000 + 26500 + data.weeklyRent},
        'weekly', ${due},
        ${seal("Latrobe")}, ${seal("spare-key")}, ${seal("Maya Chen")}, ${seal("062-000")}, ${seal("1234 5678")}, ${seal("Latrobe rent")},
        ${seal("Quiet after 10. Dishes the same night. A guest for one night is fine. Longer than that, ask first.")},
        ${seal("Spare key is in the meter box. Bins go out Wednesday night.")},
        ${seal(code)}, ${blind(code)}
      )
    `;
    const maya = crypto.randomUUID();
    const jonah = crypto.randomUUID();
    const you = crypto.randomUUID();
    await sql`
      insert into members (id, household_id, user_id, role, display_name, room, rent_cents, email, lives_here)
      values
        (${maya}, ${id}, null, 'lead', ${seal("Maya Chen")}, ${seal("Front room")}, 28000, ${seal("maya@example.com")}, true),
        (${jonah}, ${id}, null, 'tenant', ${seal("Jonah Hale")}, ${seal("Sunroom")}, 26500, ${seal("jonah@example.com")}, true),
        (${you}, ${id}, ${context.userId}, 'tenant', ${seal(data.displayName)}, ${seal("")}, ${data.weeklyRent}, ${seal("")}, true)
    `;
    await writeUtility(sql, id, "power", { provider: "Origin", amountCents: 18000, cadence: "monthly" });
    await writeUtility(sql, id, "water", { provider: "Urban Utilities", amountCents: 9000, cadence: "monthly" });
    await writeUtility(sql, id, "internet", { provider: "Aussie Broadband", amountCents: 8000, cadence: "monthly" });
    const bins = addDays(today, (3 - brisbaneWeekday(today) + 7) % 7 || 7);
    await sql`
      insert into events (id, household_id, member_id, title, starts_on, kind, notes) values
        (${crypto.randomUUID()}, ${id}, ${jonah}, ${seal("Bin night")}, ${bins}, 'bins', ${seal("Yellow bin this week.")}),
        (${crypto.randomUUID()}, ${id}, ${maya}, ${seal("Rent due")}, ${due}, 'rent', ${seal("")})
    `;
    await sql`
      insert into messages (id, household_id, member_id, body)
      values (${crypto.randomUUID()}, ${id}, ${jonah}, ${seal("I'll take the bins this week.")})
    `;
    return { ok: true as const };
  });

function brisbaneWeekday(iso: string): number {
  const date = new Date(`${iso}T12:00:00+10:00`);
  return date.getUTCDay();
}

function addDays(iso: string, days: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d + days));
  return date.toISOString().slice(0, 10);
}

const tenantShape = (input: unknown) => {
  const obj = asObject(input);
  const email = required(obj, "email", 120, "an email address");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) fail("Enter a valid email address.");
  return {
    firstName: required(obj, "firstName", 40, "a first name"),
    lastName: required(obj, "lastName", 40, "a last name"),
    dateOfBirth: isoDay(required(obj, "dateOfBirth", 10, "a date of birth"), "date of birth"),
    email,
    phone: required(obj, "phone", 30, "a phone number"),
    rentAmount: dollars(obj.rentAmount, "the amount they pay"),
  };
};

export const createHouse = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) => {
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
        internet: bill(utilities.internet ?? {}),
      },
    };
  })
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    if (await membership(sql, context.userId)) fail("You are already in a house.");
    const id = crypto.randomUUID();
    const code = inviteCode();
    const livesHere = data.capacity === "tenant";
    await sql`
      insert into households (
        id, street, suburb, state, postcode, bedrooms, bathrooms, garages, rent_cents, rent_cadence, rent_due_on,
        invite_code, invite_lookup
      ) values (
        ${id}, ${seal(data.street)}, ${seal(data.suburb)}, ${data.state}, ${data.postcode},
        ${data.bedrooms}, ${data.bathrooms}, ${data.garages}, ${data.rentAmount}, ${data.cadence}, ${data.dueOn},
        ${seal(code)}, ${blind(code)}
      )
    `;
    await sql`
      insert into members (id, household_id, user_id, role, display_name, date_of_birth, email, rent_cents, lives_here)
      values (
        ${crypto.randomUUID()}, ${id}, ${context.userId}, 'lead', ${seal(data.displayName)},
        ${seal(data.dateOfBirth)}, ${seal(data.email)}, ${livesHere ? data.rentAmount : 0}, ${livesHere}
      )
    `;
    for (const person of data.tenants) {
      await sql`
        insert into members (id, household_id, role, display_name, date_of_birth, email, phone, rent_cents, lives_here)
        values (
          ${crypto.randomUUID()}, ${id}, 'tenant', ${seal(`${person.firstName} ${person.lastName}`)},
          ${seal(person.dateOfBirth)}, ${seal(person.email)}, ${seal(person.phone)}, ${person.rentAmount}, true
        )
      `;
    }
    await writeUtility(sql, id, "power", data.utilities.power);
    await writeUtility(sql, id, "water", data.utilities.water);
    await writeUtility(sql, id, "internet", data.utilities.internet);
    return { ok: true as const };
  });

export const joinHouse = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) => {
    const obj = asObject(input);
    return {
      code: required(obj, "code", 12, "the house code").toUpperCase().replace(/[^A-Z0-9]/g, ""),
      displayName: required(obj, "displayName", 80, "your name"),
      room: text(obj.room, 40),
      weeklyRent: dollars(obj.weeklyRent, "what you pay"),
    };
  })
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    if (await membership(sql, context.userId)) fail("Leave your current house before joining another.");
    if (data.code.length < 4) fail("That code doesn't match a house.");
    const houses = await sql<{ id: string }>`
      select id from households where invite_lookup = ${blind(data.code)}
    `;
    const house = houses[0];
    if (!house) fail("That code doesn't match a house.");
    await sql`
      insert into members (id, household_id, user_id, role, display_name, room, rent_cents, lives_here)
      values (${crypto.randomUUID()}, ${house.id}, ${context.userId}, 'tenant', ${seal(data.displayName)}, ${seal(data.room)}, ${data.weeklyRent}, true)
    `;
    return { ok: true as const };
  });

export const saveMe = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) => {
    const obj = asObject(input);
    const dob = text(obj.dateOfBirth, 10);
    return {
      displayName: required(obj, "displayName", 80, "your name"),
      dateOfBirth: dob ? isoDay(dob, "date of birth") : "",
      email: text(obj.email, 120),
      phone: text(obj.phone, 30),
    };
  })
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const found = await requireMember(sql, context.userId);
    if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) fail("Enter a valid email address.");
    await sql`
      update members
      set display_name = ${seal(data.displayName)}, date_of_birth = ${seal(data.dateOfBirth)},
          email = ${seal(data.email)}, phone = ${seal(data.phone)}
      where id = ${found.id} and user_id = ${context.userId}
    `;
    return { ok: true as const };
  });

export const saveHouse = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) => {
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
      rules: text(obj.rules, 1000),
      spareNotes: text(obj.spareNotes, 1000),
      utilities: {
        power: bill(utilities.power ?? {}),
        water: bill(utilities.water ?? {}),
        internet: bill(utilities.internet ?? {}),
      },
    };
  })
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const found = await requireMember(sql, context.userId);
    if (found.role !== "lead") fail("Only the house manager can change the house.");
    await sql`
      update households set
        street = ${seal(data.street)}, suburb = ${seal(data.suburb)}, state = ${data.state}, postcode = ${data.postcode},
        bedrooms = ${data.bedrooms}, bathrooms = ${data.bathrooms}, garages = ${data.garages},
        rent_cadence = ${data.cadence}, rent_due_on = ${data.dueOn},
        wifi_name = ${seal(data.wifiName)}, wifi_password = ${seal(data.wifiPassword)},
        bank_name = ${seal(data.bankName)}, bank_bsb = ${seal(data.bankBsb)},
        bank_account = ${seal(data.bankAccount)}, bank_reference = ${seal(data.bankReference)},
        rules = ${seal(data.rules)}, spare_notes = ${seal(data.spareNotes)}
      where id = ${found.household_id}
    `;
    await writeUtility(sql, found.household_id, "power", data.utilities.power);
    await writeUtility(sql, found.household_id, "water", data.utilities.water);
    await writeUtility(sql, found.household_id, "internet", data.utilities.internet);
    return { ok: true as const };
  });

export const addMember = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) => {
    const obj = asObject(input);
    return {
      displayName: required(obj, "displayName", 80, "their name"),
      room: text(obj.room, 40),
      weeklyRent: dollars(obj.weeklyRent, "what they pay"),
    };
  })
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const found = await requireMember(sql, context.userId);
    if (found.role !== "lead") fail("Only the house manager can add someone.");
    await sql`
      insert into members (id, household_id, role, display_name, room, rent_cents, lives_here)
      values (${crypto.randomUUID()}, ${found.household_id}, 'tenant', ${seal(data.displayName)}, ${seal(data.room)}, ${data.weeklyRent}, true)
    `;
    return { ok: true as const };
  });

export const leaveHouse = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const found = await requireMember(sql, context.userId);
    const counts = await sql<{ n: number }>`select count(*)::int as n from members where household_id = ${found.household_id}`;
    if ((counts[0]?.n ?? 1) <= 1) fail("You are the last person. Delete your profile if the house should go too.");
    await sql`delete from members where id = ${found.id} and user_id = ${context.userId}`;
    return { ok: true as const };
  });

export const deleteProfile = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) => {
    const obj = asObject(input);
    return { confirmHouse: obj.confirmHouse === true };
  })
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const found = await requireMember(sql, context.userId);
    const counts = await sql<{ n: number }>`select count(*)::int as n from members where household_id = ${found.household_id}`;
    const last = (counts[0]?.n ?? 1) <= 1;
    if (last && !data.confirmHouse) fail("You are the last person, so the house will be deleted too.");
    if (last) {
      await sql`delete from households where id = ${found.household_id}`;
    } else {
      await sql`delete from members where id = ${found.id} and user_id = ${context.userId}`;
    }
    return { ok: true as const };
  });

export const postMessage = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) => {
    const obj = asObject(input);
    return { body: required(obj, "body", 1000, "a message") };
  })
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const found = await requireMember(sql, context.userId);
    await sql`
      insert into messages (id, household_id, member_id, body)
      values (${crypto.randomUUID()}, ${found.household_id}, ${found.id}, ${seal(data.body)})
    `;
    return { ok: true as const };
  });

export const addEvent = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) => {
    const obj = asObject(input);
    const kind = obj.kind;
    if (kind !== "plan" && kind !== "bins" && kind !== "guest" && kind !== "inspection" && kind !== "rent") fail("Pick a kind of event.");
    return {
      title: required(obj, "title", 120, "a title"),
      startsOn: isoDay(required(obj, "startsOn", 10, "a date"), "the event"),
      kind: kind as EventKind,
      notes: text(obj.notes, 500),
    };
  })
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const found = await requireMember(sql, context.userId);
    await sql`
      insert into events (id, household_id, member_id, title, starts_on, kind, notes)
      values (${crypto.randomUUID()}, ${found.household_id}, ${found.id}, ${seal(data.title)}, ${data.startsOn}, ${data.kind}, ${seal(data.notes)})
    `;
    return { ok: true as const };
  });

export const deleteEvent = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) => ({ id: required(asObject(input), "id", 80, "the event") }))
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const found = await requireMember(sql, context.userId);
    const rows = await sql<{ member_id: string | null }>`
      select member_id from events where id = ${data.id} and household_id = ${found.household_id}
    `;
    const event = rows[0];
    if (!event) fail("That event is already gone.");
    if (event.member_id !== found.id && found.role !== "lead") fail("You can only remove an event you added.");
    await sql`delete from events where id = ${data.id} and household_id = ${found.household_id}`;
    return { ok: true as const };
  });

export const reportProblem = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) => {
    const obj = asObject(input);
    const kind = required(obj, "kind", 40, "what's wrong");
    if (!isProblemKind(kind)) fail("Pick what's wrong.");
    return { kind: kind as ProblemKind, detail: text(obj.detail, 1000), taggedMemberId: text(obj.taggedMemberId, 80) };
  })
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const found = await requireMember(sql, context.userId);
    let tagged: string | null = null;
    if (data.taggedMemberId) {
      const people = await sql<{ id: string }>`
        select id from members where id = ${data.taggedMemberId} and household_id = ${found.household_id} and id <> ${found.id}
      `;
      if (!people[0]) fail("That housemate is not in this house.");
      tagged = people[0].id;
    }
    const known = PROBLEM_KINDS.find((item) => item.id === data.kind);
    await sql`
      insert into problems (id, household_id, member_id, tagged_member_id, kind, side, detail)
      values (${crypto.randomUUID()}, ${found.household_id}, ${found.id}, ${tagged}, ${data.kind}, ${known?.side ?? "housemate"}, ${seal(data.detail)})
    `;
    return { ok: true as const };
  });

export const sortProblem = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) => ({ id: required(asObject(input), "id", 80, "the report") }))
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const found = await requireMember(sql, context.userId);
    const updated = await sql<{ id: string }>`
      update problems set status = 'sorted'
      where id = ${data.id} and household_id = ${found.household_id} and status = 'open'
        and (member_id = ${found.id} or ${found.role} = 'lead')
      returning id
    `;
    if (updated.length === 0) fail("That report is already sorted, or it is not yours to close.");
    return { ok: true as const };
  });

export const scheduleProblem = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) => {
    const obj = asObject(input);
    return { id: required(obj, "id", 80, "the report"), startsOn: isoDay(required(obj, "startsOn", 10, "a date"), "the calendar") };
  })
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const found = await requireMember(sql, context.userId);
    if (found.role !== "lead") fail("Only the house manager can put a problem on the calendar.");
    const rows = await sql<{ id: string; kind: string; detail: string; member_id: string; tagged_member_id: string | null; event_id: string | null }>`
      select id, kind, detail, member_id, tagged_member_id, event_id
      from problems where id = ${data.id} and household_id = ${found.household_id}
    `;
    const problem = rows[0];
    if (!problem || !isProblemKind(problem.kind)) fail("That report is gone.");
    if (problem.event_id) {
      const existing = await sql<{ id: string }>`select id from events where id = ${problem.event_id}`;
      if (existing.length > 0) fail("That problem is already on the calendar.");
    }
    const people = await sql<{ id: string; display_name: string }>`
      select id, display_name from members where household_id = ${found.household_id}
    `;
    const nameOf = (id: string | null) => {
      const person = people.find((row) => row.id === id);
      return person ? open(person.display_name) : "";
    };
    const label = PROBLEM_KINDS.find((item) => item.id === problem.kind)?.label ?? "Problem";
    const notes = [open(problem.detail), nameOf(problem.member_id) ? `Reported by ${nameOf(problem.member_id)}` : "", nameOf(problem.tagged_member_id) ? `Includes ${nameOf(problem.tagged_member_id)}` : ""]
      .filter(Boolean)
      .join("\n")
      .slice(0, 500);
    const eventId = crypto.randomUUID();
    await sql`
      insert into events (id, household_id, member_id, title, starts_on, kind, notes)
      values (${eventId}, ${found.household_id}, ${found.id}, ${seal(label)}, ${data.startsOn}, 'plan', ${seal(notes)})
    `;
    await sql`update problems set event_id = ${eventId} where id = ${problem.id}`;
    return { ok: true as const };
  });

export const markRent = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) => {
    const status = asObject(input).status;
    if (status !== "sent" && status !== "due") fail("That status is not valid.");
    return { status };
  })
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const found = await requireMember(sql, context.userId);
    const houses = await sql<{ rent_due_on: string; rent_cadence: Cadence }>`
      select rent_due_on, rent_cadence from households where id = ${found.household_id}
    `;
    const house = houses[0];
    if (!house) fail("That house is gone.");
    const period = upcomingDue(house.rent_due_on, house.rent_cadence, brisbaneToday());
    await sql`
      insert into rent_marks (member_id, period, status) values (${found.id}, ${period}, ${data.status})
      on conflict (member_id, period) do update set status = excluded.status
    `;
    return { ok: true as const };
  });
