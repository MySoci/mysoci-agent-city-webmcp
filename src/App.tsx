import { useEffect, useMemo, useRef, useState } from "react";
import { AboutDialog } from "./components/AboutDialog";
import { AgentActivity } from "./components/AgentActivity";
import { CityMap } from "./components/CityMap";
import { EventList } from "./components/EventList";
import { CompassIcon, InfoIcon, CalendarIcon, SparkIcon } from "./components/Icons";
import { JudgeGuide, type JudgePhase } from "./components/JudgeGuide";
import { MeetupPanel } from "./components/MeetupPanel";
import { SaturdayPlan } from "./components/SaturdayPlan";
import { SocialDiscovery } from "./components/SocialDiscovery";
import { cityStore } from "./state/city-store";
import { useCityStore } from "./state/use-city-store";
import { invokeCityTool, registerCityTools } from "./webmcp/register-tools";

type RuntimeState = "checking" | "native" | "fallback" | "error";

const EXAMPLE_PROMPT =
  "Find an AI or music event, check nearby friends, and suggest a meetup place.";

const runtimeLabel: Record<RuntimeState, string> = {
  checking: "Checking WebMCP",
  native: "Native WebMCP",
  fallback: "Local demo",
  error: "Registration issue"
};

export default function App() {
  const state = useCityStore();
  const [runtime, setRuntime] = useState<RuntimeState>("checking");
  const [isBusy, setIsBusy] = useState(false);
  const aboutDialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    let active = true;
    let cleanup: () => void = () => undefined;

    void registerCityTools(cityStore)
      .then((registration) => {
        if (!active) {
          registration.cleanup();
          return;
        }
        cleanup = registration.cleanup;
        setRuntime(registration.supported ? "native" : "fallback");
      })
      .catch(() => {
        if (active) setRuntime("error");
      });

    return () => {
      active = false;
      cleanup();
    };
  }, []);

  const savedEvents = useMemo(
    () => state.savedEventIds.flatMap((id) => state.events.filter((event) => event.id === id)),
    [state.events, state.savedEventIds]
  );
  const pendingEvent =
    state.events.find((event) => event.id === state.pendingConfirmationId) ?? null;
  const selectedEvent =
    state.events.find((event) => event.id === state.selectedEventId) ?? state.events[0];
  const recommendedPlaces = state.places.filter((place) =>
    state.socialView.recommendedPlaceIds.includes(place.id)
  );
  const judgePhase: JudgePhase = pendingEvent || state.pendingInviteProposal || state.meetup
    ? "approve"
    : state.pendingMeetupProposal || state.socialView.suggestedPeopleIds.length
      ? "review"
      : "discover";

  const runSocialSequence = async () => {
    const selectedEventId = cityStore.getSnapshot().selectedEventId;
    const event = cityStore
      .getSnapshot()
      .events.find((candidate) => candidate.id === selectedEventId);
    await invokeCityTool(cityStore, "search_people", {
      interests: event?.interests,
      availability: "available"
    });
    await invokeCityTool(cityStore, "find_nearby_friends", {
      availability: "available"
    });
    await invokeCityTool(cityStore, "search_places", {
      eventId: selectedEventId,
      interests: event?.interests
    });
    await invokeCityTool(cityStore, "suggest_people_for_plan", {
      maxPeople: 3
    });
  };

  const runJudgeDemo = async () => {
    if (isBusy) return;
    setIsBusy(true);
    try {
      cityStore.reset();
      await invokeCityTool(cityStore, "search_events", {
        interests: ["ai", "electronic-music"],
        day: "saturday",
        maxPrice: 60
      });
      await runSocialSequence();
      await invokeCityTool(cityStore, "create_group_meetup", { confirmed: false });
    } finally {
      setIsBusy(false);
    }
  };

  const runPlanDemo = async () => {
    if (isBusy) return;
    setIsBusy(true);
    try {
      cityStore.reset();
      await invokeCityTool(cityStore, "search_events", {
        interests: ["photography"],
        day: "saturday",
        maxPrice: 60
      });
      const eventId = cityStore.getSnapshot().selectedEventId;
      await invokeCityTool(cityStore, "save_event_to_plan", { eventId, confirmed: false });
    } finally {
      setIsBusy(false);
    }
  };

  const resetDemo = () => {
    if (isBusy) return;
    cityStore.reset();
  };

  const runSocialDiscovery = async () => {
    if (isBusy) return;
    setIsBusy(true);
    try {
      await runSocialSequence();
    } finally {
      setIsBusy(false);
    }
  };

  const runNearbyFriends = async () => {
    if (isBusy) return;
    setIsBusy(true);
    try {
      await invokeCityTool(cityStore, "find_nearby_friends", {
        availability: "available"
      });
    } finally {
      setIsBusy(false);
    }
  };

  const inspectProfile = async (profileId: string) => {
    if (isBusy) return;
    setIsBusy(true);
    try {
      await invokeCityTool(cityStore, "get_profile", { profileId });
    } finally {
      setIsBusy(false);
    }
  };

  const prepareMeetup = async () => {
    if (isBusy) return;
    setIsBusy(true);
    try {
      await invokeCityTool(cityStore, "create_group_meetup", { confirmed: false });
    } finally {
      setIsBusy(false);
    }
  };

  const confirmMeetup = async () => {
    if (!cityStore.getSnapshot().pendingMeetupProposal || isBusy) return;
    cityStore.approveMeetupProposal();
    setIsBusy(true);
    try {
      await invokeCityTool(cityStore, "create_group_meetup", { confirmed: true });
    } finally {
      setIsBusy(false);
    }
  };

  const prepareInvites = async () => {
    if (isBusy) return;
    setIsBusy(true);
    try {
      await invokeCityTool(cityStore, "send_event_invites", { confirmed: false });
    } finally {
      setIsBusy(false);
    }
  };

  const confirmInvites = async () => {
    if (!cityStore.getSnapshot().pendingInviteProposal || isBusy) return;
    cityStore.approveInviteProposal();
    setIsBusy(true);
    try {
      await invokeCityTool(cityStore, "send_event_invites", { confirmed: true });
    } finally {
      setIsBusy(false);
    }
  };

  const confirmPendingEvent = async () => {
    const eventId = cityStore.getSnapshot().pendingConfirmationId;
    if (!eventId || isBusy) return;
    cityStore.approvePendingSave();
    setIsBusy(true);
    try {
      await invokeCityTool(cityStore, "save_event_to_plan", {
        eventId,
        confirmed: true
      });
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="#discover" aria-label="MySoci Agent City home">
          <img className="brand__icon" src="/favicon.svg" width="34" height="34" alt="" />
          <span className="brand__copy">
            <strong>MySoci Agent City</strong>
            <span>A WebMCP prototype for MySoci’s future agent layer</span>
          </span>
        </a>
        <nav aria-label="Primary navigation">
          <a className="nav-link nav-link--active" href="#discover">
            <CompassIcon /> Discover
          </a>
          <a className="nav-link" href="#plan">
            <CalendarIcon /> Plan
          </a>
          <button className="nav-link" type="button" aria-haspopup="dialog" aria-controls="about-dialog" onClick={() => aboutDialogRef.current?.showModal()}>
            <InfoIcon /> About
          </button>
        </nav>
        <div className="topbar__actions">
          <button className="about-mobile" type="button" aria-label="About MySoci Agent City" title="About" aria-haspopup="dialog" aria-controls="about-dialog" onClick={() => aboutDialogRef.current?.showModal()}>
            <InfoIcon />
          </button>
          <button className="judge-button" type="button" onClick={runJudgeDemo} disabled={isBusy}>
            <SparkIcon />
            {isBusy ? "Working…" : "Judge Mode"}
          </button>
        </div>
      </header>

      <main>
        <div className="workspace" id="discover">
          <section className="discovery" aria-labelledby="discover-title">
            <div className="discovery__heading">
              <div>
                <h1 id="discover-title">New York, this Saturday</h1>
                <p>Find your event, your people, and a place to meet.</p>
              </div>
              <span>Deterministic local data</span>
            </div>

            <JudgeGuide phase={judgePhase} />

            <CityMap
              events={state.events}
              visibleEventIds={state.visibleEventIds}
              selectedEventId={state.selectedEventId}
              onSelect={cityStore.selectEvent.bind(cityStore)}
            />
            <EventList
              events={state.events}
              visibleEventIds={state.visibleEventIds}
              selectedEventId={state.selectedEventId}
              onSelect={cityStore.selectEvent.bind(cityStore)}
            />

            <SocialDiscovery
              event={selectedEvent}
              people={state.people}
              places={recommendedPlaces}
              relationships={state.relationships}
              nearbyFriendIds={state.socialView.nearbyFriendIds}
              suggestedPeopleIds={state.socialView.suggestedPeopleIds}
              recommendedPlaceIds={state.socialView.recommendedPlaceIds}
              isBusy={isBusy}
              onFindNearby={runNearbyFriends}
              onSuggest={runSocialDiscovery}
              onPrepareMeetup={prepareMeetup}
              onInspectProfile={inspectProfile}
            />

            <div className="prompt-composer" aria-label="Judge Mode example prompt">
              <span className="prompt-composer__icon">
                <SparkIcon />
              </span>
              <p>{EXAMPLE_PROMPT}</p>
              <button type="button" onClick={runJudgeDemo} disabled={isBusy}>
                {isBusy ? "Running…" : "Send"}
              </button>
            </div>

            <div className="judge-scenarios" aria-label="Judge Mode scenarios">
              <div>
                <span>Judge Mode scenarios</span>
                <small>Reset and replay seeded flows</small>
              </div>
              <button type="button" className="judge-scenarios__primary" onClick={runJudgeDemo} disabled={isBusy}>Run social meetup</button>
              <button type="button" onClick={runPlanDemo} disabled={isBusy}>Event planning</button>
              <button type="button" className="judge-scenarios__reset" onClick={resetDemo} disabled={isBusy}>Reset demo</button>
            </div>
          </section>

          <aside className="right-rail">
            <AgentActivity
              activities={state.activities}
              runtimeLabel={runtimeLabel[runtime]}
              pendingEvent={pendingEvent}
              isBusy={isBusy}
              onConfirm={confirmPendingEvent}
              onDismiss={() => cityStore.dismissConfirmation()}
            />
            <SaturdayPlan
              events={savedEvents}
              onRemove={(eventId) => cityStore.removeSavedEvent(eventId)}
            />
            <MeetupPanel
              event={selectedEvent}
              events={state.events}
              people={state.people}
              places={state.places}
              meetup={state.meetup}
              pendingMeetupProposal={state.pendingMeetupProposal}
              pendingInviteProposal={state.pendingInviteProposal}
              isBusy={isBusy}
              onToggleParticipant={(profileId) => cityStore.toggleMeetupParticipant(profileId)}
              onConfirmMeetup={confirmMeetup}
              onDismissMeetup={() => cityStore.dismissMeetupProposal()}
              onPrepareInvites={prepareInvites}
              onConfirmInvites={confirmInvites}
              onDismissInvites={() => cityStore.dismissInviteProposal()}
              onCancelMeetup={() => cityStore.cancelMeetup()}
            />
          </aside>
        </div>

      </main>
      <footer className="prototype-footer">A standalone WebMCP Challenge prototype. Seeded experiences. Human control.</footer>
      <AboutDialog dialogRef={aboutDialogRef} />
    </div>
  );
}
