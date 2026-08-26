# WebMCP verification record

Verified locally on **2026-08-26** against the current WebMCP Community Group draft and the challenge in-app browser.

## Native discovery

The page registered and the browser discovered exactly two tools:

| Tool | State | Annotation | Confirmation model |
| --- | --- | --- | --- |
| `search_events` | Read-only | `readOnlyHint: true` | None required |
| `save_event_to_plan` | State-changing | `readOnlyHint: false` | `confirmed: false` creates a visible pending action; a human approves before `confirmed: true` writes shared state |

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

`src/webmcp/city-tools.test.ts` installs a spec-shaped `document.modelContext`, discovers both registered tools, invokes the read-only search, rejects invalid input, verifies the confirmation boundary, and verifies save plus undo state.

## Current compatibility note

The draft documents the `execute(input, { signal })` callback shape. During native challenge-browser verification, the client invoked the callback without the second options argument. The implementation therefore supports the draft `AbortSignal` when supplied while safely treating the options object as optional. This is a narrowly scoped compatibility allowance, not an invented replacement API.

## Scope boundary

All results come from deterministic local seed data. No login, network service, database, production action, payment, credential, private MySoci material, or external dataset participates in this proof.
