import type {
  CityEvent,
  FindNearbyFriendsInput,
  GetProfileInput,
  MeetupPlace,
  SearchPlacesInput,
  SocialProfile,
  SocialRelationship,
  SocialViewState,
  SuggestPeopleForPlanInput
} from "../domain";
import type { CityStore } from "../state/city-store";
import {
  validateFindNearbyFriendsInput,
  validateGetProfileInput,
  validateSearchPeopleInput,
  validateSearchPlacesInput,
  validateSuggestPeopleForPlanInput
} from "./validation";

const SEARCH_PEOPLE_SCHEMA = {
  type: "object",
  properties: {
    query: {
      type: "string",
      maxLength: 80,
      description: "Optional words matched against a profile name, handle, bio, or interests."
    },
    interests: {
      type: "array",
      maxItems: 3,
      uniqueItems: true,
      items: { enum: ["ai", "electronic-music", "photography", "design", "film", "coffee"] },
      description: "Any interests that may match a profile."
    },
    availability: {
      enum: ["available", "busy", "unavailable"],
      description: "Optional exact availability filter."
    },
    presence: {
      enum: ["hidden", "city-only", "nearby"],
      description: "Optional privacy visibility filter."
    }
  },
  additionalProperties: false
} satisfies Record<string, unknown>;

const GET_PROFILE_SCHEMA = {
  type: "object",
  properties: {
    profileId: {
      type: "string",
      pattern: "^[a-z0-9-]{1,64}$",
      description: "Exact profile id returned by search_people or another social tool."
    }
  },
  required: ["profileId"],
  additionalProperties: false
} satisfies Record<string, unknown>;

const SEARCH_PLACES_SCHEMA = {
  type: "object",
  properties: {
    query: {
      type: "string",
      maxLength: 80,
      description: "Optional words matched against a place name, summary, or atmosphere."
    },
    interests: {
      type: "array",
      maxItems: 3,
      uniqueItems: true,
      items: { enum: ["ai", "electronic-music", "photography", "design", "film", "coffee"] },
      description: "Any interests that may match a meetup place."
    },
    neighborhood: {
      type: "string",
      maxLength: 80,
      description: "Optional coarse neighborhood filter."
    },
    eventId: {
      type: "string",
      pattern: "^[a-z0-9-]{1,64}$",
      description: "Optional event id; when present, use its neighborhood as the coarse anchor."
    }
  },
  additionalProperties: false
} satisfies Record<string, unknown>;

const FIND_NEARBY_FRIENDS_SCHEMA = {
  type: "object",
  properties: {
    eventId: {
      type: "string",
      pattern: "^[a-z0-9-]{1,64}$",
      description: "Optional event id; defaults to the human's currently selected event."
    },
    availability: {
      enum: ["available", "any"],
      description: "Whether to include only friends marked available. Defaults to available."
    }
  },
  additionalProperties: false
} satisfies Record<string, unknown>;

const SUGGEST_PEOPLE_SCHEMA = {
  type: "object",
  properties: {
    eventId: {
      type: "string",
      pattern: "^[a-z0-9-]{1,64}$",
      description: "Optional event id; defaults to the human's currently selected event."
    },
    maxPeople: {
      type: "integer",
      minimum: 1,
      maximum: 3,
      description: "Maximum number of privacy-safe suggestions. Defaults to 3."
    }
  },
  additionalProperties: false
} satisfies Record<string, unknown>;

const publicPresence = (profile: SocialProfile) => {
  if (profile.presence.visibility === "hidden") {
    return { visibility: "hidden" as const, label: "Presence hidden" };
  }
  if (profile.presence.visibility === "city-only") {
    return {
      visibility: "city-only" as const,
      city: profile.presence.city,
      label: `In ${profile.presence.city} (city-level only)`
    };
  }
  return {
    visibility: "nearby" as const,
    city: profile.presence.city,
    coarseArea: profile.presence.coarseArea,
    label: `Near ${profile.presence.coarseArea}`
  };
};

const publicProfile = (store: CityStore, profile: SocialProfile) => ({
  id: profile.id,
  name: profile.name,
  handle: profile.handle,
  bio: profile.bio,
  interests: profile.interests,
  availability: profile.availability,
  presence: publicPresence(profile),
  relationship:
    store.getSnapshot().relationships.find((relationship) => relationship.profileId === profile.id)
      ?.kind ?? "none"
});

const publicPlace = (place: MeetupPlace) => ({
  id: place.id,
  name: place.name,
  type: place.type,
  summary: place.summary,
  city: place.city,
  neighborhood: place.neighborhood,
  interests: place.interests,
  atmosphere: place.atmosphere
});

const resolveEvent = (store: CityStore, eventId?: string): CityEvent => {
  const id = eventId ?? store.getSnapshot().selectedEventId;
  const event = store.getSnapshot().events.find((candidate) => candidate.id === id);
  if (!event) throw new TypeError(`Unknown eventId: ${id}`);
  return event;
};

const queryTokens = (query?: string) =>
  query
    ?.trim()
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean) ?? [];

const matchesText = (value: string, tokens: string[]) =>
  !tokens.length || tokens.some((token) => value.toLowerCase().includes(token));

const profileReason = (
  profile: SocialProfile,
  relationship: "friend" | "connection",
  event: CityEvent
) => {
  const sharedInterests = profile.interests.filter((interest) => event.interests.includes(interest as never));
  const reasons = [relationship === "friend" ? "Friend connection" : "Existing connection"];
  if (sharedInterests.length) {
    reasons.push(`Shared interest: ${sharedInterests.join(", ").replace("electronic-music", "electronic music")}`);
  }
  if (profile.presence.visibility === "nearby" && profile.presence.coarseArea === event.neighborhood) {
    reasons.push(`Approximate presence: near ${event.neighborhood}`);
  } else if (profile.presence.visibility === "city-only") {
    reasons.push(`Approximate presence: in ${profile.presence.city} (city-only)`);
  }
  if (profile.availability === "available") reasons.push("Available now");
  return { sharedInterests, reasons };
};

const mergeSocialView = (
  current: SocialViewState,
  next: Partial<SocialViewState> & { eventId: string }
): SocialViewState => ({
  eventId: next.eventId,
  nearbyFriendIds: next.nearbyFriendIds ?? (current.eventId === next.eventId ? current.nearbyFriendIds : []),
  suggestedPeopleIds:
    next.suggestedPeopleIds ?? (current.eventId === next.eventId ? current.suggestedPeopleIds : []),
  recommendedPlaceIds:
    next.recommendedPlaceIds ?? (current.eventId === next.eventId ? current.recommendedPlaceIds : [])
});

export const createSocialTools = (store: CityStore): WebMCPTool[] => [
  {
    name: "search_people",
    title: "Search social profiles",
    description:
      "Search deterministic fictional profiles by interests, availability, words, or privacy visibility. Hidden presence is never converted into a location.",
    inputSchema: SEARCH_PEOPLE_SCHEMA,
    annotations: { readOnlyHint: true, untrustedContentHint: false },
    execute: async (rawInput, options) => {
      const input = validateSearchPeopleInput(rawInput);
      if (options?.signal?.aborted) throw new DOMException("Tool execution cancelled", "AbortError");
      const activityId = store.beginActivity(
        "search_people",
        "Searching privacy-safe profiles",
        input.interests?.length ? `Looking for ${input.interests.join(" or ")}.` : "Looking across seeded social profiles."
      );
      const tokens = queryTokens(input.query);
      const results = store.getSnapshot().people.filter((profile) => {
        const searchable = [profile.name, profile.handle, profile.bio, ...profile.interests].join(" ");
        return (
          matchesText(searchable, tokens) &&
          (!input.interests?.length || input.interests.some((interest) => profile.interests.includes(interest))) &&
          (!input.availability || profile.availability === input.availability) &&
          (!input.presence || profile.presence.visibility === input.presence)
        );
      });
      store.completeActivity(activityId, "success", `Found ${results.length} privacy-safe profiles.`);
      return {
        count: results.length,
        people: results.map((profile) => publicProfile(store, profile)),
        source: "deterministic-local-seed"
      };
    }
  },
  {
    name: "get_profile",
    title: "Get a social profile",
    description:
      "Read one fictional profile and its relationship. Presence is redacted to hidden, city-only, or coarse nearby visibility; no precise person coordinates are exposed.",
    inputSchema: GET_PROFILE_SCHEMA,
    annotations: { readOnlyHint: true, untrustedContentHint: false },
    execute: async (rawInput, options) => {
      const input: GetProfileInput = validateGetProfileInput(rawInput);
      if (options?.signal?.aborted) throw new DOMException("Tool execution cancelled", "AbortError");
      const profile = store.getSnapshot().people.find((candidate) => candidate.id === input.profileId);
      if (!profile) throw new TypeError(`Unknown profileId: ${input.profileId}`);
      const activityId = store.beginActivity(
        "get_profile",
        `Opening ${profile.name}`,
        "Reading the public profile and privacy-safe presence summary."
      );
      const result = publicProfile(store, profile);
      store.completeActivity(activityId, "success", `${profile.name} profile is ready.`);
      return { profile: result, source: "deterministic-local-seed" };
    }
  },
  {
    name: "search_places",
    title: "Search meetup places",
    description:
      "Search deterministic fictional meetup places by coarse neighborhood, event anchor, interests, or words. Results are planning suggestions, not reservations.",
    inputSchema: SEARCH_PLACES_SCHEMA,
    annotations: { readOnlyHint: true, untrustedContentHint: false },
    execute: async (rawInput, options) => {
      const input: SearchPlacesInput = validateSearchPlacesInput(rawInput);
      if (options?.signal?.aborted) throw new DOMException("Tool execution cancelled", "AbortError");
      const event = input.eventId ? resolveEvent(store, input.eventId) : undefined;
      const activityId = store.beginActivity(
        "search_places",
        "Searching fictional meetup places",
        event ? `Finding a place near ${event.name}.` : "Looking across seeded city places."
      );
      const tokens = queryTokens(input.query);
      const results = store.getSnapshot().places.filter((place) => {
        const searchable = [place.name, place.summary, place.atmosphere, ...place.interests].join(" ");
        const targetNeighborhood = input.neighborhood ?? event?.neighborhood;
        return (
          matchesText(searchable, tokens) &&
          (!input.interests?.length || input.interests.some((interest) => place.interests.includes(interest))) &&
          (!targetNeighborhood || place.neighborhood === targetNeighborhood)
        );
      });
      store.completeActivity(activityId, "success", `Found ${results.length} meetup place${results.length === 1 ? "" : "s"}.`);
      return {
        count: results.length,
        places: results.map(publicPlace),
        eventId: event?.id,
        source: "deterministic-local-seed"
      };
    }
  },
  {
    name: "find_nearby_friends",
    title: "Find nearby friends",
    description:
      "Find friends marked available and nearby the selected event using coarse neighborhood presence only. Hidden and city-only profiles are never returned as nearby.",
    inputSchema: FIND_NEARBY_FRIENDS_SCHEMA,
    annotations: { readOnlyHint: true, untrustedContentHint: false },
    execute: async (rawInput, options) => {
      const input: FindNearbyFriendsInput = validateFindNearbyFriendsInput(rawInput);
      if (options?.signal?.aborted) throw new DOMException("Tool execution cancelled", "AbortError");
      const event = resolveEvent(store, input.eventId);
      const activityId = store.beginActivity(
        "find_nearby_friends",
        `Checking friends near ${event.name}`,
        "Applying friendship, coarse presence, and availability filters."
      );
      const people = store.getSnapshot().relationships
        .filter((relationship) => relationship.kind === "friend")
        .map((relationship) => store.getSnapshot().people.find((profile) => profile.id === relationship.profileId))
        .filter((profile): profile is SocialProfile => Boolean(profile))
        .filter(
          (profile) =>
            profile.presence.visibility === "nearby" &&
            profile.presence.coarseArea === event.neighborhood &&
            (input.availability === "any" || input.availability === undefined || profile.availability === "available")
        );
      store.setSocialView(
        mergeSocialView(store.getSnapshot().socialView, {
          eventId: event.id,
          nearbyFriendIds: people.map((profile) => profile.id)
        })
      );
      store.completeActivity(activityId, "success", `Found ${people.length} nearby friend${people.length === 1 ? "" : "s"}.`);
      return {
        event: { id: event.id, name: event.name, neighborhood: event.neighborhood },
        people: people.map((profile) => ({
          profile: publicProfile(store, profile),
          reason: ["Friend connection", `Approximate presence: near ${event.neighborhood}`, "Available now"]
        })),
        privacyNote: "Nearby means the same coarse neighborhood only; no precise location is shared.",
        sharedState: store.getSnapshot().socialView
      };
    }
  },
  {
    name: "suggest_people_for_plan",
    title: "Suggest people and a meetup place",
    description:
      "Prioritize available friends for the selected event using shared interests and privacy-safe coarse presence, then recommend fictional places in the event neighborhood. Hidden people are excluded.",
    inputSchema: SUGGEST_PEOPLE_SCHEMA,
    annotations: { readOnlyHint: true, untrustedContentHint: false },
    execute: async (rawInput, options) => {
      const input: SuggestPeopleForPlanInput = validateSuggestPeopleForPlanInput(rawInput);
      if (options?.signal?.aborted) throw new DOMException("Tool execution cancelled", "AbortError");
      const event = resolveEvent(store, input.eventId);
      const activityId = store.beginActivity(
        "suggest_people_for_plan",
        `Building the social layer for ${event.name}`,
        "Combining relationships, shared interests, coarse presence, availability, and places."
      );
      const candidates = store.getSnapshot().relationships
        .map((relationship) => ({
          relationship,
          profile: store.getSnapshot().people.find((profile) => profile.id === relationship.profileId)
        }))
        .filter(
          (candidate): candidate is { relationship: SocialRelationship; profile: SocialProfile } => {
            const profile = candidate.profile;
            return profile !== undefined && profile.presence.visibility !== "hidden" && profile.availability === "available";
          }
        )
        .map((candidate) => {
          const reason = profileReason(candidate.profile, candidate.relationship.kind, event);
          const isNearby =
            candidate.profile.presence.visibility === "nearby" &&
            candidate.profile.presence.coarseArea === event.neighborhood;
          const isCityOnly = candidate.profile.presence.visibility === "city-only";
          return {
            ...candidate,
            ...reason,
            isNearby,
            isCityOnly,
            score:
              (candidate.relationship.kind === "friend" ? 100 : 50) +
              reason.sharedInterests.length * 20 +
              (isNearby ? 25 : isCityOnly ? 5 : -100)
          };
        })
        .filter((candidate) => candidate.score > 0 && (candidate.isNearby || candidate.isCityOnly))
        .sort((left, right) => right.score - left.score)
        .slice(0, input.maxPeople ?? 3);
      const places = store.getSnapshot().places
        .filter((place) => place.neighborhood === event.neighborhood)
        .filter((place) => place.interests.some((interest) => event.interests.includes(interest as never)))
        .slice(0, 2);
      store.setSocialView(
        mergeSocialView(store.getSnapshot().socialView, {
          eventId: event.id,
          nearbyFriendIds: candidates.filter((candidate) => candidate.isNearby).map((candidate) => candidate.profile.id),
          suggestedPeopleIds: candidates.map((candidate) => candidate.profile.id),
          recommendedPlaceIds: places.map((place) => place.id)
        })
      );
      store.completeActivity(
        activityId,
        "success",
        `Suggested ${candidates.length} person${candidates.length === 1 ? "" : "s"} and ${places.length} place${places.length === 1 ? "" : "s"}.`
      );
      return {
        event: { id: event.id, name: event.name, interests: event.interests, neighborhood: event.neighborhood },
        people: candidates.map((candidate) => ({
          profile: publicProfile(store, candidate.profile),
          sharedInterests: candidate.sharedInterests,
          nearby: candidate.isNearby,
          reasons: candidate.reasons
        })),
        places: places.map((place) => ({
          place: publicPlace(place),
          reason: `Near ${event.name} in ${event.neighborhood}, matched to the event's interests.`
        })),
        privacyNote: "Hidden profiles are excluded; city-only profiles never reveal a neighborhood; nearby is coarse only.",
        sharedState: store.getSnapshot().socialView
      };
    }
  }
];
