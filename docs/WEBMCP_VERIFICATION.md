# WebMCP verification record

Verified locally on **2026-08-26** against the current WebMCP Community Group draft and the challenge in-app browser.

## Native discovery

The page registered nine tools with the native model context:

| Tool | State | Annotation | Confirmation model |
| --- | --- | --- | --- |
| `search_events` | Read-only | `readOnlyHint: true` | None required |
| `save_event_to_plan` | State-changing | `readOnlyHint: false` | `confirmed: false` creates a visible pending action; a human approves before `confirmed: true` writes shared state |
| `search_people` | Read-only | `readOnlyHint: true` | Returns fictional profiles and privacy visibility labels |
| `get_profile` | Read-only | `readOnlyHint: true` | Redacts hidden presence and never returns person coordinates |
| `search_places` | Read-only | `readOnlyHint: true` | Returns deterministic fictional meetup suggestions |
| `find_nearby_friends` | Read-only | `readOnlyHint: true` | Same coarse neighborhood + friend + available filters |
| `suggest_people_for_plan` | Read-only | `readOnlyHint: true` | Composes event, relationship, interests, presence, availability, and places |
| `create_group_meetup` | State-changing | `readOnlyHint: false` | `confirmed: false` creates an editable proposal; only visible human approval permits `confirmed: true` |
| `send_event_invites` | State-changing | `readOnlyHint: false` | `confirmed: false` creates an invite review; only visible human approval marks fictional invites pending |

Both input schemas use `additionalProperties: false`, bounded strings and arrays, enums, numeric limits, and required fields where appropriate.

## Native invocation evidence

The browser invoked `search_events` with:

```json
{
  "interests": ["ai", "photography"],
  "day": "saturday",
  "maxPrice": 60
}
```

The deterministic result contained two matching event ids: `neural-nights` and `framewalk-nyc`. Agent Activity showed the call and result in the visible app.

The browser then invoked `save_event_to_plan` with `confirmed: false`. The tool returned `confirmation_required` and the UI displayed **Confirm & save**. After visible approval, the event appeared in the Saturday plan and the activity rail recorded success. A manual **Remove** cleared the plan; a subsequent agent call used that updated state and successfully prepared and saved a different event after a new approval.

## Automated contract coverage

`src/webmcp/city-tools.test.ts` installs a spec-shaped `document.modelContext`, discovers all nine registered tools, checks read-only/state-changing annotations, verifies strict schemas, invokes read-only search, rejects invalid input, verifies both confirmation boundaries and confirmation bypasses, verifies save plus undo state, exercises hidden/city-only/nearby privacy boundaries, rejects hidden/busy/non-friend invite recipients, verifies human participant edits are observed by a later agent call, and verifies cancel restores the shared plan.

## Social workflow evidence

In the challenge in-app browser, the visible Judge Mode flow ran:

```text
search_events → search_people → find_nearby_friends → search_places → suggest_people_for_plan
```

For the seeded `Neural Nights` event, the UI showed Leo Ortiz as a friend with approximate presence near Brooklyn Navy Yard and Amina Bello as a friend with city-only New York presence. Theo Park, whose presence is hidden, was not surfaced by the nearby or plan-suggestion tools. The same result showed Signal Garden as a fictional meetup place in the event neighborhood. Clicking `View profile` invoked `get_profile` and added its native result to Agent Activity.

After a human changed the event selection to `Framewalk NYC`, the social view reset and a later agent call returned Maya Chen near Meatpacking District plus Cornerroom Café. This proves the agent continued from the human-updated shared selection.

## Confirmed meetup flow evidence

In Judge Mode, the native browser ran:

```text
search_events → search_people → find_nearby_friends → search_places → suggest_people_for_plan
→ create_group_meetup(false) → human edits participants → human approves → create_group_meetup(true)
→ send_event_invites(false) → human approves → send_event_invites(true) → human cancels
```

The first proposal contained Leo Ortiz and city-only Amina Bello. The human unchecked Amina before approving; the confirmed meetup and the subsequent invite proposal therefore contained only Leo, proving that a later WebMCP call observed the edited shared state. The meetup added `Neural Nights` to the Saturday plan, displayed Signal Garden and `$45`, and showed Leo as `Not invited`. The invite approval changed only Leo's deterministic status to `Invite prepared`. Cancel then marked the meetup and invite `Cancelled` and removed the meetup-added event from the Saturday plan.

The review UI never offers hidden Theo Park as a participant, and tool-level validation rejects Theo, busy/non-friend Ren Ito, and any hidden recipient even if an agent supplies the id directly. City-only Amina is shown only as `New York · city-only`; nearby output contains only the coarse neighborhood label and no coordinates.

## Judge Mode clarity evidence

The first viewport now presents a compact three-step guide: **Discover** (events + friends), **Review** (edit the group), and **Approve** (the human confirms). The primary `Run social meetup` scenario is visually dominant, `Event planning` remains a secondary replay, and `Reset demo` returns the seeded store to its initial state.

Judge Mode displays this exact explanation next to the progression: **“Native WebMCP tools operate on the same visible application state as the human — no brittle browser automation.”** Agent Activity keeps the real tool stream concise while labeling read-only calls `Discovery` and state-changing calls `Shared state`.

From a clean reset in the challenge in-app browser, a judge can run the primary scenario, edit participants, approve the meetup, approve fictional invites, cancel the meetup, and reset/replay. The approval latches remain UI-only: an agent cannot self-approve by supplying a boolean.

## Current compatibility note

The draft documents the `execute(input, { signal })` callback shape. During native challenge-browser verification, the client invoked the callback without the second options argument. The implementation therefore supports the draft `AbortSignal` when supplied while safely treating the options object as optional. This is a narrowly scoped compatibility allowance, not an invented replacement API.

The current model/browser bridge also reports that its low-level `webmcp_list_tools` command is unsupported. The application itself still reported `Native WebMCP`, completed registration, and exercised the registered tools through its own `document.modelContext.getTools()` / `executeTool()` path. Direct low-level tool enumeration is therefore a bridge limitation in this verification runtime, not an application fallback or a spec substitution.

## Public production verification — 2026-08-26

The first Vercel production deployment used the artifact built from commit `0ed8d74a6ab3721ecd8c89a46a9937460fc58fc3`:

- Project: `mysoci-agent-city-webmcp` (team `MySoci`)
- Deployment: `dpl_4243avyCXWKc5vqgwkDqMzi3UM6B`
- Production URL: `https://mysoci-agent-city-webmcp-q8epaiwf3-my-soci.vercel.app/`
- Alias: `https://mysoci-agent-city-webmcp-my-soci.vercel.app/`
- Environment: production
- Deployment date: 2026-08-26 (the connector did not return a more precise creation timestamp)

The URL was publicly reachable after the free Vercel Authentication “Require Log In” setting was turned off; no paid protection or billing action was used. The deployed UI rendered without login, exposed the Judge Mode scenarios, showed Agent Activity, and completed the deterministic social meetup flow through participant edit, human meetup approval, fictional invite approval, cancel, and reset. The production UI also preserved the privacy-safe nearby result: Leo was surfaced, city-only Amina and hidden Theo were not returned by the nearby action.

This deployment is not marked as a complete WebMCP production pass. In the available in-app browser, the deployed `city-atlas.png` and fictional avatar image did not decode (`naturalWidth: 0`), although the same local preview loaded the city asset. The browser verification harness also reported `document.modelContext` as unavailable to direct page evaluation, while the application status label remained `Native WebMCP`; therefore an independent production `getTools()`/`executeTool()` invocation record cannot be claimed from this session. A follow-up production deployment request was rejected with Vercel HTTP 403 permission error, so the asset and native-bridge findings remain open blockers.

## Production recovery verification — 2026-08-27

The three first-deployment blockers were isolated before any fix:

1. **PNG decoding:** the first connector-created deployment returned Base64 text (`iVBOR...`) as the response body while declaring `image/png`. This was an upload representation defect, not a PNG encoder/profile defect.
2. **Direct `document.modelContext` false result:** the browser verifier's generic read-only `evaluate` API executes in an isolated world that does not expose the browser-native WebMCP global. It reported a top-level production URL but `modelContextInDocument: false`. In that same tab, the challenge browser's native `webmcp` capability immediately announced the registered document tools, returned them through `fetchTools()`, and invoked them against the production origin. The false result was therefore a verification-world limitation, not a deployed page, header, iframe, redirect, or origin-isolation defect.
3. **Vercel 403:** the connector's authorization context could list the `MySoci` team but could not inspect/deploy the project. After device authentication, Vercel CLI identity `louisraff-2994` could inspect the existing `my-soci/mysoci-agent-city-webmcp` project and its deployment list and could create a production deployment. The account/team permission was valid; the connector context was the mismatch.

The existing project was linked locally with project id `prj_GIXpsVd3X5apd5HpBy3PSqRleEP1` and org id `team_xyJHPmpLA4vzeW3latqXBFXV`. The project was not deleted, unlinked, or recreated. Its first configuration was `Other` with the default `public` output, so commit `2045014fd94e2174226ab08ac068ee25ce1ee35e` added explicit Vite/pnpm settings: `pnpm install --frozen-lockfile`, `pnpm build`, and output `dist`.

### Recovered deployment

- Project/team: `mysoci-agent-city-webmcp` / `MySoci` (`my-soci`, Hobby)
- Deployment id: `dpl_8NgSmBEDCRejZsBWABHFKwtdxS3Z`
- Deployment URL: `https://mysoci-agent-city-webmcp-dj7mad9ss-my-soci.vercel.app/`
- Stable production URL: `https://mysoci-agent-city-webmcp.vercel.app/`
- Environment/status: production / Ready
- Created: `2026-08-27T02:03:40+03:00`
- Deployed repository HEAD: `2045014fd94e2174226ab08ac068ee25ce1ee35e`

The root URL returned HTTP 200 without authentication or redirect. It is top-level HTTPS, does not use `document.domain`, and returned neither `Origin-Agent-Cluster: ?0` nor a restrictive `tools` Permissions Policy header.

### Asset proof

| Asset | HTTP | Content-Type | Bytes | SHA-256 | PNG/decode |
| --- | --- | --- | ---: | --- | --- |
| `/city-atlas.png` | 200 | `image/png` | 2,935,665 | `7C903427C7C8BD1845B68147EB77CC48AB667E97E4B95D6DF8854FB3C3C3C1C3` | Binary PNG signature; 1672×941; 8-bit RGB; in-app `naturalWidth: 1672` |
| `/social-avatar-sprite.png` | 200 | `image/png` | 2,927,467 | `AF0CFB507A89001CC67902CA5D1986253D58EBCF5651D6BC8800F8A37C5B04B9` | Binary PNG signature; 1254×1254; 8-bit RGBA; in-app `naturalWidth: 1254` |

Both hashes exactly match the repository files used by the build. The artwork was not regenerated or re-encoded.

### Native production WebMCP proof

At `https://mysoci-agent-city-webmcp.vercel.app/`, the challenge in-app browser announced and retrieved these nine actual native tools through its document WebMCP capability: `search_events`, `save_event_to_plan`, `search_people`, `get_profile`, `search_places`, `find_nearby_friends`, `suggest_people_for_plan`, `create_group_meetup`, and `send_event_invites`. Their published schemas and `readOnlyHint` annotations matched the table above, and their origin/page URL matched the stable production origin.

Native calls then proved the shared-state and safety contracts:

- `search_events({ interests: ["ai", "electronic-music"], day: "saturday", maxPrice: 60 })` returned `neural-nights` and `afterlight-radio` and selected `neural-nights` in visible shared state.
- `find_nearby_friends` returned only Leo Ortiz with coarse `Brooklyn Navy Yard` presence. `get_profile({ profileId: "theo-park" })` returned `Presence hidden` with no location. A city-only search returned Amina Bello with only `New York`.
- A human selected `Framewalk NYC` in the UI. The next native `find_nearby_friends` call used `framewalk-nyc` and returned Maya Chen near the coarse `Meatpacking District`, proving human edit → agent continuation.
- `suggest_people_for_plan` returned Maya plus city-only Amina and the fictional Cornerroom Café. The human later unchecked Amina; the subsequent native invite proposal contained only `maya-chen`, proving the participant edit was observed.
- `create_group_meetup({ confirmed: false })` returned `confirmation_required`; a direct agent call with `confirmed: true` was rejected with `Human confirmation is required before creating the meetup.` Only the visible **Confirm meetup** click consumed the UI latch and created the meetup.
- `send_event_invites({ confirmed: false })` returned an editable confirmation proposal for Maya. A direct `confirmed: true` call was rejected with `Human approval is required before preparing invitations.` Only the visible **Approve invites** click marked the deterministic invite `Invite prepared`; no message was sent.
- Cancel and `Reset demo` returned Agent Activity, Saturday plan, and meetup state to the deterministic empty state.

The primary Judge Mode scenario replayed `search_events → search_people → find_nearby_friends → search_places → suggest_people_for_plan → create_group_meetup(false)` and stopped at the unmistakable human review. The secondary event-planning scenario replayed `search_events → save_event_to_plan(false)` and stopped at **Confirm & save**. Desktop 1440×900 and mobile 390×844 production checks showed no horizontal overflow; browser console and page-error lists were empty.

## Final presentation audit and legacy save-gate correction — 2026-08-27

The final audit reproduced an actual defect on the preceding canonical production build: a native `save_event_to_plan({ eventId: "neural-nights", confirmed: true })` call returned a saved event without a pending human approval. Earlier records above describe the normal save workflow, but did not prove bypass resistance for that legacy action. This is a correction to that coverage gap, not a change to historical evidence or Git history.

The store now requires a single-use approval latch for the current pending event. Only **Confirm & save** grants it. Direct `confirmed: true`, a pending proposal without a human click, reused approval, mismatched event, dismissal, reset, replacement proposal and changed event selection cannot authorize a save. Rejections are recorded as errors in Agent Activity. The existing nine tool names, schemas and annotations are unchanged.

Local challenge-browser native evidence for the correction:

- `save_event_to_plan(true)` on a clean state was rejected with `Human approval is required before saving this event.` The same call remained rejected after a `confirmed: false` proposal, until the visible **Confirm & save** action. **Remove** then cleared the saved event.
- `Run social meetup` composed the registered discovery tools and stopped at review. Direct native meetup approval and a hidden-person proposal were rejected. After reset/replay, the human unchecked Amina and confirmed the meetup; a subsequent native invite proposal contained only Leo. Direct invite approval was rejected until the UI action. Cancel restored the plan.
- After another reset, a human selected Framewalk NYC. Native `find_nearby_friends` with omitted `eventId` used that selection and returned Maya near the coarse Meatpacking District. Hidden Theo returned no location; city-only Amina returned only New York.
- The informational About dialog adds no tools and does not mutate shared state. Two component tests check its content/open/close controls and unchanged store/registry; ten tool tests cover the existing contracts and the strengthened legacy save gate. JSDOM's dialog methods are test stubs, not evidence of native keyboard behavior.

The in-app browser's keyboard bridge did not execute native Tab/Escape defaults during this audit. Native dialog semantics and visible Close worked, but independent keyboard verification remains a separate gate; this record does not label it passed based on mocked events. Browser-native WebMCP discovery/invocation worked through the actual tab capability, not a test context.

Final local commands passed: `pnpm lint`, `pnpm test` (12/12), `pnpm build` and `git diff --check`. The text credential-pattern scan returned zero matches across 49 tracked/unignored text files, with no prohibited secret/private-project paths. The root MIT license is byte-identical to the preceding commit. Desktop 1440×900 and mobile 390×844 checks showed no horizontal overflow, including inside the About dialog; console warnings/errors were empty. No new production deployment is claimed while keyboard verification remains open.

## Brand-clarity release gate — 2026-08-27

This follow-up resolves the keyboard gate left open above. With explicit user authorization, Playwright 1.62.1 launched isolated local Chrome 151.0.7922.174 (no personal profile or login), using actual `page.keyboard.press` input. At both 1440×900 and 390×844:

1. Tab navigation reached the visible desktop/mobile About trigger; Enter opened a native modal.
2. Initial focus was Close. Five Tab presses alternated source link → Close; five Shift+Tab presses alternated in reverse. Every active element stayed inside the dialog.
3. Escape closed it natively and returned focus to the original About trigger.
4. The next Tab reached Judge Mode, proving no remaining trap. Reopening and clicking visible Close also restored focus correctly.

The first independent run reproduced focus leaving the original native dialog after the source link. `AboutDialog.tsx` now intercepts only unmodified boundary Tab/Shift+Tab while open, preserving native Escape, inert background and focus restoration. The real browser rerun, not the component-test stubs, supplies the keyboard proof. See the [WAI modal dialog keyboard pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/).

The clarified subtitle and About copy identify a working standalone challenge prototype informing a future agent layer, not the full MySoci product. The header icon, favicon, reduced-motion rule and root MIT license are preserved.

Final local regression: lint PASS; 13/13 tests PASS; production build PASS; diff check PASS; credential-pattern scan of 49 tracked/unignored text files had zero matches and zero prohibited paths. Native in-app discovery still exposed the same nine tool schemas/annotations. Direct native approval attempts for save, meetup and invites were rejected. Human removal of Amina produced a later invite proposal containing only Leo; approved invites remained fictional, and cancel/reset restored state. A human-selected Framewalk event was observed by the subsequent nearby-friends call (Maya, coarse Meatpacking District). Hidden Theo exposed no location; city-only Amina was never returned as nearby. Desktop/mobile screenshots, no-overflow checks and empty console warning/error lists were verified.

This section records pre-commit local evidence; post-deployment identifiers and production results belong to the release report after the deployment completes.

## Scope boundary

All results come from deterministic local seed data. No login, network service, database, production action, payment, credential, private MySoci material, or external dataset participates in this proof.
