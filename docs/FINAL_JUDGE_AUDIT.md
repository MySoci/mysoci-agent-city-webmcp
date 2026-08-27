# Final judge audit — 2026-08-27

Editorial self-assessment against the four equally weighted official Devpost criteria, not an organizer score or eligibility ruling. Core features are frozen.

## Current release gate status

Local `pnpm lint`, `pnpm test` (13/13), `pnpm build` and `git diff --check` pass. A credential-pattern scan of 49 tracked/unignored text files found no matches or prohibited paths. The root MIT license matches the previous commit exactly. Comparing the supplied icon with the repository copy shows only the reduced-motion rule and final newline were added.

The challenge in-app browser discovered all nine native tools, invoked event search and the social action loop, rejected confirmation bypasses, and observed human edits. Desktop 1440×900 and mobile 390×844 have no horizontal overflow; the native About modal opens with Close focused, and visible Close works. Browser warnings/errors were empty.

**Keyboard gate resolved:** with explicit user authorization, bundled Playwright 1.62.1 drove an isolated local Chrome 151.0.7922.174 instance at 1440×900 and 390×844. It reproduced Tab leaving the native dialog after the source link. A scoped boundary loop now keeps Tab/Shift+Tab between Close and that link without intercepting Escape. The same real-browser test passed keyboard opening, initial Close focus, five forward and five reverse Tab presses, Escape dismissal, focus return to the correct About trigger, visible Close and normal navigation to Judge Mode after closing. No test context or injected keyboard simulation replaced browser input. No browser dependency, service, login or paid feature was added.

All local release gates are satisfied. This record precedes the release commit; production identifiers and post-deployment results are reported after deployment, not invented in advance.

| Criterion | Score | Strength | Reason below 5 |
| --- | --- | --- | --- |
| WebMCP Leverage | 4/5 | Nine composable native tools connect discovery, privacy, shared state and UI-only confirmation. Independent native calls are reproducible. | WebMCP/runtime compatibility is experimental; the one-click scenario is deterministic replay, not an embedded autonomous language-model conversation. Show an independent client call in the video. |
| Execution | 4/5 | A coherent no-login product with responsive UI, visible activity, edit/approve/cancel/reset, strict validation and repeatable tests. | Mobile requires substantial scrolling between discovery and approval; cross-browser/assistive-technology coverage remains narrower than a mature production product. |
| Potential Impact | 3/5 | A specific coordination problem for newcomers and small groups: finding an event, available friends and a place together. | All participants/presence are fictional; there is no user research, adoption evidence or measured reduction in coordination time. Present potential, not demonstrated real-world impact. |
| Creativity & Ambition | 4/5 | A privacy-aware social-city action loop is more distinctive than isolated search or form tools. | Event and social planning are established categories; the prototype demonstrates one narrow local scenario, not the wider city vision. The shared human-agent contract is the differentiation. |

## First-impression assessment

At 1440×900, the title, "Find your event, your people, and a place to meet", Discover → Review → Approve guide, native-tool explanation and Judge Mode button are visible immediately. At 390×844, the same essentials and header action remain visible; detailed social/approval panels require scrolling. The About dialog gives context without adding another page or competing with the primary flow.

An expert walkthrough suggests the core idea is understandable in roughly 10–20 seconds. This is not a timed usability study with first-time judges. The real-world problem and differentiation are clearest in the first 15 seconds of the revised narration; do not rely on a judge opening About or reading the README.

The header and About now say **A WebMCP prototype for MySoci’s future agent layer**. About explicitly says it is not the full MySoci product and explains that the challenge app already supports shared planning using deterministic data. The distinction is visible immediately without weakening the broader vision or claiming an existing production integration.

## Strongest and weakest points

- **Strongest:** actual native structured capabilities act on the same visible state, yet the human edits and authorizes consequential changes. Nearby/city-only/hidden privacy is product behavior, not just a disclaimer.
- **Weakest:** impact evidence beyond a seeded demo. Do not compensate with invented users, integrations, outcomes or feature expansion.
- **Best remaining improvement:** record a crisp real native discovery/invocation at the production origin, then participant edit, denied agent self-approval, human approval and cancel/reset. Show the work instead of reading a long tool list.

## Recommended submission presentation

**Tagline:** An agent-native social city powered by WebMCP

**Short description:** MySoci Agent City helps people and AI agents turn event discovery into a shared social plan. Native WebMCP tools combine fictional events, friends, privacy-safe presence and meetup places in the same visible state the human can edit. The agent proposes; the human approves meetup creation and fictional invitations, and can cancel or reset. This standalone challenge prototype explores a future MySoci agent layer connecting social discovery, digital cities and real-world experiences.

Use `devpost-submission.md` for the full draft and judge testing instructions. Use `docs/DEMO_PACKAGE.md` for the 2:37 storyboard and exact narration. Actual exported duration/audio still require verification before any later public video upload; no video was uploaded or Devpost project submitted in this slice.

## Eligibility, IP and presentation cautions

- The WebMCP implementation began on 2026-08-26; the broader MySoci vision and supplied website icon predate this challenge. Keep that distinction explicit.
- The user identifies the supplied icon as original MySoci-owned branding and authorizes its use here. The audit does not independently certify ownership. No other website, private project, asset pipeline or proprietary source was imported.
- Root `LICENSE` remains MIT for software. `TRADEMARKS.md` limits general reuse of the name/icon while permitting the brand to remain with copies for running/demo/evaluation. The official rules do not expressly adjudicate this specific brand carve-out; do not describe it as organizer-approved.
- No third-party music, footage, marks, private data, secrets or services are needed for the video. Use only the app's supplied/created assets and original or authorized narration.
- The final video must be public, have audio and remain under three minutes. Final entrant/team/form acknowledgements and final submission remain human decisions. Nothing here guarantees acceptance or a prize.
