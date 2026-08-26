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

## History policy

- Preserve ordinary chronological commits.
- Do not squash or rewrite challenge history.
- Never force-push.
- Validate relevant builds and tests and inspect `git status` before every push.
