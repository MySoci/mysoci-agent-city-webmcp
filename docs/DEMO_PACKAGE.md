# Demo package

This package is for a **2:37** English-language demo with clear audio. Keep the production app and Agent Activity visible; use jump cuts instead of showing load time or live typing. Do not use copyrighted music, third-party marks, or footage without permission.

## Storyboard

| Time | Picture | Purpose |
| --- | --- | --- |
| 0:00–0:12 | Production hero already open; title, Judge Mode, map | Hook: social planning is fragmented; introduce the agent-native city |
| 0:12–0:30 | Judge guide and Native WebMCP statement; briefly point to Agent Activity | Explain structured native tools and shared state, not browser automation |
| 0:30–0:48 | Select **Run social meetup** | Start the signature deterministic scenario immediately |
| 0:48–1:08 | Event results and Agent Activity | Show `search_events` and the selected AI/music event |
| 1:08–1:28 | People + places cards and activity | Show privacy-safe nearby friend, city-only friend, recommendation reasons, and fictional place |
| 1:28–1:48 | Review meetup; uncheck one participant | Prove the human can edit the proposal and the agent shares the updated state |
| 1:48–2:04 | Confirm meetup; prepare and approve fictional invite | Show the unmistakable approval gates and shared meetup state |
| 2:04–2:16 | Cancel meetup, then Reset demo | Demonstrate reversibility and deterministic replay |
| 2:16–2:28 | Quick cut to WebMCP source/tool schemas and test names | Technical proof: native registration, strict schemas, read-only annotations, confirmation tests |
| 2:28–2:37 | Return to hero/About | Close on the wider social discovery + digital city vision |

## Exact narration draft

**0:00–0:12**

“Planning a night out is scattered across events, friends, places, and messaging. MySoci Agent City turns that fragmented workflow into one shared social plan for a person and their agent.”

**0:12–0:30**

“This is a new standalone prototype for the WebMCP Challenge. The website exposes nine structured native tools, so the agent uses intentional capabilities and strict schemas instead of guessing through buttons or scraping the interface. Every call appears here in Agent Activity.”

**0:30–0:48**

“Judge Mode is deterministic and requires no login. I’ll run the signature social meetup scenario: find an AI or music event, check which friends are nearby and available, and suggest a place to meet.”

**0:48–1:08**

“The agent calls the real `search_events` tool and selects Neural Nights. The same selected event is visible to me and becomes the shared context for every following tool.”

**1:08–1:28**

“Next, WebMCP composes friendships, interests, availability, privacy-safe presence, and places. Leo is nearby only at neighborhood level. Amina is city-only, so the tool never upgrades her to nearby. Hidden people are excluded, and no person has precise coordinates.”

**1:28–1:48**

“The agent proposes this meetup, but it cannot approve it. I can change the group first, so I’ll remove Amina. That human edit updates the same shared state the next agent action will read.”

**1:48–2:04**

“Now I confirm the meetup. Invitations have a separate approval gate, and this sandbox never contacts a real person. After I approve, only Leo’s fictional status changes to Invite prepared.”

**2:04–2:16**

“The action remains reversible. Cancel removes the meetup consistently, and Reset returns the entire demo to its original seeded state for another judge.”

**2:16–2:28**

“Under the hood, the app registers native tools through `document.modelContext`, with strict JSON Schemas, read-only annotations, privacy tests, shared-state tests, and checks proving that an agent-supplied confirmation boolean cannot bypass the human UI latch.”

**2:28–2:37**

“MySoci Agent City explores a future agent layer connecting social discovery, digital cities, and real-world experiences—while keeping privacy understandable and people in control.”

## Recording notes

- Record at 1440×900 or 1920×1080, 16:9, with browser zoom at 100%.
- Start on the production URL with a clean **Reset demo** state.
- Keep the cursor deliberate and Agent Activity visible whenever a native tool runs.
- Use the human participant edit as the visual proof of shared state.
- Show both confirmation moments, but spend more time on meetup approval than invitations.
- Use voice narration or original/authorized audio only; background music is unnecessary.
- Export below 2:45 and verify the final public YouTube upload is under 3:00.

## Screenshot recommendations

### Devpost thumbnail

Use the desktop **Review meetup** state: the city/social context on the left, the confirmation panel on the right, and Agent Activity visible. Crop to a readable 16:9 composition. This state communicates product, WebMCP, and human control in one frame.

### Main screenshot

Use the clean production hero above the fold: MySoci Agent City, the Discover → Review → Approve guide, native WebMCP explanation, city map, and empty Agent Activity. This establishes the product within seconds.

### Social discovery screenshot

Capture the primary scenario after suggestions complete: Neural Nights, Leo as nearby, Amina as `New York · city-only`, Signal Garden, structured recommendation reasons, and the discovery call sequence in Agent Activity.

### Human approval screenshot

Capture **Review meetup** after unchecking Amina. Include the sentence “The agent cannot approve this step,” the participant checkboxes, event, place, cost, and **Confirm meetup** control.

### Agent Activity / WebMCP screenshot

Capture the confirmed meetup immediately after the rejected bypass attempt or invite proposal: discovery and shared-state labels should be readable, with `create_group_meetup` or `send_event_invites` visible beside the shared meetup state.

### Mobile screenshot

Capture the clean Judge Mode hero at 390×844 to demonstrate responsive execution. Use it as a supporting image, not the thumbnail.
