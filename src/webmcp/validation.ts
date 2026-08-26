import { INTERESTS, type Interest, type SaveEventInput, type SearchEventsInput } from "../domain";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const assertOnlyKeys = (input: Record<string, unknown>, allowed: string[]) => {
  const unexpected = Object.keys(input).filter((key) => !allowed.includes(key));
  if (unexpected.length) {
    throw new TypeError(`Unexpected input field: ${unexpected.join(", ")}`);
  }
};

export const validateSearchEventsInput = (input: unknown): SearchEventsInput => {
  if (!isRecord(input)) {
    throw new TypeError("search_events input must be an object.");
  }
  assertOnlyKeys(input, ["query", "interests", "day", "maxPrice"]);

  if (
    input.query !== undefined &&
    (typeof input.query !== "string" || input.query.length > 80)
  ) {
    throw new TypeError("query must be a string of at most 80 characters.");
  }

  if (input.interests !== undefined) {
    if (!Array.isArray(input.interests) || input.interests.length > 3) {
      throw new TypeError("interests must be an array with at most 3 values.");
    }
    if (
      input.interests.some(
        (interest) =>
          typeof interest !== "string" ||
          !INTERESTS.includes(interest as Interest)
      )
    ) {
      throw new TypeError("interests contains an unsupported value.");
    }
  }

  if (input.day !== undefined && input.day !== "saturday" && input.day !== "sunday") {
    throw new TypeError("day must be saturday or sunday.");
  }

  if (
    input.maxPrice !== undefined &&
    (typeof input.maxPrice !== "number" ||
      !Number.isInteger(input.maxPrice) ||
      input.maxPrice < 0 ||
      input.maxPrice > 200)
  ) {
    throw new TypeError("maxPrice must be an integer between 0 and 200.");
  }

  return {
    query: input.query as string | undefined,
    interests: input.interests as Interest[] | undefined,
    day: input.day as SearchEventsInput["day"],
    maxPrice: input.maxPrice as number | undefined
  };
};

export const validateSaveEventInput = (input: unknown): SaveEventInput => {
  if (!isRecord(input)) {
    throw new TypeError("save_event_to_plan input must be an object.");
  }
  assertOnlyKeys(input, ["eventId", "confirmed"]);

  if (typeof input.eventId !== "string" || !/^[a-z0-9-]{1,64}$/.test(input.eventId)) {
    throw new TypeError("eventId must be a valid seeded event identifier.");
  }
  if (typeof input.confirmed !== "boolean") {
    throw new TypeError("confirmed must be a boolean.");
  }

  return { eventId: input.eventId, confirmed: input.confirmed };
};
