import type { CityEvent } from "../domain";
import { ArrowIcon, CalendarIcon, PinIcon } from "./Icons";

interface EventListProps {
  events: CityEvent[];
  visibleEventIds: string[];
  selectedEventId: string;
  onSelect: (eventId: string) => void;
}

export const EventList = ({
  events,
  visibleEventIds,
  selectedEventId,
  onSelect
}: EventListProps) => (
  <div className="event-list" aria-label="Seeded event results">
    {events.map((event) => {
      const selected = event.id === selectedEventId;
      const visible = visibleEventIds.includes(event.id);
      return (
        <button
          className={`event-row${selected ? " event-row--selected" : ""}${
            visible ? "" : " event-row--filtered"
          }`}
          type="button"
          key={event.id}
          onClick={() => onSelect(event.id)}
          aria-pressed={selected}
        >
          <span className="event-row__selector" aria-hidden="true" />
          <span className="event-row__identity">
            <PinIcon />
            <span>
              <strong>{event.name}</strong>
              <small>{event.summary}</small>
            </span>
          </span>
          <span className="event-row__meta">
            <CalendarIcon />
            <span>
              <small>{event.dateLabel}</small>
              <span>{event.time}</span>
            </span>
          </span>
          <span className="event-row__venue">
            <PinIcon />
            <span>
              <small>{event.venue}</small>
              <span>{event.neighborhood}</span>
            </span>
          </span>
          <strong className="event-row__price">${event.price}</strong>
          <ArrowIcon className="event-row__arrow" />
        </button>
      );
    })}
  </div>
);
