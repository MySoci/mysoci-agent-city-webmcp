import {
  INTERESTS,
  SOCIAL_INTERESTS,
  type Availability,
  type FindNearbyFriendsInput,
  type GetProfileInput,
  type Interest,
  type SearchPeopleInput,
  type SearchPlacesInput,
  type SaveEventInput,
  type SearchEventsInput,
  type SocialInterest,
  type SuggestPeopleForPlanInput
} from "../domain";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const assertOnlyKeys = (input: Record<string, unknown>, allowed: string[]) => {
  const unexpected = Object.keys(input).filter((key) => !allowed.includes(key));
  if (unexpected.length) {
    throw new TypeError(`Unexpected input field: ${unexpected.join(", ")}`);
  }
};

const validateOptionalQuery = (input: Record<string, unknown>) => {
  if (
    input.query !== undefined &&
    (typeof input.query !== "string" || input.query.length > 80)
  ) {
    throw new TypeError("query must be a string of at most 80 characters.");
  }
};

const validateSocialInterests = (input: Record<string, unknown>) => {
  if (input.interests === undefined) return;
  if (!Array.isArray(input.interests) || input.interests.length > 3) {
    throw new TypeError("interests must be an array with at most 3 values.");
  }
  if (
    input.interests.some(
      (interest) =>
        typeof interest !== "string" ||
        !SOCIAL_INTERESTS.includes(interest as SocialInterest)
    )
  ) {
    throw new TypeError("interests contains an unsupported value.");
  }
};

const validateOptionalId = (input: Record<string, unknown>, key: string) => {
  if (
    input[key] !== undefined &&
    (typeof input[key] !== "string" || !/^[a-z0-9-]{1,64}$/.test(input[key] as string))
  ) {
    throw new TypeError(`${key} must be a valid seeded identifier.`);
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

export const validateSearchPeopleInput = (input: unknown): SearchPeopleInput => {
  if (!isRecord(input)) throw new TypeError("search_people input must be an object.");
  assertOnlyKeys(input, ["query", "interests", "availability", "presence"]);
  validateOptionalQuery(input);
  validateSocialInterests(input);
  if (
    input.availability !== undefined &&
    input.availability !== "available" &&
    input.availability !== "busy" &&
    input.availability !== "unavailable"
  ) {
    throw new TypeError("availability is not supported.");
  }
  if (
    input.presence !== undefined &&
    input.presence !== "hidden" &&
    input.presence !== "city-only" &&
    input.presence !== "nearby"
  ) {
    throw new TypeError("presence must be hidden, city-only, or nearby.");
  }
  return {
    query: input.query as string | undefined,
    interests: input.interests as SearchPeopleInput["interests"],
    availability: input.availability as Availability | undefined,
    presence: input.presence as SearchPeopleInput["presence"]
  };
};

export const validateGetProfileInput = (input: unknown): GetProfileInput => {
  if (!isRecord(input)) throw new TypeError("get_profile input must be an object.");
  assertOnlyKeys(input, ["profileId"]);
  if (typeof input.profileId !== "string" || !/^[a-z0-9-]{1,64}$/.test(input.profileId)) {
    throw new TypeError("profileId must be a valid seeded profile identifier.");
  }
  return { profileId: input.profileId };
};

export const validateSearchPlacesInput = (input: unknown): SearchPlacesInput => {
  if (!isRecord(input)) throw new TypeError("search_places input must be an object.");
  assertOnlyKeys(input, ["query", "interests", "neighborhood", "eventId"]);
  validateOptionalQuery(input);
  validateSocialInterests(input);
  validateOptionalId(input, "eventId");
  if (
    input.neighborhood !== undefined &&
    (typeof input.neighborhood !== "string" || input.neighborhood.length > 80)
  ) {
    throw new TypeError("neighborhood must be a string of at most 80 characters.");
  }
  return {
    query: input.query as string | undefined,
    interests: input.interests as SearchPlacesInput["interests"],
    neighborhood: input.neighborhood as string | undefined,
    eventId: input.eventId as string | undefined
  };
};

export const validateFindNearbyFriendsInput = (
  input: unknown
): FindNearbyFriendsInput => {
  if (!isRecord(input)) {
    throw new TypeError("find_nearby_friends input must be an object.");
  }
  assertOnlyKeys(input, ["eventId", "availability"]);
  validateOptionalId(input, "eventId");
  if (input.availability !== undefined && input.availability !== "available" && input.availability !== "any") {
    throw new TypeError("availability must be available or any.");
  }
  return {
    eventId: input.eventId as string | undefined,
    availability: input.availability as FindNearbyFriendsInput["availability"]
  };
};

export const validateSuggestPeopleForPlanInput = (
  input: unknown
): SuggestPeopleForPlanInput => {
  if (!isRecord(input)) {
    throw new TypeError("suggest_people_for_plan input must be an object.");
  }
  assertOnlyKeys(input, ["eventId", "maxPeople"]);
  validateOptionalId(input, "eventId");
  if (
    input.maxPeople !== undefined &&
    (typeof input.maxPeople !== "number" ||
      !Number.isInteger(input.maxPeople) ||
      input.maxPeople < 1 ||
      input.maxPeople > 3)
  ) {
    throw new TypeError("maxPeople must be an integer between 1 and 3.");
  }
  return {
    eventId: input.eventId as string | undefined,
    maxPeople: input.maxPeople as number | undefined
  };
};
