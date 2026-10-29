export type Cadence = "weekly" | "fortnightly" | "monthly";
export type EventKind = "plan" | "bins" | "guest" | "inspection" | "rent";
export type ProblemSide = "housemate" | "landlord";
export type ProblemStatus = "open" | "sorted";
export type RentStatus = "due" | "sent";
export type UtilityKind = "power" | "water" | "internet";

export const PROBLEM_KINDS = [
  { id: "noise", side: "housemate" as const, label: "Noise after quiet hours" },
  { id: "chores", side: "housemate" as const, label: "Chores not done" },
  { id: "guests", side: "housemate" as const, label: "Guests staying too long" },
  { id: "space", side: "housemate" as const, label: "Shared space left a mess" },
  { id: "food", side: "housemate" as const, label: "Food taken or left out" },
  { id: "bills", side: "housemate" as const, label: "A bill not paid" },
  { id: "pets", side: "housemate" as const, label: "A pet" },
  { id: "smoking", side: "housemate" as const, label: "Smoking inside" },
  { id: "repairs", side: "landlord" as const, label: "Something needs repairing" },
  { id: "water", side: "landlord" as const, label: "Hot water or a leak" },
  { id: "mould", side: "landlord" as const, label: "Mould or damp" },
  { id: "pests", side: "landlord" as const, label: "Pests" },
  { id: "locks", side: "landlord" as const, label: "Locks, keys, or access" },
  { id: "inspection", side: "landlord" as const, label: "An inspection" },
  { id: "bond", side: "landlord" as const, label: "Bond or a rent change" },
] as const;

export type ProblemKind = (typeof PROBLEM_KINDS)[number]["id"];

export type Member = {
  id: string;
  role: "lead" | "tenant";
  displayName: string;
  room: string;
  livesHere: boolean;
  onApp: boolean;
  isYou: boolean;
  email: string;
  phone: string;
};

export type HouseUtility = {
  kind: UtilityKind;
  provider: string;
  amountCents: number;
  cadence: Cadence;
};

export type ChatMessage = {
  id: string;
  memberId: string;
  body: string;
  createdAt: string;
};

export type HouseEvent = {
  id: string;
  memberId: string;
  title: string;
  startsOn: string;
  kind: EventKind;
  notes: string;
};

export type HouseProblem = {
  id: string;
  memberId: string;
  taggedMemberId: string;
  eventId: string;
  kind: ProblemKind;
  side: ProblemSide;
  detail: string;
  status: ProblemStatus;
  createdAt: string;
};

export type Household = {
  id: string;
  street: string;
  suburb: string;
  state: string;
  postcode: string;
  bedrooms: number;
  bathrooms: number;
  garages: number;
  cadence: Cadence;
  dueOn: string;
  wifiName: string;
  wifiPassword: string;
  bankName: string;
  bankBsb: string;
  bankAccount: string;
  bankReference: string;
  rules: string;
  spareNotes: string;
  inviteCode: string;
};

export type YourRent = {
  rentCents: number;
  utilityCents: number;
  owedCents: number;
  period: string;
  status: RentStatus;
  livesHere: boolean;
};

export type HouseSnapshot = {
  household: Household;
  you: Member & { dateOfBirth: string };
  members: Member[];
  utilities: HouseUtility[];
  messages: ChatMessage[];
  events: HouseEvent[];
  problems: HouseProblem[];
  rent: YourRent;
  today: string;
  youLead: boolean;
};
