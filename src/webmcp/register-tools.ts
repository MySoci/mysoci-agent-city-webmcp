import type { CityStore } from "../state/city-store";
import { createCityTools } from "./city-tools";
import { createMeetupTools } from "./meetup-tools";
import { createSocialTools } from "./social-tools";

export interface WebMCPRegistration {
  supported: boolean;
  registeredToolNames: string[];
  cleanup: () => void;
}

export const registerCityTools = async (store: CityStore): Promise<WebMCPRegistration> => {
  const context = document.modelContext;
  if (!context) {
    return { supported: false, registeredToolNames: [], cleanup: () => undefined };
  }

  const controller = new AbortController();
  const tools = [...createCityTools(store), ...createSocialTools(store), ...createMeetupTools(store)];
  await Promise.all(
    tools.map((tool) => context.registerTool(tool, { signal: controller.signal }))
  );

  return {
    supported: true,
    registeredToolNames: tools.map((tool) => tool.name),
    cleanup: () => controller.abort()
  };
};

export const invokeCityTool = async (
  store: CityStore,
  name: string,
  input: Record<string, unknown>
) => {
  const context = document.modelContext;
  if (context) {
    const registeredTools = await context.getTools();
    const registeredTool = registeredTools.find((tool) => tool.name === name);
    if (registeredTool) {
      const serialized = await context.executeTool(registeredTool, input);
      return JSON.parse(serialized) as unknown;
    }
  }

  const localTool = [...createCityTools(store), ...createSocialTools(store), ...createMeetupTools(store)].find(
    (tool) => tool.name === name
  );
  if (!localTool) throw new Error(`Unknown city tool: ${name}`);
  return localTool.execute(input, { signal: new AbortController().signal });
};
