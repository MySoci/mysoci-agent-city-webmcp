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

  it("discovers one read-only and one state-changing tool", async () => {
    const registration = await registerCityTools(store);
    const tools = await document.modelContext?.getTools();

    expect(registration.supported).toBe(true);
    expect(tools?.map((tool) => tool.name)).toEqual([
      "search_events",
      "save_event_to_plan"
    ]);
    expect(tools?.find((tool) => tool.name === "search_events")?.annotations).toEqual({
      readOnlyHint: true,
      untrustedContentHint: false
    });
    expect(
      tools?.find((tool) => tool.name === "save_event_to_plan")?.annotations?.readOnlyHint
    ).toBe(false);

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
});
