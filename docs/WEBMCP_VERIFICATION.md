# WebMCP verification record

Verified locally on **2026-08-26** against the current WebMCP Community Group draft and the challenge in-app browser.

## Native discovery

The page registered seven tools with the native model context:

| Tool | State | Annotation | Confirmation model |
| --- | --- | --- | --- |
| `search_events` | Read-only | `readOnlyHint: true` | None required |
| `save_event_to_plan` | State-changing | `readOnlyHint: false` | `confirmed: false` creates a visible pending action; a human approves before `confirmed: true` writes shared state |
| `search_people` | Read-only | `readOnlyHint: true` | Returns fictional profiles and privacy visibility labels |
| `get_profile` | Read-only | `readOnlyHint: true` | Redacts hidden presence and never returns person coordinates |
| `search_places` | Read-only | `readOnlyHint: true` | Returns deterministic fictional meetup suggestions |
| `find_nearby_friends` | Read-only | `readOnlyHint: true` | Same coarse neighborhood + friend + available filters |
| `suggest_people_for_plan` | Read-only | `readOnlyHint: true` | Composes event, relationship, interests, presence, availability, and places |

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

`src/webmcp/city-tools.test.ts` installs a spec-shaped `document.modelContext`, discovers all seven registered tools, checks read-only annotations, invokes the read-only search, rejects invalid input, verifies the confirmation boundary, verifies save plus undo state, exercises hidden/city-only/nearby privacy boundaries, and verifies that a human-selected event drives a later social recommendation.

## Social workflow evidence

In the challenge in-app browser, the visible Judge Mode flow ran:

```text
search_events → search_people → find_nearby_friends → search_places → suggest_people_for_plan
```

For the seeded `Neural Nights` event, the UI showed Leo Ortiz as a friend with approximate presence near Brooklyn Navy Yard and Amina Bello as a friend with city-only New York presence. Theo Park, whose presence is hidden, was not surfaced by the nearby or plan-suggestion tools. The same result showed Signal Garden as a fictional meetup place in the event neighborhood. Clicking `View profile` invoked `get_profile` and added its native result to Agent Activity.

After a human changed the event selection to `Framewalk NYC`, the social view reset and a later agent call returned Maya Chen near Meatpacking District plus Cornerroom Café. This proves the agent continued from the human-updated shared selection.

## Current compatibility note

The draft documents the `execute(input, { signal })` callback shape. During native challenge-browser verification, the client invoked the callback without the second options argument. The implementation therefore supports the draft `AbortSignal` when supplied while safely treating the options object as optional. This is a narrowly scoped compatibility allowance, not an invented replacement API.

The current model/browser bridge also reports that its low-level `webmcp_list_tools` command is unsupported. The application itself still reported `Native WebMCP`, completed registration, and exercised the registered tools through its own `document.modelContext.getTools()` / `executeTool()` path. Direct low-level tool enumeration is therefore a bridge limitation in this verification runtime, not an application fallback or a spec substitution.

## Scope boundary

All results come from deterministic local seed data. No login, network service, database, production action, payment, credential, private MySoci material, or external dataset participates in this proof.
