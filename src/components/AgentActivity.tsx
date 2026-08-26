import type { ActivityEntry, CityEvent } from "../domain";
import { CheckIcon, ClockIcon, SparkIcon } from "./Icons";

interface AgentActivityProps {
  activities: ActivityEntry[];
  runtimeLabel: string;
  pendingEvent: CityEvent | null;
  isBusy: boolean;
  onConfirm: () => void;
  onDismiss: () => void;
}

const ActivityMark = ({ status }: { status: ActivityEntry["status"] }) => (
  <span className={`activity-mark activity-mark--${status}`} aria-hidden="true">
    {status === "success" ? <CheckIcon /> : status === "running" ? <ClockIcon /> : <SparkIcon />}
  </span>
);

const activityKind = (toolName: ActivityEntry["toolName"]) => {
  if (toolName === "save_event_to_plan" || toolName === "create_group_meetup" || toolName === "send_event_invites") {
    return "Shared state";
  }
  return "Discovery";
};

export const AgentActivity = ({
  activities,
  runtimeLabel,
  pendingEvent,
  isBusy,
  onConfirm,
  onDismiss
}: AgentActivityProps) => (
  <section className="activity" aria-labelledby="activity-title">
    <div className="section-heading activity__heading">
      <div>
        <h2 id="activity-title">Agent Activity</h2>
        <p>Live WebMCP calls and shared-state results.</p>
      </div>
      <span className="runtime-label">{runtimeLabel}</span>
    </div>

    {pendingEvent && (
      <div className="confirmation" role="alert" aria-live="assertive">
        <div className="confirmation__mark">
          <SparkIcon />
        </div>
        <div>
          <strong>Save {pendingEvent.name}?</strong>
          <p>
            This changes the shared Saturday plan. The agent is waiting for your approval.
          </p>
          <div className="confirmation__actions">
            <button type="button" className="button button--primary" onClick={onConfirm} disabled={isBusy}>
              Confirm &amp; save
            </button>
            <button type="button" className="button button--quiet" onClick={onDismiss} disabled={isBusy}>
              Not now
            </button>
          </div>
        </div>
      </div>
    )}

    <div className="activity__list" aria-live="polite">
      {activities.length ? (
        activities.map((entry) => (
          <article className="activity-entry" key={entry.id}>
            <ActivityMark status={entry.status} />
            <div className="activity-entry__body">
              <div>
                <strong>{entry.toolName}</strong>
                <span className={`activity-entry__kind${activityKind(entry.toolName) === "Shared state" ? " activity-entry__kind--state" : ""}`}>
                  {activityKind(entry.toolName)}
                </span>
                <time>{entry.timestamp}</time>
              </div>
              <span>{entry.summary}</span>
              <p>{entry.detail}</p>
            </div>
          </article>
        ))
      ) : (
        <div className="activity__empty">
          <SparkIcon />
          <strong>Tools are ready</strong>
          <span>Send the example prompt or call them from a WebMCP agent.</span>
        </div>
      )}
    </div>
  </section>
);
