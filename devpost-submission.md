# Title

MySoci Agent City

## One-line Summary

An agent-native social city where native WebMCP tools help people discover events, find privacy-safe friends and places, and prepare a meetup while the human remains in control.

## Tagline

An agent-native social city powered by WebMCP

## Problem

Planning a social night is fragmented across event listings, friend availability, location context, venue discovery, group coordination, and messaging. A person has to move information between disconnected interfaces, while a conventional browser agent must infer controls and scrape presentation-oriented pages. That approach is brittle, difficult to audit, and poorly suited to sensitive social context.

## Solution

MySoci Agent City is a no-login, deterministic prototype of an agent-operable social city. The application exposes nine strict native WebMCP tools for event discovery, privacy-safe social discovery, place recommendations, shared planning, meetup creation, and fictional invitation preparation.

The signature flow is:

```text
search_events → find_nearby_friends → search_places → suggest_people_for_plan
→ human reviews and edits → create_group_meetup → human approves invitations
```

Native tools operate on the same visible React state as the human. If the human changes the selected event or removes a participant, the next agent call observes that update. Consequential tools cannot authorize themselves: an agent call with `confirmed: true` is rejected unless a visible human click has granted the one-use in-memory approval latch.

## Why This Matters

Social agents need more than access to buttons. They need structured capabilities, current shared state, explicit privacy boundaries, and meaningful human control. WebMCP lets the website declare what an agent may do through strict schemas and composable tool descriptions instead of forcing the agent to reverse-engineer the interface.

This pattern can extend beyond one demo. It points toward agent layers that connect social discovery, digital cities, and real-world experiences while preserving understandable consent and privacy boundaries.

## WebMCP Fit

WebMCP is fundamental to the product rather than an add-on:

- Six read-only discovery tools return deterministic events, profiles, coarse presence, people suggestions, and fictional places.
- Three state-changing tools publish `readOnlyHint: false` and use explicit visible confirmation contracts.
- Every schema uses bounded inputs, enums, required fields, and `additionalProperties: false`.
- Agent Activity renders the real native calls and results.
- Human and agent actions update the same store.
- Subsequent tool calls continue from human-modified state.
- Undo, cancel, and deterministic reset keep the judge path replayable.

This is more reliable and inspectable than browser automation because the website exposes stable, intentional operations rather than asking an agent to guess from layout, text, and selectors.

## Human + Agent Collaboration

The agent discovers events, eligible friends, and meetup places. The human reviews structured recommendation reasons such as `Friend · Available · Nearby · Shared AI interest`, changes participants, and approves consequential actions. Only then can the meetup or fictional invitation state be created. The action remains visible in the same interface and can be cancelled or reset.

The approval boolean is not authority. Authority comes from a one-use latch granted only by the corresponding human UI control, so the agent cannot bypass confirmation by supplying `confirmed: true` itself.

## Privacy

The seeded social model demonstrates three presence levels:

- **Hidden:** never appears as nearby and exposes no location.
- **City-only:** may reveal only the city, never a neighborhood.
- **Nearby:** reveals only a coarse named area, never precise coordinates.

Tool-level checks prevent hidden or otherwise ineligible fictional recipients from entering meetup or invitation actions. The repository contains no precise person-location model.

## MySoci Relationship

MySoci Agent City is a new standalone prototype created during The WebMCP Challenge submission period. It is inspired by the broader private MySoci vision of social discovery, digital cities, personalized identity, and real-world experiences, but it does not contain, copy, depend on, or expose private MySoci code, assets, services, avatar technology, credentials, or proprietary implementation details. The broader MySoci product itself is not claimed to have been created during the challenge.

## How We Used AI

AI-assisted development was used to research the emerging WebMCP draft, turn the product concept into strict tool contracts, identify privacy and confirmation edge cases, implement the React/TypeScript prototype, create deterministic tests, perform browser verification, isolate production deployment defects, and refine judge-facing documentation. The running product itself does not call a hosted model or external AI API; the judge supplies the WebMCP-capable agent client.

## How We Used Codex

OpenAI Codex supported the full engineering workflow: official-spec research, repository scaffolding, application implementation, test design, native browser tool invocation, privacy and confirmation-bypass verification, responsive visual QA, Vercel deployment recovery, Git provenance, and this submission draft. Codex also used the official Devpost Hackathons tooling to read the current rules, registration state, submission fields, dates, and judging criteria. All material claims in this draft are tied to repository or production evidence.

## Key Features

- Judge Mode with two deterministic replayable scenarios and no login.
- Nine native WebMCP tools with strict JSON Schemas and clear annotations.
- Event → friends → presence → place → meetup composition.
- Privacy-aware hidden, city-only, and coarse-nearby behavior.
- Visible recommendation reasons without exposing chain-of-thought.
- Shared human-agent state and human edit → agent continuation.
- UI-only approval latches for meetup creation and fictional invitations.
- Agent Activity for real native calls and results.
- Cancel, undo, and reset behavior.
- Responsive premium city, people, event, place, and plan interface.

## Architecture

- React 19 + TypeScript + Vite.
- Deterministic local event, profile, relationship, presence, and place seeds.
- A shared external-store-style city state consumed by React and WebMCP handlers.
- Imperative `document.modelContext.registerTool(...)` registration with teardown support.
- Small tool modules for city, social, and meetup responsibilities.
- Vitest + JSDOM contract tests using a spec-shaped model context.
- Static Vercel deployment; no backend, authentication, database, secrets, or environment variables.

## Testing Instructions

1. Open https://mysoci-agent-city-webmcp.vercel.app in ChatGPT's WebMCP-capable in-app browser. Chrome 149+ may also be used with `chrome://flags/#enable-webmcp-testing` enabled and the browser relaunched.
2. Select **Judge Mode**, then **Run social meetup**.
3. Observe native calls in **Agent Activity** as the app finds an event, eligible nearby friends, and a fictional meetup place.
4. In **Review meetup**, change the participant selection. The agent cannot confirm this step.
5. Select **Confirm meetup**, then **Prepare invites** and **Approve invites**. No real message is sent.
6. Select **Cancel meetup** or **Reset demo** to verify reversible deterministic state.

No login, credentials, payment, or external service is required.

## Public Demo Link

https://mysoci-agent-city-webmcp.vercel.app

## Public Repository Link

https://github.com/MySoci/mysoci-agent-city-webmcp

## Demo Video

**TODO before final submission:** record the approved 2:37 storyboard with English audio, upload it publicly to YouTube, and add the URL here.

Detailed storyboard and narration: [`docs/DEMO_PACKAGE.md`](./docs/DEMO_PACKAGE.md)

## Screenshot Shot List

1. Judge Mode hero with Discover → Review → Approve, city map, and empty Agent Activity.
2. Social discovery after the primary scenario: Neural Nights, Leo nearby, Amina city-only, Signal Garden, and native activity.
3. Human approval panel with participant checkboxes and “The agent cannot approve this step.”
4. Confirmed meetup and fictional invite status beside Agent Activity.
5. Mobile Judge Mode view showing the same shared workflow without horizontal overflow.

## Submission Readiness Notes

- Production URL: verified public HTTP 200 with no authentication.
- Native WebMCP: nine tools discovered and invoked in the challenge in-app browser.
- Repository: public, independently buildable, and GitHub detects the MIT license.
- Clean clone: `pnpm install --frozen-lockfile`, lint, nine tests, and production build pass.
- Privacy, confirmation bypass, shared-state continuation, cancel, reset, desktop, and mobile gates pass.
- Remaining required asset: public YouTube demo video with audio, under three minutes.

## Known Limitations

- All people, events, places, meetups, and invitations are deterministic fictional challenge data.
- No real messaging, reservation, payment, commerce, travel, authentication, GPS, or external runtime service exists.
- WebMCP is an emerging draft and supported browser environments remain experimental.
- The generic browser evaluator uses an isolated world that does not expose the page's native `document.modelContext`; the challenge browser's native WebMCP capability is used for real discovery and invocation evidence.

## TODO Official Form Fields

| Official field | Recommended answer | Status |
| --- | --- | --- |
| Submitter Type | `Individual` | **USER CONFIRMATION REQUIRED** |
| Country of residence | `Greece` | **USER CONFIRMATION REQUIRED** |
| Organization name | Leave blank if submitting as an individual | Depends on Submitter Type |
| App Status | `New` | Ready; repository provenance begins during the submission period |
| Existing-project explanation | Leave blank | Not applicable when App Status is New |
| Live URL | `https://mysoci-agent-city-webmcp.vercel.app` | Ready |
| Testing instructions | Use the six concise steps in **Testing Instructions** | Ready |
| Public code repo | `https://github.com/MySoci/mysoci-agent-city-webmcp` | Ready |
| Agents/clients used to test WebMCP | `ChatGPT's WebMCP-capable in-app browser; automated spec-shaped WebMCP contract tests in Vitest/JSDOM.` | Ready |
| AI tools leveraged | `OpenAI Codex, ChatGPT's in-app browser, and the official Devpost Hackathons plugin for Codex.` | Ready |
| Level of learning | `Significant` | **USER CONFIRMATION REQUIRED** |
| AI career value | `Yes` | **USER CONFIRMATION REQUIRED** |

No current official field requests a Codex session ID.
