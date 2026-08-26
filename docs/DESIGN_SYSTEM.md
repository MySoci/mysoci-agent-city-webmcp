# Challenge slice design system

The accepted design references are [`concept-desktop.png`](./design/concept-desktop.png) and [`concept-mobile.png`](./design/concept-mobile.png).

## Direction

- Theme: a calm nocturnal city atlas, not a technical dashboard.
- Background: deep ink (`#06111f`) with slate surfaces and thin cool borders.
- Accent: electric lilac for selection and agent actions; soft mint for successful execution.
- Typography: editorial, high-contrast sans serif for headings; deliberate 13–15 px control text.
- Containers: one map canvas, open event rows, a right activity rail, and a plan timeline. Avoid nested cards and bento grids.
- Radius: 14–18 px for primary surfaces; smaller controls use 10–12 px.
- Motion: restrained activity pulses and selection transitions; disabled under `prefers-reduced-motion`.
- Social layer: compact people/place rows below the event list; fictional avatars use one local 2×2 sprite sheet, with lilac relationship labels and mint availability dots.

## Visible-copy lock

The first viewport may show: “MySoci Agent City”, “A MySoci prototype”, “Discover”, “Plan”, “About”, “Judge Mode”, “New York, this Saturday”, “Discover the city together.”, the three seeded event names, “People + places for this plan”, “Privacy-aware”, “People to ask”, “Good places to meet”, “Agent Activity”, “Saturday plan”, the social action labels, the example prompt, “Send”, and confirmation/undo controls required by the workflow.

## Responsive behavior

- Desktop: discovery canvas and activity rail share the viewport.
- Mobile: map, selected event, social discovery, plan, activity, then prompt composer stack vertically.
- Minimum touch target: 44 px.
- No horizontal scrolling at 390–430 px.
