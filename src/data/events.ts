import type { CityEvent } from "../domain";

export const SEEDED_EVENTS: CityEvent[] = [
  {
    id: "neural-nights",
    name: "Neural Nights",
    summary: "AI art and electronic music showcase",
    day: "saturday",
    dateLabel: "Sat, Aug 29",
    time: "8:30 PM",
    price: 45,
    venue: "Signal Hall",
    neighborhood: "Brooklyn Navy Yard",
    interests: ["ai", "electronic-music"],
    mapPosition: { x: 54, y: 26 }
  },
  {
    id: "framewalk-nyc",
    name: "Framewalk NYC",
    summary: "Golden-hour street photography walk",
    day: "saturday",
    dateLabel: "Sat, Aug 29",
    time: "4:00 PM",
    price: 35,
    venue: "Cornerroom Studio",
    neighborhood: "Meatpacking District",
    interests: ["photography"],
    mapPosition: { x: 27, y: 51 }
  },
  {
    id: "afterlight-radio",
    name: "Afterlight Radio",
    summary: "Live radio and listening-room session",
    day: "saturday",
    dateLabel: "Sat, Aug 29",
    time: "10:00 PM",
    price: 20,
    venue: "Afterlight Room",
    neighborhood: "East Village",
    interests: ["electronic-music"],
    mapPosition: { x: 69, y: 68 }
  }
];
