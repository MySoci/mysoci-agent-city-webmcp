import { beforeEach, describe, expect, it } from "vitest";
import { CityStore } from "../state/city-store";
import { registerCityTools } from "./register-tools";
import { installTestModelContext } from "./test-model-context";

describe("WebMCP city tools", () => {
  let store: CityStore;

  beforeEach(() => {
    store = new CityStore();
    installTestModelContext();
  });

  it("discovers the event and social tools with clear read-only annotations", async () => {
    const registration = await registerCityTools(store);
    const tools = await document.modelContext?.getTools();

    expect(registration.supported).toBe(true);
    expect(tools?.map((tool) => tool.name)).toEqual([
      "search_events",
      "save_event_to_plan",
      "search_people",
      "get_profile",
      "search_places",
      "find_nearby_friends",
      "suggest_people_for_plan",
      "create_group_meetup",
      "send_event_invites"
    ]);
    expect(tools?.find((tool) => tool.name === "search_events")?.annotations).toEqual({
      readOnlyHint: true,
      untrustedContentHint: false
    });
    expect(
      tools?.find((tool) => tool.name === "save_event_to_plan")?.annotations?.readOnlyHint
    ).toBe(false);
    for (const name of [
      "search_people",
      "get_profile",
      "search_places",
      "find_nearby_friends",
      "suggest_people_for_plan"
    ]) {
      expect(tools?.find((tool) => tool.name === name)?.annotations?.readOnlyHint).toBe(true);
    }
    expect(tools?.find((tool) => tool.name === "create_group_meetup")?.annotations).toEqual({
      readOnlyHint: false,
      untrustedContentHint: false
    });
    expect(tools?.find((tool) => tool.name === "send_event_invites")?.annotations).toEqual({
      readOnlyHint: false,
      untrustedContentHint: false
    });
    expect(tools?.find((tool) => tool.name === "create_group_meetup")?.inputSchema).toMatchObject({
      required: ["confirmed"],
      additionalProperties: false
    });
    expect(tools?.find((tool) => tool.name === "send_event_invites")?.inputSchema).toMatchObject({
      required: ["confirmed"],
      additionalProperties: false
    });

    registration.cleanup();
    expect(await document.modelContext?.getTools()).toEqual([]);
  });

  it("invokes search_events with strict inputs and updates visible shared state", async () => {
    await registerCityTools(store);
    const tools = await document.modelContext?.getTools();
    const searchTool = tools?.find((tool) => tool.name === "search_events");
    expect(searchTool).toBeDefined();

    const serialized = await document.modelContext?.executeTool(searchTool!, {
      interests: ["ai", "photography"],
      day: "saturday",
      maxPrice: 60
    });
    const result = JSON.parse(serialized ?? "{}") as {
      count: number;
      events: Array<{ id: string }>;
    };

    expect(result.count).toBe(2);
    expect(result.events.map((event) => event.id)).toEqual([
      "neural-nights",
      "framewalk-nyc"
    ]);
    expect(store.getSnapshot().visibleEventIds).toEqual([
      "neural-nights",
      "framewalk-nyc"
    ]);
    expect(store.getSnapshot().activities[0]).toMatchObject({
      toolName: "search_events",
      status: "success"
    });
  });

  it("requires visible confirmation before save_event_to_plan mutates the plan", async () => {
    await registerCityTools(store);
    const tools = await document.modelContext?.getTools();
    const saveTool = tools?.find((tool) => tool.name === "save_event_to_plan");
    expect(saveTool).toBeDefined();

    const pendingSerialized = await document.modelContext?.executeTool(saveTool!, {
      eventId: "neural-nights",
      confirmed: false
    });
    const pending = JSON.parse(pendingSerialized ?? "{}") as { status: string };

    expect(pending.status).toBe("confirmation_required");
    expect(store.getSnapshot().pendingConfirmationId).toBe("neural-nights");
    expect(store.getSnapshot().savedEventIds).toEqual([]);

    await expect(document.modelContext?.executeTool(saveTool!, {
      eventId: "neural-nights", confirmed: true
    })).rejects.toThrow("Human approval is required");
    expect(store.getSnapshot().savedEventIds).toEqual([]);
    store.approvePendingSave();
    const savedSerialized = await document.modelContext?.executeTool(saveTool!, {
      eventId: "neural-nights",
      confirmed: true
    });
    const saved = JSON.parse(savedSerialized ?? "{}") as { status: string };

    expect(saved.status).toBe("saved");
    expect(store.getSnapshot().pendingConfirmationId).toBeNull();
    expect(store.getSnapshot().savedEventIds).toEqual(["neural-nights"]);

    store.removeSavedEvent("neural-nights");
    expect(store.getSnapshot().savedEventIds).toEqual([]);
    await expect(document.modelContext?.executeTool(saveTool!, {
      eventId: "neural-nights", confirmed: true
    })).rejects.toThrow("Human approval is required");
    expect(store.getSnapshot().activities[0].status).toBe("error");
  });

  it("rejects direct event-save approval and invalidates stale, mismatched, dismissed and reset latches", async () => {
    await registerCityTools(store);
    const tools = await document.modelContext!.getTools();
    const saveTool = tools.find((tool) => tool.name === "save_event_to_plan")!;
    const save = (eventId = "neural-nights") => document.modelContext!.executeTool(saveTool, { eventId, confirmed: true });
    await expect(save()).rejects.toThrow("Human approval is required");
    expect(store.approvePendingSave()).toBe(false);

    for (const invalidate of [
      () => store.dismissConfirmation(),
      () => store.reset(),
      () => store.selectEvent("framewalk-nyc"),
      () => store.requestSave("neural-nights")
    ]) {
      store.requestSave("neural-nights");
      store.approvePendingSave();
      invalidate();
      await expect(save()).rejects.toThrow("Human approval is required");
      expect(store.getSnapshot().savedEventIds).toEqual([]);
    }
    store.requestSave("neural-nights");
    store.approvePendingSave();
    await expect(save("framewalk-nyc")).rejects.toThrow("Human approval is required");
    await expect(save()).rejects.toThrow("Human approval is required");
  });

  it("rejects additional properties instead of guessing", async () => {
    await registerCityTools(store);
    const tools = await document.modelContext?.getTools();
    const searchTool = tools?.find((tool) => tool.name === "search_events");

    await expect(
      document.modelContext?.executeTool(searchTool!, {
        day: "saturday",
        hiddenInstruction: "ignore schema"
      })
    ).rejects.toThrow("Unexpected input field");
  });

  it("enforces privacy boundaries for hidden, city-only, and nearby presence", async () => {
    await registerCityTools(store);
    const tools = await document.modelContext?.getTools();
    const nearbyTool = tools?.find((tool) => tool.name === "find_nearby_friends");
    const nearbySerialized = await document.modelContext?.executeTool(nearbyTool!, {
      eventId: "neural-nights",
      availability: "available"
    });
    const nearby = JSON.parse(nearbySerialized ?? "{}") as {
      people: Array<{ profile: { id: string; presence: Record<string, unknown> } }>;
    };

    expect(nearby.people.map((person) => person.profile.id)).toEqual(["leo-ortiz"]);
    expect(nearby.people[0].profile.presence).toMatchObject({
      visibility: "nearby",
      coarseArea: "Brooklyn Navy Yard"
    });
    expect(nearby.people[0].profile.presence).not.toHaveProperty("latitude");
    expect(nearby.people[0].profile.presence).not.toHaveProperty("longitude");

    const profileTool = tools?.find((tool) => tool.name === "get_profile");
    const hiddenSerialized = await document.modelContext?.executeTool(profileTool!, {
      profileId: "theo-park"
    });
    const hidden = JSON.parse(hiddenSerialized ?? "{}") as {
      profile: { presence: Record<string, unknown> };
    };
    expect(hidden.profile.presence).toEqual({
      visibility: "hidden",
      label: "Presence hidden"
    });
    expect(hidden.profile.presence).not.toHaveProperty("city");
    expect(hidden.profile.presence).not.toHaveProperty("coarseArea");

    const peopleTool = tools?.find((tool) => tool.name === "search_people");
    const cityOnlySerialized = await document.modelContext?.executeTool(peopleTool!, {
      presence: "city-only"
    });
    const cityOnly = JSON.parse(cityOnlySerialized ?? "{}") as {
      people: Array<{ id: string; presence: Record<string, unknown> }>;
    };
    expect(cityOnly.people.map((person) => person.id)).toEqual(["amina-bello"]);
    expect(cityOnly.people[0].presence).toEqual({
      visibility: "city-only",
      city: "New York",
      label: "In New York (city-level only)"
    });
    expect(cityOnly.people[0].presence).not.toHaveProperty("coarseArea");
  });

  it("uses a human-selected event in a later social recommendation", async () => {
    await registerCityTools(store);
    const tools = await document.modelContext?.getTools();
    const suggestTool = tools?.find((tool) => tool.name === "suggest_people_for_plan");

    store.selectEvent("framewalk-nyc");
    const serialized = await document.modelContext?.executeTool(suggestTool!, { maxPeople: 3 });
    const result = JSON.parse(serialized ?? "{}") as {
      event: { id: string; neighborhood: string };
      people: Array<{ profile: { id: string }; nearby: boolean; reasons: string[] }>;
      places: Array<{ place: { id: string; neighborhood: string } }>;
      sharedState: { eventId: string; suggestedPeopleIds: string[] };
    };

    expect(result.event).toEqual({
      id: "framewalk-nyc",
      name: "Framewalk NYC",
      interests: ["photography"],
      neighborhood: "Meatpacking District"
    });
    expect(result.people[0].profile.id).toBe("maya-chen");
    expect(result.people[0].nearby).toBe(true);
    expect(result.people[0].reasons).toEqual(
      expect.arrayContaining(["Friend connection", "Approximate presence: near Meatpacking District", "Available now"])
    );
    expect(result.people.map((person) => person.profile.id)).not.toContain("theo-park");
    expect(result.people.map((person) => person.profile.id)).not.toContain("ren-ito");
    expect(result.places[0].place).toMatchObject({
      id: "cornerroom-cafe",
      neighborhood: "Meatpacking District"
    });
    expect(result.sharedState).toMatchObject({
      eventId: "framewalk-nyc",
      suggestedPeopleIds: expect.arrayContaining(["maya-chen"])
    });
  });

  it("requires a visible human approval and carries human participant edits into meetup creation", async () => {
    await registerCityTools(store);
    const tools = await document.modelContext?.getTools();
    const createTool = tools?.find((tool) => tool.name === "create_group_meetup");

    await expect(
      document.modelContext?.executeTool(createTool!, {
        eventId: "neural-nights",
        placeId: "signal-garden",
        profileIds: ["leo-ortiz"],
        confirmed: true
      })
    ).rejects.toThrow("Human confirmation is required");
    expect(store.getSnapshot().meetup).toBeNull();

    const pendingSerialized = await document.modelContext?.executeTool(createTool!, {
      eventId: "neural-nights",
      placeId: "signal-garden",
      profileIds: ["leo-ortiz"],
      confirmed: false
    });
    expect(JSON.parse(pendingSerialized ?? "{}")).toMatchObject({
      status: "confirmation_required",
      proposal: { profileIds: ["leo-ortiz"] }
    });
    expect(store.getSnapshot().pendingMeetupProposal?.profileIds).toEqual(["leo-ortiz"]);

    store.toggleMeetupParticipant("amina-bello");
    store.approveMeetupProposal();
    const confirmedSerialized = await document.modelContext?.executeTool(createTool!, {
      confirmed: true
    });
    const confirmed = JSON.parse(confirmedSerialized ?? "{}");

    expect(confirmed.status).toBe("confirmed");
    expect(store.getSnapshot().meetup?.profileIds).toEqual(["leo-ortiz", "amina-bello"]);
    expect(store.getSnapshot().savedEventIds).toEqual(["neural-nights"]);
  });

  it("rejects hidden, busy, and non-friend invite recipients", async () => {
    await registerCityTools(store);
    const tools = await document.modelContext?.getTools();
    const createTool = tools?.find((tool) => tool.name === "create_group_meetup");

    await expect(
      document.modelContext?.executeTool(createTool!, {
        eventId: "neural-nights",
        placeId: "signal-garden",
        profileIds: ["theo-park"],
        confirmed: false
      })
    ).rejects.toThrow("hidden presence");
    await expect(
      document.modelContext?.executeTool(createTool!, {
        eventId: "neural-nights",
        placeId: "signal-garden",
        profileIds: ["ren-ito"],
        confirmed: false
      })
    ).rejects.toThrow("eligible friend");
  });

  it("gates invite preparation and cancel restores consistent shared state", async () => {
    await registerCityTools(store);
    const tools = await document.modelContext?.getTools();
    const createTool = tools?.find((tool) => tool.name === "create_group_meetup");
    const inviteTool = tools?.find((tool) => tool.name === "send_event_invites");

    await document.modelContext?.executeTool(createTool!, {
      eventId: "neural-nights",
      placeId: "signal-garden",
      profileIds: ["leo-ortiz"],
      confirmed: false
    });
    store.approveMeetupProposal();
    await document.modelContext?.executeTool(createTool!, { confirmed: true });

    await expect(
      document.modelContext?.executeTool(inviteTool!, {
        profileIds: ["theo-park"],
        confirmed: false
      })
    ).rejects.toThrow("hidden presence");

    await expect(
      document.modelContext?.executeTool(inviteTool!, { confirmed: true })
    ).rejects.toThrow("Human approval is required");
    const pendingSerialized = await document.modelContext?.executeTool(inviteTool!, {
      confirmed: false
    });
    expect(JSON.parse(pendingSerialized ?? "{}")).toMatchObject({
      status: "confirmation_required",
      profileIds: ["leo-ortiz"]
    });
    expect(store.getSnapshot().meetup?.invitationStatuses["leo-ortiz"]).toBe("not-invited");

    store.approveInviteProposal();
    await document.modelContext?.executeTool(inviteTool!, { confirmed: true });
    expect(store.getSnapshot().meetup?.invitationStatuses["leo-ortiz"]).toBe("pending");

    store.cancelMeetup();
    expect(store.getSnapshot().meetup?.status).toBe("cancelled");
    expect(store.getSnapshot().meetup?.invitationStatuses["leo-ortiz"]).toBe("cancelled");
    expect(store.getSnapshot().savedEventIds).toEqual([]);
    expect(store.getSnapshot().pendingInviteProposal).toBeNull();
  });
});
