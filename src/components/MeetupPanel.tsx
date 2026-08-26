import type {
  CityEvent,
  GroupMeetup,
  InviteProposal,
  MeetupDraft,
  MeetupPlace,
  SocialProfile
} from "../domain";
import { CalendarIcon, CheckIcon, PinIcon, ShieldIcon, TrashIcon, UsersIcon } from "./Icons";

interface MeetupPanelProps {
  event: CityEvent;
  events: CityEvent[];
  people: SocialProfile[];
  places: MeetupPlace[];
  meetup: GroupMeetup | null;
  pendingMeetupProposal: MeetupDraft | null;
  pendingInviteProposal: InviteProposal | null;
  isBusy: boolean;
  onToggleParticipant: (profileId: string) => void;
  onConfirmMeetup: () => void;
  onDismissMeetup: () => void;
  onPrepareInvites: () => void;
  onConfirmInvites: () => void;
  onDismissInvites: () => void;
  onCancelMeetup: () => void;
}

const presenceLabel = (profile: SocialProfile) => {
  if (profile.presence.visibility === "nearby") return `Near ${profile.presence.coarseArea}`;
  if (profile.presence.visibility === "city-only") return `${profile.presence.city} · city-only`;
  return "Presence hidden";
};

const statusLabel = (status: GroupMeetup["invitationStatuses"][string]) => {
  if (status === "pending") return "Invite prepared";
  if (status === "cancelled") return "Cancelled";
  return "Not invited";
};

export const MeetupPanel = ({
  event,
  events,
  people,
  places,
  meetup,
  pendingMeetupProposal,
  pendingInviteProposal,
  isBusy,
  onToggleParticipant,
  onConfirmMeetup,
  onDismissMeetup,
  onPrepareInvites,
  onConfirmInvites,
  onDismissInvites,
  onCancelMeetup
}: MeetupPanelProps) => {
  const proposalEvent = pendingMeetupProposal
    ? events.find((candidate) => candidate.id === pendingMeetupProposal.eventId)
    : undefined;
  const meetupEvent = meetup
    ? events.find((candidate) => candidate.id === meetup.eventId) ?? event
    : event;
  const proposalPlace = pendingMeetupProposal
    ? places.find((place) => place.id === pendingMeetupProposal.placeId)
    : undefined;
  const meetupPlace = meetup ? places.find((place) => place.id === meetup.placeId) : undefined;
  const proposalPeople = pendingMeetupProposal
    ? pendingMeetupProposal.profileIds
        .map((profileId) => people.find((profile) => profile.id === profileId))
        .filter((profile): profile is SocialProfile => Boolean(profile))
    : [];
  const meetupPeople = meetup
    ? meetup.profileIds
        .map((profileId) => people.find((profile) => profile.id === profileId))
        .filter((profile): profile is SocialProfile => Boolean(profile))
    : [];
  const invitePeople = pendingInviteProposal
    ? pendingInviteProposal.profileIds
        .map((profileId) => people.find((profile) => profile.id === profileId))
        .filter((profile): profile is SocialProfile => Boolean(profile))
    : [];
  const hasUninvited = meetup?.profileIds.some(
    (profileId) => meetup.invitationStatuses[profileId] === "not-invited"
  );

  return (
    <section className="meetup-panel" aria-labelledby="meetup-title">
      <div className="section-heading meetup-panel__heading">
        <div>
          <h2 id="meetup-title">Social meetup</h2>
          <p>Shared state, with a human approval gate.</p>
        </div>
        <span className="meetup-panel__privacy">
          <ShieldIcon /> Seeded only
        </span>
      </div>

      {pendingMeetupProposal ? (
        <div className="meetup-review" role="alert" aria-live="assertive">
          <div className="meetup-review__topline">
            <span className="meetup-review__eyebrow">Review meetup</span>
            <span className="meetup-review__cost">${pendingMeetupProposal.estimatedCostUsd} est.</span>
          </div>
          <strong>{proposalEvent?.name ?? event.name}</strong>
          <div className="meetup-review__meta">
            <span><CalendarIcon /> {pendingMeetupProposal.time}</span>
            <span><PinIcon /> {proposalPlace?.name ?? "Selected place"}</span>
          </div>
          <p>Choose the people, then click Confirm meetup. The agent cannot approve this step.</p>
          <div className="meetup-participants" aria-label="Meetup participants">
            {people
              .filter((profile) => profile.availability === "available" && profile.presence.visibility !== "hidden")
              .filter((profile) =>
                profile.id === "leo-ortiz" || profile.id === "maya-chen" || profile.id === "amina-bello"
              )
              .map((profile) => {
                const selected = pendingMeetupProposal.profileIds.includes(profile.id);
                const relationship = profile.id === "ren-ito" ? "Connection" : "Friend";
                return (
                  <label className={`meetup-participant${selected ? " meetup-participant--selected" : ""}`} key={profile.id}>
                    <input
                      type="checkbox"
                      checked={selected}
                      onChange={() => onToggleParticipant(profile.id)}
                      disabled={isBusy}
                    />
                    <span className={`meetup-participant__avatar avatar avatar--${profile.avatarIndex}`} />
                    <span className="meetup-participant__body">
                      <strong>{profile.name}</strong>
                      <small>{relationship} · {profile.availability === "available" ? "Available" : profile.availability} · {presenceLabel(profile)}</small>
                    </span>
                    {selected && <CheckIcon className="meetup-participant__check" />}
                  </label>
                );
              })}
          </div>
          {!proposalPeople.length && <span className="meetup-warning">Select at least one eligible friend.</span>}
          <div className="confirmation__actions">
            <button
              type="button"
              className="button button--primary"
              onClick={onConfirmMeetup}
              disabled={isBusy || !proposalPeople.length}
            >
              Confirm meetup
            </button>
            <button type="button" className="button button--quiet" onClick={onDismissMeetup} disabled={isBusy}>
              Not now
            </button>
          </div>
        </div>
      ) : meetup ? (
        <div className={`meetup-summary meetup-summary--${meetup.status}`}>
          <div className="meetup-summary__status">
            <span className="meetup-summary__status-mark"><CheckIcon /></span>
            <div>
              <strong>{meetup.status === "confirmed" ? "Meetup ready" : "Meetup cancelled"}</strong>
              <span>{meetup.status === "confirmed" ? "Visible to you and the agent." : "The shared plan was restored."}</span>
            </div>
            <span className="meetup-summary__cost">${meetup.estimatedCostUsd}</span>
          </div>
          <div className="meetup-summary__route">
            <span><CalendarIcon /> {meetup.time} · {meetupEvent.name}</span>
            <span><PinIcon /> {meetupPlace?.name ?? "Meetup place"}</span>
          </div>
          <div className="meetup-summary__people">
            <div className="social-subheading"><UsersIcon /><span>Fictional invitees</span></div>
            {meetupPeople.map((profile) => (
              <div className="meetup-summary__person" key={profile.id}>
                <span className={`avatar avatar--${profile.avatarIndex}`} />
                <span><strong>{profile.name}</strong><small>{presenceLabel(profile)}</small></span>
                <em>{statusLabel(meetup.invitationStatuses[profile.id])}</em>
              </div>
            ))}
          </div>

          {pendingInviteProposal ? (
            <div className="invite-review" role="alert" aria-live="assertive">
              <strong>Approve fictional invites?</strong>
              <p>{invitePeople.map((profile) => profile.name).join(", ")} will be marked pending in the sandbox. No message is sent.</p>
              <div className="confirmation__actions">
                <button type="button" className="button button--primary" onClick={onConfirmInvites} disabled={isBusy}>
                  Approve invites
                </button>
                <button type="button" className="button button--quiet" onClick={onDismissInvites} disabled={isBusy}>
                  Not now
                </button>
              </div>
            </div>
          ) : meetup.status === "confirmed" ? (
            <div className="meetup-summary__actions">
              {hasUninvited && (
                <button type="button" className="button button--primary" onClick={onPrepareInvites} disabled={isBusy}>
                  Prepare invites
                </button>
              )}
              <button type="button" className="button button--quiet" onClick={onCancelMeetup} disabled={isBusy}>
                <TrashIcon /> Cancel meetup
              </button>
            </div>
          ) : null}
        </div>
      ) : (
        <div className="meetup-empty">
          <UsersIcon />
          <span>Run the social scenario to prepare a meetup proposal.</span>
        </div>
      )}
    </section>
  );
};
