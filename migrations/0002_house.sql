create table if not exists households (
  id text primary key,
  street text not null,
  suburb text not null,
  state text not null,
  postcode text not null,
  bedrooms integer not null,
  bathrooms integer not null,
  garages integer not null,
  rent_cents integer not null,
  rent_cadence text not null,
  rent_due_on text not null,
  wifi_name text not null default '',
  wifi_password text not null default '',
  bank_name text not null default '',
  bank_bsb text not null default '',
  bank_account text not null default '',
  bank_reference text not null default '',
  rules text not null default '',
  spare_notes text not null default '',
  invite_code text not null,
  invite_lookup text not null unique,
  created_at timestamptz not null default now(),
  constraint households_cadence_chk check (rent_cadence in ('weekly', 'fortnightly', 'monthly')),
  constraint households_state_chk check (state in ('ACT', 'NSW', 'NT', 'QLD', 'SA', 'TAS', 'VIC', 'WA'))
);

create table if not exists members (
  id text primary key,
  household_id text not null references households (id) on delete cascade,
  user_id text unique,
  role text not null,
  display_name text not null,
  date_of_birth text not null default '',
  email text not null default '',
  phone text not null default '',
  room text not null default '',
  rent_cents integer not null default 0,
  lives_here boolean not null default true,
  created_at timestamptz not null default now(),
  constraint members_role_chk check (role in ('lead', 'tenant'))
);

create index if not exists members_household_idx on members (household_id);

create table if not exists utilities (
  household_id text not null references households (id) on delete cascade,
  kind text not null,
  provider text not null default '',
  amount_cents integer not null default 0,
  cadence text not null default 'monthly',
  primary key (household_id, kind),
  constraint utilities_kind_chk check (kind in ('power', 'water', 'internet')),
  constraint utilities_cadence_chk check (cadence in ('weekly', 'fortnightly', 'monthly'))
);

create table if not exists messages (
  id text primary key,
  household_id text not null references households (id) on delete cascade,
  member_id text references members (id) on delete set null,
  body text not null,
  created_at timestamptz not null default now()
);

create index if not exists messages_household_idx on messages (household_id, created_at);

create table if not exists events (
  id text primary key,
  household_id text not null references households (id) on delete cascade,
  member_id text references members (id) on delete set null,
  title text not null,
  starts_on text not null,
  kind text not null,
  notes text not null default '',
  constraint events_kind_chk check (kind in ('plan', 'bins', 'guest', 'inspection', 'rent'))
);

create index if not exists events_household_idx on events (household_id, starts_on);

create table if not exists problems (
  id text primary key,
  household_id text not null references households (id) on delete cascade,
  member_id text not null references members (id) on delete cascade,
  tagged_member_id text references members (id) on delete set null,
  event_id text references events (id) on delete set null,
  kind text not null,
  side text not null,
  detail text not null default '',
  status text not null default 'open',
  created_at timestamptz not null default now(),
  constraint problems_side_chk check (side in ('housemate', 'landlord')),
  constraint problems_status_chk check (status in ('open', 'sorted'))
);

create index if not exists problems_household_idx on problems (household_id);

create table if not exists rent_marks (
  member_id text not null references members (id) on delete cascade,
  period text not null,
  status text not null,
  primary key (member_id, period),
  constraint rent_marks_status_chk check (status in ('due', 'sent'))
);
