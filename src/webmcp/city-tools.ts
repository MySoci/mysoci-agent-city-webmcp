import type { CityEvent, SearchEventsInput } from "../domain";
import type { CityStore } from "../state/city-store";
import { validateSaveEventInput, validateSearchEventsInput } from "./validation";

const SEARCH_EVENTS_SCHEMA = {
  type: "object",
  properties: {
    query: {
      type: "string",
      maxLength: 80,
      description: "Optional words matched against event, venue, and neighborhood."
    },
    interests: {
      type: "array",
      maxItems: 3,
      uniqueItems: true,
      items: { enum: ["ai", "electronic-music", "photography"] },
      description: "Any interests that may match an event."
    },
    day: {
      enum: ["saturday", "sunday"],
      description: "Weekend day to search."
    },
    maxPrice: {
      type: "integer",
      minimum: 0,
      maximum: 200,
      description: "Maximum ticket price in USD."
    }
  },
  additionalProperties: false
} satisfies Record<string, unknown>;

const SAVE_EVENT_SCHEMA = {
  type: "object",
  properties: {
    eventId: {
      type: "string",
      pattern: "^[a-z0-9-]{1,64}$",
      description: "Exact event id returned by search_events."
    },
    confirmed: {
      type: "boolean",
      description: "True only after the human explicitly approves saving this event."
    }
  },
  required: ["eventId", "confirmed"],
  additionalProperties: false
} satisfies Record<string, unknown>;

const publicEvent = (event: CityEvent) => ({
  id: event.id,
  name: event.name,
  summary: event.summary,
  day: event.day,
  time: event.time,
  priceUsd: event.price,
  venue: event.venue,
  neighborhood: event.neighborhood,
  interests: event.interests
});

const interestLabel = (interest: string) =>
  interest === "electronic-music" ? "electronic music" : interest.toUpperCase();

const searchSummary = (input: SearchEventsInput) => {
  const focus = input.interests?.length
    ? input.interests.map(interestLabel).join(" or ")
    : input.query || "city";
  const budget = input.maxPrice === undefined ? "" : ` under $${input.maxPrice}`;
  return `Searching for ${focus} events${budget}.`;
};

export const createCityTools = (store: CityStore): WebMCPTool[] => [
  {
    name: "search_events",
    title: "Search city events",
    description:
      "Search the app's deterministic New York weekend events by words, interests, day, and maximum ticket price. Returns event ids for later planning. Does not change the saved plan.",
    inputSchema: SEARCH_EVENTS_SCHEMA,
    annotations: { readOnlyHint: true, untrustedContentHint: false },
    execute: async (rawInput, options) => {
      const input = validateSearchEventsInput(rawInput);
      if (options?.signal?.aborted) {
        throw new DOMException("Tool execution cancelled", "AbortError");
      }

      const activityId = store.beginActivity(
        "search_events",
        "Searching seeded city events",
        searchSummary(input)
      );
      const matches = store.searchEvents(input);
      store.completeActivity(
        activityId,
        "success",
        `Found ${matches.length} event${matches.length === 1 ? "" : "s"} matching the request.`
      );

      return {
        count: matches.length,
        events: matches.map(publicEvent),
        source: "deterministic-local-seed",
        sharedState: { selectedEventId: store.getSnapshot().selectedEventId }
      };
    }
  },
  {
    name: "save_event_to_plan",
    title: "Save event to Saturday plan",
    description:
      "Save one seeded event to the shared Saturday plan. Call with confirmed=false to request visible human approval. Call again with confirmed=true only after the human explicitly approves. The UI can remove the event afterward.",
    inputSchema: SAVE_EVENT_SCHEMA,
    annotations: { readOnlyHint: false, untrustedContentHint: false },
    execute: async (rawInput, options) => {
      const input = validateSaveEventInput(rawInput);
      if (options?.signal?.aborted) {
        throw new DOMException("Tool execution cancelled", "AbortError");
      }

      const event = store
        .getSnapshot()
        .events.find((candidate) => candidate.id === input.eventId);
      if (!event) throw new TypeError(`Unknown eventId: ${input.eventId}`);

      const activityId = store.beginActivity(
        "save_event_to_plan",
        `Preparing ${event.name}`,
        "Checking human confirmation before changing the shared plan."
      );

      if (!input.confirmed) {
        store.requestSave(input.eventId);
        store.completeActivity(
          activityId,
          "confirmation-required",
          `Waiting for human approval to save ${event.name}.`
        );
        return {
          status: "confirmation_required",
          event: publicEvent(event),
          instruction: "Ask the human to approve in the visible app before calling again."
        };
      }

      const changed = store.saveEvent(input.eventId);
      store.completeActivity(
        activityId,
        "success",
        changed
          ? `${event.name} was saved to the shared Saturday plan.`
          : `${event.name} was already in the shared Saturday plan.`
      );
      return {
        status: changed ? "saved" : "already_saved",
        event: publicEvent(event),
        sharedState: { savedEventIds: store.getSnapshot().savedEventIds }
      };
    }
  }
];
