import type { SocialProfile, SocialRelationship } from "../domain";

export const YOU_PROFILE_ID = "you";

export const SEEDED_PEOPLE: SocialProfile[] = [
  {
    id: "leo-ortiz",
    name: "Leo Ortiz",
    handle: "@leoafter",
    bio: "Sound designer building gentle futures after dark.",
    interests: ["ai", "electronic-music", "design"],
    avatarIndex: 0,
    availability: "available",
    presence: { visibility: "nearby", city: "New York", coarseArea: "Brooklyn Navy Yard" }
  },
  {
    id: "maya-chen",
    name: "Maya Chen",
    handle: "@mayaframe",
    bio: "Street photographer collecting small city rituals.",
    interests: ["photography", "ai", "film"],
    avatarIndex: 1,
    availability: "available",
    presence: { visibility: "nearby", city: "New York", coarseArea: "Meatpacking District" }
  },
  {
    id: "amina-bello",
    name: "Amina Bello",
    handle: "@aminacircuit",
    bio: "Producer, listener, and curious café cartographer.",
    interests: ["electronic-music", "photography", "coffee"],
    avatarIndex: 2,
    availability: "available",
    presence: { visibility: "city-only", city: "New York" }
  },
  {
    id: "theo-park",
    name: "Theo Park",
    handle: "@theoquiet",
    bio: "Quiet systems thinker with a soft spot for analog film.",
    interests: ["ai", "photography", "design"],
    avatarIndex: 3,
    availability: "available",
    presence: { visibility: "hidden", city: "New York" }
  },
  {
    id: "ren-ito",
    name: "Ren Ito",
    handle: "@renlistens",
    bio: "Radio host mapping the city by sound.",
    interests: ["electronic-music", "film"],
    avatarIndex: 0,
    availability: "busy",
    presence: { visibility: "nearby", city: "New York", coarseArea: "East Village" }
  }
];

export const SEEDED_RELATIONSHIPS: SocialRelationship[] = [
  { profileId: "leo-ortiz", kind: "friend" },
  { profileId: "maya-chen", kind: "friend" },
  { profileId: "amina-bello", kind: "friend" },
  { profileId: "theo-park", kind: "friend" },
  { profileId: "ren-ito", kind: "connection" }
];
