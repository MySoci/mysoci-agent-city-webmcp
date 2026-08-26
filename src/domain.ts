export const INTERESTS = ["ai", "electronic-music", "photography"] as const;
export const SOCIAL_INTERESTS = [
  "ai",
  "electronic-music",
  "photography",
  "design",
  "film",
  "coffee"
] as const;

export type Interest = (typeof INTERESTS)[number];
export type SocialInterest = (typeof SOCIAL_INTERESTS)[number];
export type EventDay = "saturday" | "sunday";
export type PresenceVisibility = "hidden" | "city-only" | "nearby";
export type Availability = "available" | "busy" | "unavailable";
export type RelationshipKind = "friend" | "connection";

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

export interface SocialPresence {
  visibility: PresenceVisibility;
  city: string;
  coarseArea?: string;
}

export interface SocialProfile {
  id: string;
  name: string;
  handle: string;
  bio: string;
  interests: SocialInterest[];
  avatarIndex: 0 | 1 | 2 | 3;
  availability: Availability;
  presence: SocialPresence;
}

export interface SocialRelationship {
  profileId: string;
  kind: RelationshipKind;
}

export interface MeetupPlace {
  id: string;
  name: string;
  type: "cafe" | "lounge" | "studio";
  summary: string;
  city: string;
  neighborhood: string;
  interests: SocialInterest[];
  atmosphere: string;
  mapPosition: { x: number; y: number };
}

export interface SocialViewState {
  eventId: string | null;
  nearbyFriendIds: string[];
  suggestedPeopleIds: string[];
  recommendedPlaceIds: string[];
}

export type ActivityStatus =
  | "running"
  | "success"
  | "confirmation-required"
  | "error";

export interface ActivityEntry {
  id: string;
  toolName:
    | "search_events"
    | "save_event_to_plan"
    | "search_people"
    | "get_profile"
    | "search_places"
    | "find_nearby_friends"
    | "suggest_people_for_plan";
  summary: string;
  detail: string;
  status: ActivityStatus;
  timestamp: string;
}

export interface CityState {
  events: CityEvent[];
  people: SocialProfile[];
  relationships: SocialRelationship[];
  places: MeetupPlace[];
  visibleEventIds: string[];
  selectedEventId: string;
  savedEventIds: string[];
  pendingConfirmationId: string | null;
  socialView: SocialViewState;
  activities: ActivityEntry[];
}

export interface SearchPeopleInput {
  query?: string;
  interests?: SocialInterest[];
  availability?: Availability;
  presence?: PresenceVisibility;
}

export interface GetProfileInput {
  profileId: string;
}

export interface SearchPlacesInput {
  query?: string;
  interests?: SocialInterest[];
  neighborhood?: string;
  eventId?: string;
}

export interface FindNearbyFriendsInput {
  eventId?: string;
  availability?: "available" | "any";
}

export interface SuggestPeopleForPlanInput {
  eventId?: string;
  maxPeople?: number;
}
