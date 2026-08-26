import type {
  CityEvent,
  MeetupPlace,
  SocialProfile,
  SocialRelationship
} from "../domain";
import { CoffeeIcon, PinIcon, ShieldIcon, UsersIcon } from "./Icons";

interface SocialDiscoveryProps {
  event: CityEvent;
  people: SocialProfile[];
  places: MeetupPlace[];
  relationships: SocialRelationship[];
  nearbyFriendIds: string[];
  suggestedPeopleIds: string[];
  recommendedPlaceIds: string[];
  isBusy: boolean;
  onFindNearby: () => void;
  onSuggest: () => void;
  onPrepareMeetup: () => void;
  onInspectProfile: (profileId: string) => void;
}

const interestLabel = (interest: string) =>
  interest === "electronic-music" ? "electronic music" : interest;

const avatarClass = (index: SocialProfile["avatarIndex"]) => `avatar avatar--${index}`;

export const SocialDiscovery = ({
  event,
  people,
  places,
  relationships,
  nearbyFriendIds,
  suggestedPeopleIds,
  recommendedPlaceIds,
  isBusy,
  onFindNearby,
  onSuggest,
  onPrepareMeetup,
  onInspectProfile
}: SocialDiscoveryProps) => {
  const orderedPeople = [...suggestedPeopleIds, ...nearbyFriendIds]
    .filter((id, index, ids) => ids.indexOf(id) === index)
    .map((id) => people.find((profile) => profile.id === id))
    .filter((profile): profile is SocialProfile => Boolean(profile))
    .slice(0, 3);
  const orderedPlaces = recommendedPlaceIds
    .map((id) => places.find((place) => place.id === id))
    .filter((place): place is MeetupPlace => Boolean(place))
    .slice(0, 2);
  const hasResults = orderedPeople.length > 0 || orderedPlaces.length > 0;

  return (
    <section className="social-discovery" aria-labelledby="social-discovery-title">
      <div className="section-heading social-discovery__heading">
        <div>
          <h2 id="social-discovery-title">People + places for this plan</h2>
          <p>Privacy-safe suggestions around {event.name}.</p>
        </div>
        <span className="social-privacy-label">
          <ShieldIcon /> Privacy-aware
        </span>
      </div>

      {hasResults ? (
        <div className="social-discovery__results">
          <div className="social-people" aria-label="Suggested people">
            <div className="social-subheading">
              <UsersIcon />
              <span>People to ask</span>
            </div>
            <div className="social-people__list">
              {orderedPeople.map((profile) => {
                const relationship = relationships.find(
                  (candidate) => candidate.profileId === profile.id
                );
                const sharedInterests = profile.interests.filter((interest) =>
                  event.interests.includes(interest as (typeof event.interests)[number])
                );
                const isNearby = nearbyFriendIds.includes(profile.id);
                const presenceLabel =
                  profile.presence.visibility === "nearby" && isNearby
                    ? `Near ${profile.presence.coarseArea}`
                    : profile.presence.visibility === "city-only"
                      ? `In ${profile.presence.city} · city-only`
                      : "Presence hidden";
                return (
                  <article className="social-person" key={profile.id}>
                    <div className={avatarClass(profile.avatarIndex)} role="img" aria-label={`${profile.name} fictional avatar`} />
                    <div className="social-person__body">
                      <div className="social-person__topline">
                        <div>
                          <strong>{profile.name}</strong>
                          <span>{profile.handle}</span>
                        </div>
                        <span className={`availability availability--${profile.availability}`}>
                          <i aria-hidden="true" /> {profile.availability === "available" ? "Available" : profile.availability}
                        </span>
                      </div>
                      <div className="social-person__reason">
                        <span>{relationship?.kind === "friend" ? "Friend" : "Connection"}</span>
                        <span>{presenceLabel}</span>
                        {sharedInterests.length > 0 && (
                          <span>Shared {sharedInterests.map(interestLabel).join(" + ")}</span>
                        )}
                      </div>
                      <button type="button" className="text-button" onClick={() => onInspectProfile(profile.id)}>
                        View profile
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>

          <div className="social-places" aria-label="Recommended meetup places">
            <div className="social-subheading">
              <CoffeeIcon />
              <span>Good places to meet</span>
            </div>
            <div className="social-places__list">
              {orderedPlaces.map((place) => (
                <article className="social-place" key={place.id}>
                  <div className="social-place__icon"><PinIcon /></div>
                  <div>
                    <strong>{place.name}</strong>
                    <span>{place.neighborhood}</span>
                    <small>{place.atmosphere}</small>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="social-empty">
          <UsersIcon />
          <div>
            <strong>Bring your people into the plan</strong>
            <p>Find available friends near the selected event, then get a place matched to the group.</p>
          </div>
        </div>
      )}

      <div className="social-actions">
        <button type="button" className="button button--quiet" onClick={onFindNearby} disabled={isBusy}>
          <UsersIcon /> Find nearby friends
        </button>
        <button type="button" className="button button--primary" onClick={onSuggest} disabled={isBusy}>
          <SparkMini /> Suggest for this plan
        </button>
        <button
          type="button"
          className="button button--quiet"
          onClick={onPrepareMeetup}
          disabled={isBusy || !suggestedPeopleIds.length || !recommendedPlaceIds.length}
        >
          <UsersIcon /> Prepare meetup
        </button>
      </div>
    </section>
  );
};

const SparkMini = () => (
  <svg className="spark-mini" width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M12 2.8c.7 4.4 3.1 6.8 7.4 7.5-4.3.7-6.7 3.1-7.4 7.5-.7-4.4-3.1-6.8-7.4-7.5C8.9 9.6 11.3 7.2 12 2.8Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
  </svg>
);
