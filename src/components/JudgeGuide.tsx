import { CheckIcon, ShieldIcon, SparkIcon } from "./Icons";

export type JudgePhase = "discover" | "review" | "approve";

interface JudgeGuideProps {
  phase: JudgePhase;
}

const steps: Array<{ id: JudgePhase; title: string; detail: string }> = [
  { id: "discover", title: "Discover", detail: "Events + friends" },
  { id: "review", title: "Review", detail: "Edit group" },
  { id: "approve", title: "Approve", detail: "You approve" }
];

export const JudgeGuide = ({ phase }: JudgeGuideProps) => {
  const activeIndex = steps.findIndex((step) => step.id === phase);

  return (
    <section className="judge-guide" aria-label="Judge Mode flow">
      <div className="judge-guide__heading">
        <div>
          <span>Judge Mode</span>
          <small>One shared flow from discovery to approval</small>
        </div>
        <span className="judge-guide__status"><ShieldIcon /> Native tools + human control</span>
      </div>
      <ol className="judge-guide__steps">
        {steps.map((step, index) => {
          const isComplete = index < activeIndex;
          const isActive = index === activeIndex;
          return (
            <li className={`judge-guide__step${isActive ? " judge-guide__step--active" : ""}${isComplete ? " judge-guide__step--complete" : ""}`} key={step.id}>
              <span className="judge-guide__step-mark">{isComplete ? <CheckIcon /> : index + 1}</span>
              <span>
                <strong>{step.title}</strong>
                <small>{step.detail}</small>
              </span>
            </li>
          );
        })}
      </ol>
      <div className="judge-explainer">
        <SparkIcon />
        <p><strong>Native WebMCP</strong> tools operate on the same visible application state as the human — no brittle browser automation.</p>
      </div>
    </section>
  );
};
