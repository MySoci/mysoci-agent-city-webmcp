import type { CityEvent } from "../domain";
import { PinIcon, TrashIcon } from "./Icons";

interface SaturdayPlanProps {
  events: CityEvent[];
  onRemove: (eventId: string) => void;
}

export const SaturdayPlan = ({ events, onRemove }: SaturdayPlanProps) => (
  <section className="plan" id="plan" aria-labelledby="plan-title">
    <div className="section-heading">
      <div>
        <h2 id="plan-title">Saturday plan</h2>
        <p>Shared state for you and your agent.</p>
      </div>
      <span className="section-count">{events.length}</span>
    </div>
    {events.length ? (
      <div className="plan__timeline">
        {events.map((event) => (
          <article className="plan-item" key={event.id}>
            <time>{event.time}</time>
            <span className="plan-item__dot" aria-hidden="true" />
            <div>
              <strong>{event.name}</strong>
              <span>
                {event.venue}, {event.neighborhood}
              </span>
              <b>${event.price}</b>
            </div>
            <button type="button" onClick={() => onRemove(event.id)}>
              <TrashIcon />
              Remove
            </button>
          </article>
        ))}
      </div>
    ) : (
      <div className="plan__empty">
        <PinIcon />
        <span>Run the example to start a shared Saturday plan.</span>
      </div>
    )}
  </section>
);
