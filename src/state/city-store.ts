import type {
  ActivityEntry,
  ActivityStatus,
  CityEvent,
  CityState,
  GroupMeetup,
  InviteProposal,
  MeetupDraft,
  SearchEventsInput,
  SocialViewState
} from "../domain";
import { SEEDED_EVENTS } from "../data/events";
import { SEEDED_PEOPLE, SEEDED_RELATIONSHIPS } from "../data/social";
import { SEEDED_PLACES } from "../data/places";

type Listener = () => void;

const initialState = (): CityState => ({
  events: SEEDED_EVENTS,
  people: SEEDED_PEOPLE,
  relationships: SEEDED_RELATIONSHIPS,
  places: SEEDED_PLACES,
  visibleEventIds: SEEDED_EVENTS.map((event) => event.id),
  selectedEventId: SEEDED_EVENTS[0].id,
  savedEventIds: [],
  pendingConfirmationId: null,
  socialView: {
    eventId: null,
    nearbyFriendIds: [],
    suggestedPeopleIds: [],
    recommendedPlaceIds: []
  },
  meetup: null,
  pendingMeetupProposal: null,
  meetupApprovalGranted: false,
  pendingInviteProposal: null,
  inviteApprovalGranted: false,
  activities: []
});

const activityTime = (index: number) => {
  const totalSeconds = 20 * 60 * 60 + 5 * 60 + 12 + index * 3;
  const hours24 = Math.floor(totalSeconds / 3600) % 24;
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const hours12 = hours24 % 12 || 12;
  const period = hours24 >= 12 ? "PM" : "AM";
  return `${hours12}:${minutes.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")} ${period}`;
};

const searchableText = (event: CityEvent) =>
  [event.name, event.summary, event.venue, event.neighborhood, ...event.interests]
    .join(" ")
    .toLowerCase();

export class CityStore {
  private state: CityState = initialState();
  private listeners = new Set<Listener>();
  private activitySequence = 0;

  getSnapshot = () => this.state;

  subscribe = (listener: Listener) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  reset() {
    this.state = initialState();
    this.activitySequence = 0;
    this.emit();
  }

  selectEvent(eventId: string) {
    this.requireEvent(eventId);
    this.patch({ selectedEventId: eventId, socialView: emptySocialView() });
  }

  searchEvents(input: SearchEventsInput) {
    const queryTokens = input.query
      ?.trim()
      .toLowerCase()
      .split(/\s+/)
      .filter(Boolean);

    const results = this.state.events.filter((event) => {
      const matchesQuery =
        !queryTokens?.length ||
        queryTokens.some((token) => searchableText(event).includes(token));
      const matchesInterests =
        !input.interests?.length ||
        input.interests.some((interest) => event.interests.includes(interest));
      const matchesDay = !input.day || event.day === input.day;
      const matchesPrice = input.maxPrice === undefined || event.price <= input.maxPrice;

      return matchesQuery && matchesInterests && matchesDay && matchesPrice;
    });

    this.patch({
      visibleEventIds: results.map((event) => event.id),
      selectedEventId: results[0]?.id ?? this.state.selectedEventId
    });

    return results;
  }

  requestSave(eventId: string) {
    this.requireEvent(eventId);
    this.patch({ pendingConfirmationId: eventId, selectedEventId: eventId });
  }

  saveEvent(eventId: string) {
    this.requireEvent(eventId);
    if (this.state.savedEventIds.includes(eventId)) {
      this.patch({ pendingConfirmationId: null, selectedEventId: eventId });
      return false;
    }

    this.patch({
      savedEventIds: [...this.state.savedEventIds, eventId],
      pendingConfirmationId: null,
      selectedEventId: eventId
    });
    return true;
  }

  dismissConfirmation() {
    this.patch({ pendingConfirmationId: null });
  }

  requestMeetupProposal(proposal: MeetupDraft) {
    this.patch({
      pendingMeetupProposal: proposal,
      meetupApprovalGranted: false,
      pendingInviteProposal: null,
      inviteApprovalGranted: false
    });
  }

  dismissMeetupProposal() {
    this.patch({ pendingMeetupProposal: null, meetupApprovalGranted: false });
  }

  toggleMeetupParticipant(profileId: string) {
    const proposal = this.state.pendingMeetupProposal;
    if (!proposal) return;
    const profileIds = proposal.profileIds.includes(profileId)
      ? proposal.profileIds.filter((id) => id !== profileId)
      : [...proposal.profileIds, profileId];
    this.patch({
      pendingMeetupProposal: { ...proposal, profileIds },
      meetupApprovalGranted: false
    });
  }

  approveMeetupProposal() {
    if (!this.state.pendingMeetupProposal) return false;
    this.patch({ meetupApprovalGranted: true });
    return true;
  }

  createMeetupFromApprovedProposal() {
    const proposal = this.state.pendingMeetupProposal;
    if (!proposal || !this.state.meetupApprovalGranted) return null;
    const savedToPlanByMeetup = !this.state.savedEventIds.includes(proposal.eventId);
    const meetup: GroupMeetup = {
      ...proposal,
      id: `meetup-${this.state.activities.length + 1}`,
      invitationStatuses: Object.fromEntries(
        proposal.profileIds.map((profileId) => [profileId, "not-invited" as const])
      ) as GroupMeetup["invitationStatuses"],
      status: "confirmed",
      savedToPlanByMeetup
    };
    this.patch({
      meetup,
      savedEventIds: savedToPlanByMeetup
        ? [...this.state.savedEventIds, proposal.eventId]
        : this.state.savedEventIds,
      selectedEventId: proposal.eventId,
      pendingMeetupProposal: null,
      meetupApprovalGranted: false
    });
    return meetup;
  }

  requestInviteProposal(proposal: InviteProposal) {
    this.patch({ pendingInviteProposal: proposal, inviteApprovalGranted: false });
  }

  dismissInviteProposal() {
    this.patch({ pendingInviteProposal: null, inviteApprovalGranted: false });
  }

  approveInviteProposal() {
    if (!this.state.pendingInviteProposal) return false;
    this.patch({ inviteApprovalGranted: true });
    return true;
  }

  sendInvitesFromApprovedProposal() {
    const proposal = this.state.pendingInviteProposal;
    const meetup = this.state.meetup;
    if (!proposal || !meetup || !this.state.inviteApprovalGranted || proposal.meetupId !== meetup.id) {
      return null;
    }
    const invitationStatuses = { ...meetup.invitationStatuses };
    proposal.profileIds.forEach((profileId) => {
      invitationStatuses[profileId] = "pending";
    });
    const updatedMeetup = { ...meetup, invitationStatuses };
    this.patch({ meetup: updatedMeetup, pendingInviteProposal: null, inviteApprovalGranted: false });
    return updatedMeetup;
  }

  cancelMeetup() {
    const meetup = this.state.meetup;
    if (!meetup) return false;
    const invitationStatuses = Object.fromEntries(
      Object.keys(meetup.invitationStatuses).map((profileId) => [profileId, "cancelled" as const])
    ) as GroupMeetup["invitationStatuses"];
    this.patch({
      meetup: { ...meetup, status: "cancelled", invitationStatuses },
      savedEventIds: meetup.savedToPlanByMeetup
        ? this.state.savedEventIds.filter((id) => id !== meetup.eventId)
        : this.state.savedEventIds,
      pendingMeetupProposal: null,
      meetupApprovalGranted: false,
      pendingInviteProposal: null,
      inviteApprovalGranted: false
    });
    return true;
  }

  removeSavedEvent(eventId: string) {
    this.patch({
      savedEventIds: this.state.savedEventIds.filter((id) => id !== eventId)
    });
  }

  setSocialView(socialView: SocialViewState) {
    this.patch({ socialView });
  }

  beginActivity(
    toolName: ActivityEntry["toolName"],
    summary: string,
    detail: string
  ) {
    this.activitySequence += 1;
    const id = `${toolName}-${this.activitySequence}`;
    const entry: ActivityEntry = {
      id,
      toolName,
      summary,
      detail,
      status: "running",
      timestamp: activityTime(this.state.activities.length)
    };
    this.patch({ activities: [entry, ...this.state.activities].slice(0, 6) });
    return id;
  }

  completeActivity(
    id: string,
    status: Exclude<ActivityStatus, "running">,
    detail: string
  ) {
    this.patch({
      activities: this.state.activities.map((entry) =>
        entry.id === id ? { ...entry, status, detail } : entry
      )
    });
  }

  private patch(patch: Partial<CityState>) {
    this.state = { ...this.state, ...patch };
    this.emit();
  }

  private requireEvent(eventId: string) {
    const event = this.state.events.find((candidate) => candidate.id === eventId);
    if (!event) {
      throw new Error(`Unknown seeded event: ${eventId}`);
    }
    return event;
  }

  private emit() {
    this.listeners.forEach((listener) => listener());
  }
}

const emptySocialView = (): SocialViewState => ({
  eventId: null,
  nearbyFriendIds: [],
  suggestedPeopleIds: [],
  recommendedPlaceIds: []
});

export const cityStore = new CityStore();
