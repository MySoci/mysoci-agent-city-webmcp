import { useEffect, useMemo, useState } from "react";
import { AgentActivity } from "./components/AgentActivity";
import { CityMap } from "./components/CityMap";
import { EventList } from "./components/EventList";
import { CompassIcon, InfoIcon, CalendarIcon, SparkIcon } from "./components/Icons";
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
      await invokeCityTool(cityStore, "search_events", {
        interests: ["ai", "electronic-music"],
        day: "saturday",
        maxPrice: 60
      });
      await runSocialSequence();
    } finally {
      setIsBusy(false);
    }
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

  const confirmPendingEvent = async () => {
    const eventId = cityStore.getSnapshot().pendingConfirmationId;
    if (!eventId || isBusy) return;
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
          <strong>MySoci Agent City</strong>
          <span>A MySoci prototype</span>
        </a>
        <nav aria-label="Primary navigation">
          <a className="nav-link nav-link--active" href="#discover">
            <CompassIcon /> Discover
          </a>
          <a className="nav-link" href="#plan">
            <CalendarIcon /> Plan
          </a>
          <a className="nav-link" href="#about">
            <InfoIcon /> About
          </a>
        </nav>
        <button className="judge-button" type="button" onClick={runJudgeDemo} disabled={isBusy}>
          <SparkIcon />
          {isBusy ? "Working…" : "Judge Mode"}
        </button>
      </header>

      <main>
        <div className="workspace" id="discover">
          <section className="discovery" aria-labelledby="discover-title">
            <div className="discovery__heading">
              <div>
                <h1 id="discover-title">New York, this Saturday</h1>
                <p>Discover the city together.</p>
              </div>
              <span>Deterministic local data</span>
            </div>

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
          </aside>
        </div>

        <section className="about" id="about" aria-labelledby="about-title">
          <div>
            <h2 id="about-title">A future agent layer for social discovery</h2>
            <p>
              MySoci explores social experiences around digital cities, personalized identity,
              and real-world discovery. This standalone challenge prototype explores how a human
              and an agent can share one visible city plan through WebMCP.
            </p>
          </div>
          <p>
            Seeded demo only. No login, private MySoci systems, external services, or real-world
            transactions.
          </p>
        </section>
      </main>
    </div>
  );
}
