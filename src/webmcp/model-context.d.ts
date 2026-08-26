interface WebMCPToolAnnotations {
  readOnlyHint?: boolean;
  untrustedContentHint?: boolean;
}

interface WebMCPExecuteOptions {
  signal?: AbortSignal;
}

interface WebMCPTool {
  name: string;
  title?: string;
  description: string;
  inputSchema?: Record<string, unknown>;
  annotations?: WebMCPToolAnnotations;
  execute: (
    input: Record<string, unknown>,
    options?: WebMCPExecuteOptions
  ) => Promise<unknown>;
}

interface WebMCPRegisteredTool {
  name: string;
  title?: string;
  description: string;
  inputSchema?: Record<string, unknown>;
  annotations?: WebMCPToolAnnotations;
  window?: Window;
  origin?: string;
}

interface WebMCPModelContext {
  registerTool: (
    tool: WebMCPTool,
    options?: { exposedTo?: string[]; signal?: AbortSignal }
  ) => Promise<void>;
  getTools: (options?: { fromOrigins?: string[] }) => Promise<WebMCPRegisteredTool[]>;
  executeTool: (
    tool: WebMCPRegisteredTool,
    input?: Record<string, unknown>,
    options?: { signal?: AbortSignal }
  ) => Promise<string>;
}

interface Document {
  readonly modelContext?: WebMCPModelContext;
}
