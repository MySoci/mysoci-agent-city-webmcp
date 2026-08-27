import type { KeyboardEvent, RefObject } from "react";
import { ArrowIcon } from "./Icons";

interface AboutDialogProps {
  dialogRef: RefObject<HTMLDialogElement | null>;
}

// Keep sequential focus in the dialog rather than allowing Chromium to tab to
// browser chrome. Native showModal still owns inertness, Escape and focus return.
function containTab(event: KeyboardEvent<HTMLDialogElement>) {
  if (event.key !== "Tab" || event.altKey || event.ctrlKey || event.metaKey || !event.currentTarget.open) return;
  const controls = event.currentTarget.querySelectorAll<HTMLButtonElement | HTMLAnchorElement>("button:not([disabled]), a[href]");
  const first = controls[0];
  const last = controls[controls.length - 1];
  const active = event.currentTarget.ownerDocument.activeElement;
  if (first && last && ((event.shiftKey && active === first) || (!event.shiftKey && active === last))) {
    event.preventDefault();
    (event.shiftKey ? last : first).focus();
  }
}

// This informational surface never touches the city store.
export function AboutDialog({ dialogRef }: AboutDialogProps) {
  return (
    <dialog
      ref={dialogRef}
      id="about-dialog"
      className="about-dialog"
      aria-labelledby="about-title"
      aria-describedby="about-tagline"
      onKeyDown={containTab}
    >
      <div className="about-dialog__topline">
        <span>A WebMCP prototype for MySoci’s future agent layer</span>
        <button type="button" className="about-dialog__close" autoFocus onClick={() => dialogRef.current?.close()}>
          Close
        </button>
      </div>
      <div className="about-dialog__identity">
        <img src="/favicon.svg" width="44" height="44" alt="" />
        <div>
          <h2 id="about-title">MySoci Agent City</h2>
          <p id="about-tagline">An agent-native social city powered by WebMCP</p>
        </div>
      </div>
      <div className="about-dialog__sections">
        <section aria-labelledby="about-what">
          <h3 id="about-what">What is it?</h3>
          <p>This standalone challenge prototype explores capabilities designed to inform a future agent layer in the broader MySoci product. It is not the full MySoci product.</p>
        </section>
        <section aria-labelledby="about-webmcp">
          <h3 id="about-webmcp">Why WebMCP?</h3>
          <p>Native structured tools discover people, events and places using the same visible state as the human — without brittle browser automation.</p>
        </section>
        <section aria-labelledby="about-control">
          <h3 id="about-control">Human stays in control</h3>
          <p>The agent proposes. Privacy-aware presence and explicit human approval protect meetup creation and fictional invitations. You can edit, cancel or reset.</p>
        </section>
        <section aria-labelledby="about-vision">
          <h3 id="about-vision">The bigger MySoci vision</h3>
          <p>MySoci’s broader vision connects social discovery, digital cities and real-world experiences. Here, people and AI agents can already plan together using deterministic challenge data.</p>
        </section>
      </div>
      <div className="about-dialog__footer">
        <a href="https://github.com/MySoci/mysoci-agent-city-webmcp" target="_blank" rel="noopener noreferrer">
          Explore the challenge source <ArrowIcon />
          <span className="sr-only"> (opens in a new tab)</span>
        </a>
        <p>Fictional data. No login. No real messages.</p>
      </div>
    </dialog>
  );
}
