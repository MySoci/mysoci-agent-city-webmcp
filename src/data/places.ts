import type { MeetupPlace } from "../domain";

export const SEEDED_PLACES: MeetupPlace[] = [
  {
    id: "signal-garden",
    name: "Signal Garden",
    type: "lounge",
    summary: "Low-key drinks and a quiet table before the show.",
    city: "New York",
    neighborhood: "Brooklyn Navy Yard",
    interests: ["ai", "electronic-music", "design"],
    atmosphere: "Warm, low-lit, easy to find each other",
    mapPosition: { x: 57, y: 39 }
  },
  {
    id: "cornerroom-cafe",
    name: "Cornerroom Café",
    type: "cafe",
    summary: "Bright coffee, shared tables, and a soft landing for a photo walk.",
    city: "New York",
    neighborhood: "Meatpacking District",
    interests: ["photography", "film", "coffee"],
    atmosphere: "Daylight, roomy, good for a first hello",
    mapPosition: { x: 24, y: 63 }
  },
  {
    id: "lantern-commons",
    name: "Lantern Commons",
    type: "cafe",
    summary: "A calm corner for comparing notes after the city gets loud.",
    city: "New York",
    neighborhood: "East Village",
    interests: ["electronic-music", "film", "coffee"],
    atmosphere: "Unhurried, conversational, open late",
    mapPosition: { x: 72, y: 62 }
  },
  {
    id: "northline-studio",
    name: "Northline Studio",
    type: "studio",
    summary: "A small creative room for a focused meetup or listening session.",
    city: "New York",
    neighborhood: "Williamsburg",
    interests: ["ai", "design", "photography"],
    atmosphere: "Creative, bright, intentionally small",
    mapPosition: { x: 65, y: 22 }
  }
];
