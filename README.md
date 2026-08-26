# MySoci Agent City

**An agent-native social city powered by WebMCP**

MySoci Agent City is a new, standalone WebMCP prototype created for [The WebMCP Challenge](https://webmcp.devpost.com/). Implementation began on **2026-08-26**, during the challenge submission period.

This repository is inspired by the broader MySoci product vision, but it is technically and legally separate from the private MySoci/Unity project. It does not contain or depend on private MySoci code, assets, credentials, avatar or face systems, backend services, production data, or proprietary implementation details.

## Current milestone

This milestone extends the independently buildable foundation with a privacy-aware social layer:

- a polished no-login Judge Mode shell with deterministic seeded city data;
- a read-only WebMCP tool, `search_events`;
- a state-changing WebMCP tool, `save_event_to_plan`;
- read-only social and places tools: `search_people`, `get_profile`, `search_places`, `find_nearby_friends`, and `suggest_people_for_plan`;
- shared React state so agent actions visibly update the same plan the human sees;
- an Agent Activity rail for tool calls and results;
- relationship-aware suggestions that combine event interests, friend/connection edges, availability, coarse presence, and fictional meetup places;
- privacy behavior for hidden, city-only, and nearby presence without person coordinates;
- explicit confirmation semantics and a reversible saved-plan action;
- local unit/integration tests and a production build.

Invitations, group meetup creation, commerce, travel, authentication, real GPS, external services, and deployment are intentionally out of scope for this milestone.

## WebMCP approach

The app uses the imperative draft API:

```js
await document.modelContext.registerTool({
  name: "search_events",
  description: "Search deterministic city events by interest, day, and price.",
  inputSchema: { /* strict JSON Schema */ },
  annotations: { readOnlyHint: true },
  execute: async (input, { signal }) => { /* update activity + return data */ }
});
```

Tool registration is a progressive enhancement. A supported WebMCP browser gets native `document.modelContext` registration. The UI remains locally demonstrable in other browsers, while the automated WebMCP contract tests install a spec-shaped test context and prove discovery plus invocation.

The tools are intentionally small and composable:

- `search_events` is read-only and filters deterministic events by words, interests, day, and maximum price.
- `save_event_to_plan` is state-changing. Its first call requests visible human approval; only a confirmed second call writes to the shared plan, which the human can undo.
- `suggest_people_for_plan` uses the current selected event when `eventId` is omitted, then returns privacy-safe people and nearby fictional places with human-readable reasons.

See [the verification record](./docs/WEBMCP_VERIFICATION.md) for native discovery and invocation evidence.

Current primary references:

- [WebMCP Community Group draft](https://webmachinelearning.github.io/webmcp/)
- [Chrome WebMCP developer documentation](https://developer.chrome.com/docs/ai/webmcp)
- [Chrome WebMCP security guidance](https://developer.chrome.com/docs/ai/webmcp/secure-tools)

WebMCP is an emerging draft, not a W3C Standard, and remains subject to change. The current draft exposes registration through `document.modelContext.registerTool`, uses JSON Schema inputs, and defines `readOnlyHint` and `untrustedContentHint` annotations.

## Local development

Prerequisites: Node.js 20+ and pnpm 9+.

```bash
pnpm install
pnpm dev
```

Validation:

```bash
pnpm lint
pnpm test
pnpm build
```

To serve the validated production output locally:

```bash
pnpm build
pnpm preview
```

For local native WebMCP testing in supported Chrome builds, enable `chrome://flags/#enable-webmcp-testing` and relaunch Chrome. The Devpost challenge also identifies ChatGPT's in-app browser as a supported judging environment.

## Safety and data

- All first-slice content is deterministic local seed data.
- No login, backend, database, payment, analytics, advertising, or external runtime API is required.
- No real people, purchases, invitations, or production actions are represented.
- Social presence is deliberately coarse: hidden profiles expose no location, city-only profiles expose only the city, and nearby profiles expose only a named coarse neighborhood.
- No secrets should be added to this repository. `.env*`, private keys, build output, and common Unity/private-project folders are ignored.
- Generated concept art and the fictional city-atlas image in this repository were created specifically for this standalone prototype; no private MySoci assets were used.

## About MySoci

MySoci explores social experiences around digital cities, personalized identity, and real-world discovery. This challenge prototype explores a possible future agent layer through WebMCP without exposing proprietary MySoci implementation details.

## License

[MIT](./LICENSE)
