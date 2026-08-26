import type { CSSProperties } from "react";
import type { CityEvent } from "../domain";
import { PinIcon } from "./Icons";

interface CityMapProps {
  events: CityEvent[];
  visibleEventIds: string[];
  selectedEventId: string;
  onSelect: (eventId: string) => void;
}

export const CityMap = ({
  events,
  visibleEventIds,
  selectedEventId,
  onSelect
}: CityMapProps) => (
  <div className="city-map" aria-label="Seeded New York event map">
    <img
      className="city-map__image"
      src="/city-atlas.png"
      alt=""
      aria-hidden="true"
    />
    <div className="city-map__shade" aria-hidden="true" />
    {events.map((event) => {
      const isSelected = event.id === selectedEventId;
      const isVisible = visibleEventIds.includes(event.id);
      const markerStyle = {
        "--marker-x": `${event.mapPosition.x}%`,
        "--marker-y": `${event.mapPosition.y}%`
      } as CSSProperties;

      return (
        <button
          key={event.id}
          type="button"
          className={`map-marker${isSelected ? " map-marker--selected" : ""}${
            isVisible ? "" : " map-marker--dimmed"
          }`}
          style={markerStyle}
          onClick={() => onSelect(event.id)}
          aria-pressed={isSelected}
          aria-label={`Select ${event.name}`}
        >
          <span className="map-marker__pin">
            <PinIcon />
          </span>
          <span className="map-marker__label">{event.name}</span>
        </button>
      );
    })}
  </div>
);
