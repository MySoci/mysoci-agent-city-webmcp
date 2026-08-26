# Challenge timeline

This file records the chronological provenance of **MySoci Agent City** for The WebMCP Challenge.

## 2026-08-26 — Project start

- Began a brand-new, standalone WebMCP challenge implementation during the official submission period.
- Chose the repository name `mysoci-agent-city-webmcp` and the tagline “An agent-native social city powered by WebMCP”.
- Confirmed through the official Devpost Hackathons plugin that The WebMCP Challenge submission window runs from 2026-08-25 19:00 UTC through 2026-09-03 20:00 UTC.
- Reviewed the current WebMCP Community Group draft and official Chrome developer guidance before implementation.
- Established a strict separation boundary: no existing private MySoci/Unity repositories, source code, assets, credentials, services, or proprietary systems are used by this prototype.
- Created the provenance commit `c76a83611e7c8d9e7488bebbb8349dd81529344a` at `2026-08-26T16:25:04+03:00` with the README, MIT license, timeline, and ignore policy.
- Built the first WebMCP foundation with deterministic events, native tool registration, visible Agent Activity, a confirmation-gated shared plan, and responsive Judge Mode UI.
- Verified native discovery and invocation in the challenge in-app browser, plus lint, automated tests, and a production build.

## Social Discovery + Places + Social Presence foundation

- Added deterministic fictional profiles, friend/connection relationships, interests, availability, coarse privacy-aware presence, and fictional meetup places.
- Added five strict read-only WebMCP tools and composed the event → people → presence → availability → place recommendation flow.
- Added visible social cards with relationship/relevance explanations, local fictional avatars, and a human-selected-event continuation test.
- Added automated privacy tests proving hidden profiles are never surfaced nearby, city-only profiles expose only city-level presence, and nearby profiles expose only coarse neighborhoods.

## 2026-08-26 — Confirmed social meetup flow

- Added strict state-changing WebMCP tools `create_group_meetup` and `send_event_invites`, both annotated `readOnlyHint: false`.
- Enforced a visible two-step approval contract: an agent proposal (`confirmed: false`) creates an editable UI review; only the human approval control grants the in-memory approval latch required by the subsequent `confirmed: true` call.
- Added deterministic shared meetup state for event, fictional place, selected friends, time, estimated ticket cost, and invitation statuses.
- Added participant editing before approval, fictional invite preparation, visible cancel behavior, and deterministic reset/replay.
- Added automated confirmation-bypass, hidden/busy/non-friend recipient, invite, undo/cancel, schema, and shared-state continuation tests.
- Verified the full native browser path: event search → nearby friends → places → social suggestions → human participant edit → meetup approval → invite approval → cancel.

## 2026-08-26 — Judge Mode clarity polish

- Added a compact Discover → Review → Approve guide so a first-time judge can understand the human + agent loop from the first viewport.
- Added the concise product explanation: “Native WebMCP tools operate on the same visible application state as the human — no brittle browser automation.”
- Promoted the social-meetup scenario with an explicit `Run social meetup` action, retained `Event planning`, and made `Reset demo` the deterministic replay control.
- Added restrained Agent Activity labels distinguishing discovery calls from shared-state actions, while preserving real native tool results.
- Refined the About copy to describe this as a standalone challenge prototype exploring a future MySoci agent layer across digital cities and real-world experiences.
- Replayed the complete flow from a clean reset in the challenge in-app browser at desktop and mobile widths; confirmed no console warnings/errors or horizontal overflow.

## 2026-08-26 — First Vercel production deployment verification

- Created the Vercel project `mysoci-agent-city-webmcp` in the `MySoci` team, targeting the production environment with the existing Vite/pnpm build (`pnpm build`, output `dist`).
- Deployment id: `dpl_4243avyCXWKc5vqgwkDqMzi3UM6B`.
- Production URL: `https://mysoci-agent-city-webmcp-q8epaiwf3-my-soci.vercel.app/`.
- Project alias: `https://mysoci-agent-city-webmcp-my-soci.vercel.app/`.
- The deployment was created during the 2026-08-26 verification window from the validated application artifact built from commit `0ed8d74a6ab3721ecd8c89a46a9937460fc58fc3`. The deployment API did not expose a more precise creation timestamp in this verification session.
- Vercel Authentication “Require Log In” was disabled in the free project setting so the challenge URL is publicly reachable. No Password Protection or paid Upgrade was enabled.
- Pre-deployment lint, tests, production build, diff check, and credential-pattern scan passed. The public page loaded without authentication and the deterministic Judge Mode social flow completed through human approval, fictional invite preparation, cancel, and reset.
- Production verification remains **blocked**: the in-app browser reported `city-atlas.png` and the fictional avatar image as undecodable (`naturalWidth: 0`), while the same local preview loaded the city asset successfully. The available verification harness also could not independently inspect `document.modelContext` on the deployed page, so a direct production `getTools()`/`executeTool()` proof could not be completed. A follow-up production deployment attempt was rejected by Vercel with HTTP 403 (`You don't have permission to create a Production Deployment for this project`).
- No commerce, travel, authentication, external API, real-world messaging, GPS, payment, credential, private MySoci code, or private asset was introduced.

## 2026-08-27 — Production blocker recovery

- Reauthenticated the Vercel CLI as `louisraff-2994`, confirmed membership in the free `MySoci` team (`my-soci`), and linked the existing project `prj_GIXpsVd3X5apd5HpBy3PSqRleEP1`; no project was recreated and no paid feature was enabled.
- Isolated the earlier Vercel 403 to the connector's authorization context. The authenticated CLI identity can inspect and deploy to the existing project, proving that the account itself has production permission.
- Isolated the PNG failure to the first connector upload: both image responses contained Base64 text while declaring `image/png`. The repository PNG files were valid, so no artwork regeneration or re-encoding was required.
- Added explicit Vite/pnpm deployment configuration (`pnpm install --frozen-lockfile`, `pnpm build`, output `dist`) and deployed commit `2045014fd94e2174226ab08ac068ee25ce1ee35e` through the authenticated CLI.
- Production deployment `dpl_8NgSmBEDCRejZsBWABHFKwtdxS3Z` became ready at `2026-08-27T02:03:40+03:00`; the stable public URL is `https://mysoci-agent-city-webmcp.vercel.app/`.
- Verified exact production PNG bytes and decode, native discovery of all nine WebMCP tools, real read-only and confirmation-gated tool calls, human edit → agent continuation, privacy boundaries, complete Judge Mode replay, cancel/reset, desktop/mobile layout, zero console entries, and zero horizontal overflow.
- The earlier `document.modelContext` false result came from the browser verifier's isolated read-only evaluation world. In the same real in-app browser tab, the native WebMCP capability discovered and invoked the document's registered tools at the production origin; it was not an application/header/iframe failure.
- No login requirement, password protection, paid Vercel upgrade, secret, environment variable, private MySoci material, or new product feature was introduced.

## History policy

- Preserve ordinary chronological commits.
- Do not squash or rewrite challenge history.
- Never force-push.
- Validate relevant builds and tests and inspect `git status` before every push.
