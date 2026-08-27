# MySoci Agent City

**An agent-native social city powered by WebMCP**

MySoci Agent City is a new, standalone WebMCP prototype created for [The WebMCP Challenge](https://webmcp.devpost.com/). Implementation began on **2026-08-26**, during the challenge submission period.

**[Open the live production demo](https://mysoci-agent-city-webmcp.vercel.app)** · No login · Deterministic seeded data · No real messages or transactions

This repository is inspired by the broader MySoci product vision, but it is technically and legally separate from the private MySoci/Unity project. It does not contain or depend on private MySoci code, assets, credentials, avatar or face systems, backend services, production data, or proprietary implementation details.

**A WebMCP prototype for MySoci’s future agent layer.** MySoci Agent City explores capabilities designed to inform the broader MySoci product; it is not the full MySoci product and is not claimed to be integrated into it.

## Try the signature flow

1. Open the [production app](https://mysoci-agent-city-webmcp.vercel.app) in ChatGPT's WebMCP-capable in-app browser, or Chrome 149+ with `chrome://flags/#enable-webmcp-testing` enabled.
2. Select **Judge Mode** in the header, or **Run social meetup** in the scenario controls. Either starts the same primary replay.
3. Watch native discovery calls appear in **Agent Activity**.
4. Review the event, privacy-safe people, and fictional meetup place; edit the participant selection.
5. Select **Confirm meetup**, then **Prepare invites** and **Approve invites**.
6. Use **Cancel meetup** or **Reset demo** to replay the deterministic flow.

The key contract is visible throughout: the agent and human share one application state, but only the human UI can authorize consequential actions.

**About** opens a keyboard-accessible dialog explaining the prototype, WebMCP, human control, and the broader MySoci vision. It does not change the shared plan. The header's Judge Mode button directly starts the primary replay; there is no separate setup screen.

## What is included

This milestone extends the independently buildable foundation with a privacy-aware social layer and a confirmed meetup loop:

- a polished no-login Judge Mode shell with deterministic seeded city data;
- a read-only WebMCP tool, `search_events`;
- a state-changing WebMCP tool, `save_event_to_plan`;
- read-only social and places tools: `search_people`, `get_profile`, `search_places`, `find_nearby_friends`, and `suggest_people_for_plan`;
- shared React state so agent actions visibly update the same plan the human sees;
- an Agent Activity rail for tool calls and results;
- relationship-aware suggestions that combine event interests, friend/connection edges, availability, coarse presence, and fictional meetup places;
- privacy behavior for hidden, city-only, and nearby presence without person coordinates;
- explicit confirmation semantics and a reversible saved-plan action;
- a two-step, human-confirmed `create_group_meetup` action;
- a two-step, human-confirmed `send_event_invites` sandbox action that only marks fictional invites pending;
- visible meetup state with participant editing, invite status, and cancel/restore behavior;
- two deterministic Judge Mode scenarios plus reset/replay;
- a judge-first three-step flow (Discover → Review → Approve), prominent social-meetup replay, and compact discovery/shared-state labels in Agent Activity;
- local unit/integration tests and a production build.

Real messaging, commerce, travel, authentication, real GPS, payments, and external runtime services are intentionally out of scope. The validated static production build is hosted on Vercel.

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
- `save_event_to_plan` is state-changing. Its first call requests visible human approval; only the human UI grants the single-use approval latch needed by the confirmed second call. The human can undo the saved event.
- `suggest_people_for_plan` uses the current selected event when `eventId` is omitted, then returns privacy-safe people and nearby fictional places with human-readable reasons.
- `create_group_meetup` first creates a visible proposal. Only a human click in the shared UI grants the approval latch that permits the follow-up `confirmed: true` call; it adds the event to the shared plan and keeps fictional invitations unprepared.
- `send_event_invites` applies the same visible approval contract and changes only deterministic invitation statuses to `pending`; it never contacts a person or external service.

Judge Mode makes the contract legible at a glance: **Native WebMCP tools operate on the same visible application state as the human — no brittle browser automation.** The social-meetup scenario runs the real discovery tools, pauses for participant review, requires a visible human approval, and can be cancelled/reset for replay.

See [the verification record](./docs/WEBMCP_VERIFICATION.md) for native discovery and invocation evidence.

Implementation entry points:

- [`src/webmcp/register-tools.ts`](./src/webmcp/register-tools.ts) — native registration lifecycle;
- [`src/webmcp/city-tools.ts`](./src/webmcp/city-tools.ts) — event discovery and shared-plan tools;
- [`src/webmcp/social-tools.ts`](./src/webmcp/social-tools.ts) — privacy-safe people and place discovery;
- [`src/webmcp/meetup-tools.ts`](./src/webmcp/meetup-tools.ts) — human-confirmed meetup and invitation actions;
- [`src/webmcp/city-tools.test.ts`](./src/webmcp/city-tools.test.ts) — schemas, discovery, privacy, shared-state, confirmation-bypass, and cancel/reset coverage.

Current primary references:

- [WebMCP Community Group draft](https://webmachinelearning.github.io/webmcp/)
- [Chrome WebMCP developer documentation](https://developer.chrome.com/docs/ai/webmcp)
- [Chrome WebMCP security guidance](https://developer.chrome.com/docs/ai/webmcp/secure-tools)

WebMCP is an emerging draft, not a W3C Standard, and remains subject to change. The current draft exposes registration through `document.modelContext.registerTool`, uses JSON Schema inputs, and defines `readOnlyHint` and `untrustedContentHint` annotations.

## Local development

Prerequisites: Node.js 20+ and pnpm 9+.

```bash
git clone https://github.com/MySoci/mysoci-agent-city-webmcp.git
cd mysoci-agent-city-webmcp
pnpm install --frozen-lockfile
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

- All demo content is deterministic local seed data.
- No login, backend, database, payment, analytics, advertising, or external runtime API is required.
- No real people, purchases, messages, or production actions are represented; invite state is a deterministic sandbox label only.
- Social presence is deliberately coarse: hidden profiles expose no location, city-only profiles expose only the city, and nearby profiles expose only a named coarse neighborhood.
- No secrets should be added to this repository. `.env*`, private keys, build output, and common Unity/private-project folders are ignored.
- Generated concept art and the fictional city-atlas image in this repository were created specifically for this standalone prototype; no private MySoci assets were used.
- The owner separately supplied the existing MySoci website icon for header, favicon and About branding. Its artwork and native animation are preserved; only a reduced-motion media rule was added. This pre-existing brand asset is not claimed as challenge-created artwork. No other website files were imported.

## About MySoci

MySoci explores social experiences around digital cities, personalized identity, and real-world discovery. This challenge prototype explores a possible future agent layer through WebMCP without exposing proprietary MySoci implementation details.

## License

Software source: [MIT](./LICENSE). The root license is unchanged. The MySoci name and owner-provided icon are separately protected brand assets, not generally reusable under MIT; see [TRADEMARKS.md](./TRADEMARKS.md).
