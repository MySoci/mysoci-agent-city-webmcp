export const installTestModelContext = (targetDocument: Document = document) => {
  const tools = new Map<string, WebMCPTool>();

  const context: WebMCPModelContext = {
    async registerTool(tool, options) {
      if (tools.has(tool.name)) throw new DOMException("Duplicate tool", "InvalidStateError");
      tools.set(tool.name, tool);
      options?.signal?.addEventListener(
        "abort",
        () => {
          tools.delete(tool.name);
        },
        { once: true }
      );
    },
    async getTools() {
      return [...tools.values()].map((tool) => ({
        name: tool.name,
        title: tool.title,
        description: tool.description,
        inputSchema: tool.inputSchema,
        annotations: tool.annotations,
        window,
        origin: window.location.origin
      }));
    },
    async executeTool(registeredTool, input = {}, options) {
      const tool = tools.get(registeredTool.name);
      if (!tool) throw new DOMException("Tool not found", "NotFoundError");
      const controller = new AbortController();
      if (options?.signal) {
        options.signal.addEventListener("abort", () => controller.abort(), { once: true });
      }
      const result = await tool.execute(input, { signal: controller.signal });
      return JSON.stringify(result);
    }
  };

  Object.defineProperty(targetDocument, "modelContext", {
    configurable: true,
    value: context
  });

  return context;
};
