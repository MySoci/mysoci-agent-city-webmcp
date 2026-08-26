export const INTERESTS = ["ai", "electronic-music", "photography"] as const;

export type Interest = (typeof INTERESTS)[number];
export type EventDay = "saturday" | "sunday";

export interface CityEvent {
  id: string;
  name: string;
  summary: string;
  day: EventDay;
  dateLabel: string;
  time: string;
  price: number;
  venue: string;
  neighborhood: string;
  interests: Interest[];
  mapPosition: { x: number; y: number };
}

export interface SearchEventsInput {
  query?: string;
  interests?: Interest[];
  day?: EventDay;
  maxPrice?: number;
}

export interface SaveEventInput {
  eventId: string;
  confirmed: boolean;
}

export type ActivityStatus =
  | "running"
  | "success"
  | "confirmation-required"
  | "error";

export interface ActivityEntry {
  id: string;
  toolName: "search_events" | "save_event_to_plan";
  summary: string;
  detail: string;
  status: ActivityStatus;
  timestamp: string;
}

export interface CityState {
  events: CityEvent[];
  visibleEventIds: string[];
  selectedEventId: string;
  savedEventIds: string[];
  pendingConfirmationId: string | null;
  activities: ActivityEntry[];
}
