import type {
  CityEvent,
  CreateGroupMeetupInput,
  GroupMeetup,
  MeetupDraft,
  MeetupPlace,
  SocialProfile
} from "../domain";
import type { CityStore } from "../state/city-store";
import {
  validateCreateGroupMeetupInput,
  validateSendEventInvitesInput
} from "./validation";

const CREATE_GROUP_MEETUP_SCHEMA = {
  type: "object",
  properties: {
    eventId: {
      type: "string",
      pattern: "^[a-z0-9-]{1,64}$",
      description: "Optional seeded event id; defaults to the human's selected event."
    },
    placeId: {
      type: "string",
      pattern: "^[a-z0-9-]{1,64}$",
      description: "Optional fictional meetup place id; defaults to the top place recommendation."
    },
    profileIds: {
      type: "array",
      maxItems: 3,
      uniqueItems: true,
      items: { type: "string", pattern: "^[a-z0-9-]{1,64}$" },
      description: "Optional fictional friend ids; defaults to the current social suggestions."
    },
    time: {
      type: "string",
      pattern: "^\\d{1,2}:\\d{2} [AP]M$",
      description: "Optional seeded 12-hour meetup time; defaults to the event time."
    },
    confirmed: {
      type: "boolean",
      description:
        "Required. False prepares a visible proposal. True is accepted only after the human clicks Confirm meetup in the app."
    }
  },
  required: ["confirmed"],
  additionalProperties: false
} satisfies Record<string, unknown>;

const SEND_EVENT_INVITES_SCHEMA = {
  type: "object",
  properties: {
    meetupId: {
      type: "string",
      pattern: "^[a-z0-9-]{1,64}$",
      description: "Optional confirmed meetup id; defaults to the current shared meetup."
    },
    profileIds: {
      type: "array",
      maxItems: 3,
      uniqueItems: true,
      items: { type: "string", pattern: "^[a-z0-9-]{1,64}$" },
      description: "Optional fictional friend ids; defaults to the meetup's uninvited participants."
    },
    confirmed: {
      type: "boolean",
      description:
        "Required. False prepares a visible invite proposal. True is accepted only after the human clicks Approve invites in the app."
    }
  },
  required: ["confirmed"],
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

const publicParticipant = (store: CityStore, profile: SocialProfile) => ({
  id: profile.id,
  name: profile.name,
  handle: profile.handle,
  interests: profile.interests,
  availability: profile.availability,
  presence: publicPresence(profile),
  relationship:
    store.getSnapshot().relationships.find((relationship) => relationship.profileId === profile.id)
      ?.kind ?? "none"
});

const resolveEvent = (store: CityStore, eventId?: string): CityEvent => {
  const id = eventId ?? store.getSnapshot().selectedEventId;
  const event = store.getSnapshot().events.find((candidate) => candidate.id === id);
  if (!event) throw new TypeError(`Unknown eventId: ${id}`);
  return event;
};

const resolvePlace = (store: CityStore, event: CityEvent, placeId?: string): MeetupPlace => {
  const state = store.getSnapshot();
  const id =
    placeId ??
    (state.socialView.eventId === event.id ? state.socialView.recommendedPlaceIds[0] : undefined) ??
    state.places.find((place) => place.neighborhood === event.neighborhood)?.id;
  const place = state.places.find((candidate) => candidate.id === id);
  if (!place) throw new TypeError("No fictional meetup place is available for this event.");
  if (place.neighborhood !== event.neighborhood) {
    throw new TypeError("Meetup place must be in the event's coarse neighborhood.");
  }
  return place;
};

const relationshipFor = (store: CityStore, profileId: string) =>
  store.getSnapshot().relationships.find((relationship) => relationship.profileId === profileId);

const assertEligibleInvitees = (store: CityStore, event: CityEvent, profileIds: string[]) => {
  const state = store.getSnapshot();
  if (!profileIds.length) {
    throw new TypeError("At least one privacy-safe friend is required for a group meetup.");
  }
  profileIds.forEach((profileId) => {
    const profile = state.people.find((candidate) => candidate.id === profileId);
    if (!profile) throw new TypeError(`Unknown profileId: ${profileId}`);
    const relationship = relationshipFor(store, profileId);
    if (relationship?.kind !== "friend") {
      throw new TypeError(`${profile.name} is not an eligible friend recipient.`);
    }
    if (profile.availability !== "available") {
      throw new TypeError(`${profile.name} is not available for this seeded meetup.`);
    }
    if (profile.presence.visibility === "hidden") {
      throw new TypeError(`${profile.name} has hidden presence and cannot be invited.`);
    }
    if (profile.presence.visibility !== "nearby" && profile.presence.visibility !== "city-only") {
      throw new TypeError(`${profile.name} has no invite-eligible presence visibility.`);
    }
  });
  if (!event.id) throw new TypeError("Meetup event is required.");
};

const draftFromInput = (store: CityStore, input: CreateGroupMeetupInput): MeetupDraft => {
  const event = resolveEvent(store, input.eventId);
  const place = resolvePlace(store, event, input.placeId);
  const state = store.getSnapshot();
  const profileIds =
    input.profileIds ??
    (state.socialView.eventId === event.id
      ? [...state.socialView.suggestedPeopleIds, ...state.socialView.nearbyFriendIds]
      : []);
  const uniqueProfileIds = [...new Set(profileIds)].slice(0, 3);
  assertEligibleInvitees(store, event, uniqueProfileIds);
  return {
    eventId: event.id,
    placeId: place.id,
    profileIds: uniqueProfileIds,
    time: input.time ?? event.time,
    estimatedCostUsd: event.price
  };
};

const sameDraft = (left: MeetupDraft, right: MeetupDraft) =>
  left.eventId === right.eventId &&
  left.placeId === right.placeId &&
  left.time === right.time &&
  left.estimatedCostUsd === right.estimatedCostUsd &&
  left.profileIds.length === right.profileIds.length &&
  left.profileIds.every((profileId, index) => profileId === right.profileIds[index]);

const publicMeetup = (store: CityStore, meetup: GroupMeetup) => {
  const state = store.getSnapshot();
  const event = state.events.find((candidate) => candidate.id === meetup.eventId);
  const place = state.places.find((candidate) => candidate.id === meetup.placeId);
  return {
    id: meetup.id,
    status: meetup.status,
    event: event ? { id: event.id, name: event.name, time: event.time, priceUsd: event.price } : null,
    place: place
      ? { id: place.id, name: place.name, neighborhood: place.neighborhood, type: place.type }
      : null,
    time: meetup.time,
    estimatedCostUsd: meetup.estimatedCostUsd,
    participants: meetup.profileIds.flatMap((profileId) => {
      const profile = state.people.find((candidate) => candidate.id === profileId);
      return profile
        ? [{ profile: publicParticipant(store, profile), invitationStatus: meetup.invitationStatuses[profileId] }]
        : [];
    }),
    privacyNote: "Invites use fictional seeded recipients; nearby is coarse and city-only never reveals an area."
  };
};

export const createMeetupTools = (store: CityStore): WebMCPTool[] => [
  {
    name: "create_group_meetup",
    title: "Create a confirmed group meetup",
    description:
      "Prepare a meetup from the selected seeded event, fictional place, and privacy-safe friends. The first call must use confirmed=false; the shared app shows the proposal and only a visible human click can authorize the confirmed=true call. No real messages or reservations are made.",
    inputSchema: CREATE_GROUP_MEETUP_SCHEMA,
    annotations: { readOnlyHint: false, untrustedContentHint: false },
    execute: async (rawInput, options) => {
      const input = validateCreateGroupMeetupInput(rawInput);
      if (options?.signal?.aborted) throw new DOMException("Tool execution cancelled", "AbortError");
      const state = store.getSnapshot();
      if (!input.confirmed && state.meetup?.status === "confirmed") {
        throw new TypeError("A meetup is already confirmed; cancel it before preparing another.");
      }
      const activityId = store.beginActivity(
        "create_group_meetup",
        input.confirmed ? "Confirming the shared meetup" : "Preparing a meetup proposal",
        "Checking the selected event, place, privacy-safe recipients, and human approval gate."
      );

      if (!input.confirmed) {
        const draft = draftFromInput(store, input);
        store.requestMeetupProposal(draft);
        store.completeActivity(
          activityId,
          "confirmation-required",
          `Review ${draft.profileIds.length} friend${draft.profileIds.length === 1 ? "" : "s"}, ${draft.placeId}, and the ${draft.time} meetup before approving.`
        );
        return {
          status: "confirmation_required",
          proposal: {
            eventId: draft.eventId,
            placeId: draft.placeId,
            profileIds: draft.profileIds,
            time: draft.time,
            estimatedCostUsd: draft.estimatedCostUsd
          },
          instruction: "Ask the human to review or edit the visible proposal, click Confirm meetup, then call again with confirmed=true."
        };
      }

      const pending = store.getSnapshot().pendingMeetupProposal;
      if (!pending || !store.getSnapshot().meetupApprovalGranted) {
        store.completeActivity(activityId, "error", "Human confirmation is required before creating the meetup.");
        throw new Error("Human confirmation is required before creating the meetup.");
      }
      const explicitDraft = input.eventId || input.placeId || input.profileIds || input.time
        ? draftFromInput(store, input)
        : pending;
      if (!sameDraft(explicitDraft, pending)) {
        store.completeActivity(activityId, "error", "The approved meetup proposal no longer matches the requested details.");
        throw new Error("The meetup proposal changed; ask the human to review it again.");
      }
      const meetup = store.createMeetupFromApprovedProposal();
      if (!meetup) {
        store.completeActivity(activityId, "error", "Human confirmation is required before creating the meetup.");
        throw new Error("Human confirmation is required before creating the meetup.");
      }
      store.completeActivity(activityId, "success", "Meetup confirmed in the shared plan; invitations remain unprepared until approved.");
      return { status: "confirmed", meetup: publicMeetup(store, meetup), sharedState: { meetup } };
    }
  },
  {
    name: "send_event_invites",
    title: "Prepare fictional event invites",
    description:
      "Prepare pending invitations for eligible fictional friends on the confirmed shared meetup. The first call must use confirmed=false; only a visible human click can authorize confirmed=true. This sandbox never contacts real people or external services.",
    inputSchema: SEND_EVENT_INVITES_SCHEMA,
    annotations: { readOnlyHint: false, untrustedContentHint: false },
    execute: async (rawInput, options) => {
      const input = validateSendEventInvitesInput(rawInput);
      if (options?.signal?.aborted) throw new DOMException("Tool execution cancelled", "AbortError");
      const state = store.getSnapshot();
      const meetup = state.meetup;
      if (!meetup || meetup.status !== "confirmed") {
        throw new TypeError("Confirm a group meetup before preparing invites.");
      }
      if (input.meetupId && input.meetupId !== meetup.id) {
        throw new TypeError(`Unknown meetupId: ${input.meetupId}`);
      }
      const event = state.events.find((candidate) => candidate.id === meetup.eventId);
      if (!event) throw new TypeError(`Unknown eventId: ${meetup.eventId}`);
      const profileIds = input.profileIds ?? meetup.profileIds.filter((profileId) => meetup.invitationStatuses[profileId] === "not-invited");
      const uniqueProfileIds = [...new Set(profileIds)];
      assertEligibleInvitees(store, event, uniqueProfileIds);
      if (uniqueProfileIds.some((profileId) => meetup.invitationStatuses[profileId] !== "not-invited")) {
        throw new TypeError("Only uninvited meetup participants can be prepared again.");
      }
      const activityId = store.beginActivity(
        "send_event_invites",
        input.confirmed ? "Preparing approved invites" : "Preparing invite proposal",
        "Checking fictional recipients and the human confirmation gate; no message is sent."
      );
      if (!input.confirmed) {
        store.requestInviteProposal({ meetupId: meetup.id, profileIds: uniqueProfileIds });
        store.completeActivity(
          activityId,
          "confirmation-required",
          `Review ${uniqueProfileIds.length} fictional invite${uniqueProfileIds.length === 1 ? "" : "s"} before approving.`
        );
        return {
          status: "confirmation_required",
          meetupId: meetup.id,
          profileIds: uniqueProfileIds,
          instruction: "Ask the human to click Approve invites in the visible app before calling again with confirmed=true."
        };
      }
      const pending = store.getSnapshot().pendingInviteProposal;
      if (
        !pending ||
        !store.getSnapshot().inviteApprovalGranted ||
        pending.meetupId !== meetup.id ||
        pending.profileIds.length !== uniqueProfileIds.length ||
        pending.profileIds.some((profileId, index) => profileId !== uniqueProfileIds[index])
      ) {
        store.completeActivity(activityId, "error", "Human approval is required before preparing invitations.");
        throw new Error("Human approval is required before preparing invitations.");
      }
      const updatedMeetup = store.sendInvitesFromApprovedProposal();
      if (!updatedMeetup) {
        store.completeActivity(activityId, "error", "Human approval is required before preparing invitations.");
        throw new Error("Human approval is required before preparing invitations.");
      }
      store.completeActivity(activityId, "success", `Prepared ${uniqueProfileIds.length} fictional invite${uniqueProfileIds.length === 1 ? "" : "s"}; no external message was sent.`);
      return { status: "prepared", meetup: publicMeetup(store, updatedMeetup), sharedState: { meetup: updatedMeetup } };
    }
  }
];
