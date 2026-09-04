import type { Lesson, Relation, VectorState } from "../visualization/vectorPlot";

export type AppMode = "guided" | "explore" | "reference";

export const COURSE_PHASES = ["orient", "notice", "predict", "manipulate", "explain", "takeaway"] as const;
export type CoursePhase = typeof COURSE_PHASES[number];

export type PredictionOption = {
  id: string;
  label: string;
  feedback: string;
  correct: boolean;
};

export type InteractionGoal =
  | { type: "preset-match"; target: VectorState; tolerance?: number }
  | { type: "angle-match"; degrees: number; tolerance?: number };

export type CourseStep = {
  id: string;
  title: string;
  lesson: Lesson;
  relation: Relation;
  notice: string;
  fieldConnection: string;
  predictionQuestion: string;
  predictions: PredictionOption[];
  tryPrompt: string;
  tryAction: string;
  preset: VectorState;
  interactionGoal: InteractionGoal;
  why: string;
  takeaway: string;
  math: string;
  trap: string;
  enrichment?: boolean;
};

export type CourseModule = {
  id: string;
  number: string;
  title: string;
  shortTitle: string;
  step: CourseStep;
};

const option = (
  id: string,
  label: string,
  feedback: string,
  correct: boolean,
): PredictionOption => ({ id, label, feedback, correct });

export const COURSE_MODULES: CourseModule[] = [
  {
    id: "read-vector",
    number: "01",
    title: "Read a vector",
    shortTitle: "Geometry",
    step: {
      id: "read-vector-345",
      title: "These three lines are one vector",
      lesson: "basics",
      relation: "tangent",
      notice: "A reported X component and Y component are perpendicular. Their resultant is the straight-line vector they create together.",
      fieldConnection: "Think of these as two signed measurements reported along defined axes, not as two separate events.",
      predictionQuestion: "If X is 3 units and Y is 4 units, will the resultant be shorter than, equal to, or longer than either component?",
      predictions: [
        option("not-longer", "Equal to or shorter than 4", "That leaves out some of the distance created by the horizontal component.", false),
        option("longer", "Longer than 4", "Yes. The resultant crosses the rectangle made by both components. Here it is 5 units.", true),
      ],
      tryPrompt: "Load the familiar 3-4-5 triangle, then trace blue X, coral Y, and green resultant on the diagram.",
      tryAction: "Load X = 3, Y = 4",
      preset: { x: 3, y: 4 },
      interactionGoal: { type: "preset-match", target: { x: 3, y: 4 } },
      why: "The two components form the legs of a right triangle. The resultant is its diagonal, so X² + Y² = R².",
      takeaway: "When a tool reports perpendicular components, the resultant is the combined magnitude, not X plus Y.",
      math: `<span class="r-text">R</span> = √(<span class="x-text">3²</span> + <span class="y-text">4²</span>) = √25 = 5`,
      trap: "Do not add 3 + 4 to get magnitude. Ordinary addition applies only when values act along the same line.",
    },
  },
  {
    id: "understand-ratio",
    number: "02",
    title: "Understand a ratio",
    shortTitle: "Ratio",
    step: {
      id: "ratio-as-steepness",
      title: "The ratio is the triangle's steepness",
      lesson: "tangent",
      relation: "tangent",
      notice: "Rise divided by run answers a plain question: how many lateral units occur for every longitudinal unit? Mathematicians call this steepness tangent.",
      fieldConnection: "Suppose a tool reports X = 10 and Y = 5. The ratio is 0.5 lateral units per longitudinal unit.",
      predictionQuestion: "If both components double to X = 20 and Y = 10, what happens to the direction?",
      predictions: [
        option("same", "The angle stays the same", "Correct. 5 ÷ 10 and 10 ÷ 20 are both 0.5, so the vectors have the same steepness.", true),
        option("changes", "The angle changes", "Both components grew by the same factor, so the triangle kept the same shape and direction.", false),
      ],
      tryPrompt: "Load X = 10 and Y = 5. Then compare the colored lines with the matching values in the live ratio.",
      tryAction: "Load the 10, 5 ratio",
      preset: { x: 10, y: 5 },
      interactionGoal: { type: "preset-match", target: { x: 10, y: 5 } },
      why: "Dividing Y by X removes the common scale and keeps the triangle’s shape. That shape determines the angle.",
      takeaway: "Tangent is not a mysterious calculator function. It is simply the signed lateral-to-longitudinal ratio on the axes shown.",
      math: `tan(θ) = <span class="y-text">Y</span> ÷ <span class="x-text">X</span> = 5 ÷ 10 = 0.500`,
      trap: "Tangent is undefined when X is zero: there is rise but no run. The vector can still have a valid direction through atan2.",
    },
  },
  {
    id: "recover-direction",
    number: "03",
    title: "Recover direction",
    shortTitle: "Inverse",
    step: {
      id: "inverse-ratio",
      title: "A ratio can point back to an angle",
      lesson: "inverse",
      relation: "tangent",
      notice: "Arctangent asks the reverse question: which principal angle creates this rise-to-run ratio?",
      fieldConnection: "This is useful when the components are known and the direction relative to the displayed axes is the unknown.",
      predictionQuestion: "A Y/X ratio of 1 means equal vertical and horizontal components. Which principal angle fits?",
      predictions: [
        option("45", "45°", "Correct. Equal legs form a 45° right triangle in the first quadrant.", true),
        option("not-45", "Another angle", "Equal horizontal and vertical components make a 45° line in the first quadrant.", false),
      ],
      tryPrompt: "Load equal components and watch the angle become 45° while the ratio becomes 1.",
      tryAction: "Load X = 6, Y = 6",
      preset: { x: 6, y: 6 },
      interactionGoal: { type: "angle-match", degrees: 45 },
      why: "Forward tangent converts an angle to a ratio. Arctangent converts that ratio back to a principal angle.",
      takeaway: "Use inverse trig to recover an angle from a known ratio. Remember that a principal result does not preserve every possible quadrant.",
      math: `atan(<span class="y-text">6</span> ÷ <span class="x-text">6</span>) = atan(1) = <span class="angle-text">45°</span>`,
      trap: "Check calculator mode. These lessons display degrees; many programming functions return radians unless converted.",
    },
  },
  {
    id: "keep-signs",
    number: "04",
    title: "Keep the signs",
    shortTitle: "atan2",
    step: {
      id: "quadrant-signs",
      title: "The signs show which way it points",
      lesson: "quadrants",
      relation: "tangent",
      notice: "Dividing two negative components produces a positive ratio. The division has erased the two signs that identified the original direction.",
      fieldConnection: "When signed X and Y components are available, atan2(Y, X) retains both signs and locates the vector on the displayed coordinate plane.",
      predictionQuestion: "Do vectors (10, 5) and (−10, −5) have the same direction because both have a Y/X ratio of 0.5?",
      predictions: [
        option("yes", "Yes, the ratio matches", "The steepness matches, but the signs show that the vectors point in opposite directions.", false),
        option("no", "No, they point opposite ways", "Correct. atan2 separates the two directions by 180° because it keeps both signs.", true),
      ],
      tryPrompt: "Load the negative pair. Compare the simple atan result with the signed direction from atan2.",
      tryAction: "Load X = −10, Y = −5",
      preset: { x: -10, y: -5 },
      interactionGoal: { type: "preset-match", target: { x: -10, y: -5 } },
      why: "atan sees only the quotient 0.5. atan2 receives Y and X separately, so it knows both are negative and points the vector lower left, in Quadrant III.",
      takeaway: "For direction from signed components, prefer atan2(Y, X) and document the coordinate convention used.",
      math: `atan(−5 ÷ −10) = 26.6° · atan2(−5, −10) = <span class="angle-text">206.6°</span>`,
      trap: "Do not assume a mathematical 206.6° is automatically a system-specific PDOF, force direction, damage direction, or vehicle heading.",
    },
  },
  {
    id: "component-share",
    number: "05",
    title: "Understand component share",
    shortTitle: "Sine & cosine",
    step: {
      id: "share-of-resultant",
      title: "Each component is a share of the whole",
      lesson: "sine",
      relation: "sine",
      notice: "Vertical share is Y divided by the resultant; mathematicians call it sine. Horizontal share is X divided by the resultant; mathematicians call it cosine.",
      fieldConnection: "These relationships let you move between a known resultant-and-direction description and its axis components.",
      predictionQuestion: "For X = 6, Y = 8, R = 10, what fraction of the resultant lies vertically?",
      predictions: [
        option("point-eight", "0.8", "Correct. Y/R = 8/10, so 80% of the vector’s length projects vertically.", true),
        option("point-six", "0.6", "That is the horizontal share: X/R = 6/10. The vertical share is 8/10.", false),
      ],
      tryPrompt: "Load the 6-8-10 triangle and compare the blue and coral shares of the green resultant.",
      tryAction: "Load X = 6, Y = 8",
      preset: { x: 6, y: 8 },
      interactionGoal: { type: "preset-match", target: { x: 6, y: 8 } },
      why: "Dividing a component by the resultant expresses that component as a signed portion of the whole vector.",
      takeaway: "Sine and cosine are component-share tools. Their signs still depend on the axes and quadrant shown.",
      math: `sin(θ) = <span class="y-text">8</span> ÷ <span class="r-text">10</span> = 0.8 · cos(θ) = <span class="x-text">6</span> ÷ <span class="r-text">10</span> = 0.6`,
      trap: "Arcsine and arccosine return limited principal ranges. They cannot independently reconstruct every possible direction.",
    },
  },
  {
    id: "unit-circle",
    number: "06",
    title: "Why sine and cosine exist",
    shortTitle: "Unit circle",
    step: {
      id: "radius-one",
      title: "With a radius of 1, coordinates become ratios",
      lesson: "unit-circle",
      relation: "sine",
      notice: "On a circle with radius 1, dividing X or Y by the resultant changes nothing. The endpoint coordinates are cosine and sine.",
      fieldConnection: "You do not need the unit circle for routine component work, but it explains why sine and cosine repeat predictably as direction rotates.",
      predictionQuestion: "At 90° on the unit circle, which coordinate equals 1?",
      predictions: [
        option("x", "X (cosine)", "At 90°, there is no horizontal reach, so X and cosine are zero.", false),
        option("y", "Y (sine)", "Correct. The point is directly above the origin at (0, 1).", true),
      ],
      tryPrompt: "Rotate the radius to 90° and watch X become 0 while Y becomes 1.",
      tryAction: "Set the angle to 90°",
      preset: { x: 0, y: 1 },
      interactionGoal: { type: "angle-match", degrees: 90 },
      why: "With R fixed at 1, X/R = X and Y/R = Y. The component-share ratios become coordinates.",
      takeaway: "The unit circle is the geometric source of sine and cosine, not an extra procedure you must memorize for every investigation.",
      math: `at 90°: x = cos(90°) = 0 · y = sin(90°) = 1`,
      trap: "At 90° and 270°, tangent is undefined because the horizontal coordinate is zero.",
      enrichment: true,
    },
  },
  {
    id: "field-application",
    number: "07",
    title: "Apply the geometry",
    shortTitle: "Delta-V",
    step: {
      id: "delta-v-application",
      title: "The signs place the vector first",
      lesson: "delta-v",
      relation: "tangent",
      notice: "Suppose a tool reports signed components ΔVx = −18 and ΔVy = 7. The same triangle gives a resultant magnitude and a direction relative to the axes shown.",
      fieldConnection: "The calculation is generic vector mathematics. Its interpretation depends on the reporting system’s documented axes, signs, and direction convention.",
      predictionQuestion: "Before calculating, where must the vector appear on this mathematical display?",
      predictions: [
        option("q2", "Quadrant II: −X, +Y", "Correct. Negative X points left and positive Y points up on the displayed axes.", true),
        option("not-q2", "A different quadrant", "The signs settle this before any calculation: negative X points left and positive Y points up.", false),
      ],
      tryPrompt: "Load the signed components. Confirm the quadrant first, then read the resultant and atan2 direction.",
      tryAction: "Load ΔVx = −18, ΔVy = 7",
      preset: { x: -18, y: 7 },
      interactionGoal: { type: "preset-match", target: { x: -18, y: 7 } },
      why: "Magnitude combines the perpendicular distances without signs. atan2 uses both signs to place the direction in quadrant II.",
      takeaway: "Calculate only after confirming the source convention. Record the convention with the result; never silently translate it into PDOF.",
      math: `<span class="r-text">R</span> = √(−18² + 7²) = 19.31 · atan2(7, −18) = <span class="angle-text">158.7°</span>`,
      trap: "Delta-V direction, PDOF, force direction, damage direction, and vehicle heading are related concepts but are not interchangeable labels.",
    },
  },
];

export const GUIDED_DEFINITIONS: Record<string, readonly string[]> = {
  "read-vector-345": ["Component", "Resultant", "Vector"],
  "ratio-as-steepness": ["Ratio", "Vector"],
  "inverse-ratio": ["Ratio", "Inverse function"],
  "quadrant-signs": ["Quadrant", "Inverse function"],
  "share-of-resultant": ["Component", "Resultant", "Ratio"],
  "radius-one": ["Vector", "Component", "Ratio"],
  "delta-v-application": ["Delta-V", "PDOF", "Component", "Resultant"],
};

export const COURSE_STEP_IDS = COURSE_MODULES.map((module) => module.step.id);

export const moduleIndexForStep = (stepId: string): number => {
  const index = COURSE_MODULES.findIndex((module) => module.step.id === stepId);
  return index < 0 ? 0 : index;
};

export const courseNavigationMarkup = (
  activeIndex: number,
  phaseIndex: number,
  completedStepIds: readonly string[],
): string => `
  <section class="guided-progress" aria-label="Course progress">
    <div class="guided-progress-copy">
      <strong>Module ${activeIndex + 1} of ${COURSE_MODULES.length}</strong>
      <span>${COURSE_MODULES[activeIndex].title}${COURSE_MODULES[activeIndex].step.enrichment ? " · Optional" : ""}</span>
    </div>
    <ol aria-label="Module steps">
      ${COURSE_PHASES.map((phase, index) => `<li data-state="${index < phaseIndex ? "complete" : index === phaseIndex ? "current" : "upcoming"}"${index === phaseIndex ? ' aria-current="step"' : ""}><span class="sr-only">${phase}</span></li>`).join("")}
    </ol>
    <span class="guided-step-count">Step ${phaseIndex + 1} of ${COURSE_PHASES.length}</span>
    <span class="sr-only">${completedStepIds.length} of ${COURSE_MODULES.length} modules complete</span>
  </section>
`;

const phaseTitle = (phase: CoursePhase, activeIndex: number): string => {
  const step = COURSE_MODULES[activeIndex].step;
  if (phase === "orient") return COURSE_MODULES[activeIndex].title;
  if (phase === "notice") return step.title;
  if (phase === "predict") return "Make a quick prediction";
  if (phase === "manipulate") return "Put it on the diagram";
  if (phase === "explain") return "Why it works";
  return "Take this with you";
};

const phaseBody = (
  phase: CoursePhase,
  activeIndex: number,
  selectedPredictionId: string | null,
  goalMet: boolean,
): string => {
  const step = COURSE_MODULES[activeIndex].step;
  const selected = step.predictions.find((prediction) => prediction.id === selectedPredictionId);
  if (phase === "orient") return `<p class="guided-lead">${step.fieldConnection}</p><p class="guided-direction">First, we will look at one relationship on the diagram.</p>`;
  if (phase === "notice") return `<p class="guided-lead">${step.notice}</p><p class="guided-direction"><span aria-hidden="true">◉</span> Look at the colored lines and their direct labels.</p>`;
  if (phase === "predict") {
    if (selected) return `<div class="prediction-feedback ${selected.correct ? "is-correct" : "is-rethink"}" role="status"><strong>${selected.correct ? "That fits the picture." : "Take another look."}</strong><p>${selected.feedback}</p>${selected.correct ? "" : '<small>This is practice, not a score.</small><button type="button" data-action="retry-prediction">Try again</button>'}</div>`;
    return `<fieldset class="guided-prediction"><legend>${step.predictionQuestion}</legend><div>${step.predictions.map((prediction) => `<button type="button" data-prediction="${prediction.id}">${prediction.label}</button>`).join("")}</div></fieldset>`;
  }
  if (phase === "manipulate") return `<p class="guided-lead">${step.tryPrompt}</p><p class="goal-status ${goalMet ? "is-met" : ""}" role="status"><span>${goalMet ? "✓" : "○"}</span>${goalMet ? "The target relationship is now on the diagram." : "Use the green action below. Then trace the changed lines."}</p>`;
  if (phase === "explain") return `<p class="guided-lead">${step.why}</p><details class="show-math"><summary>Show the math</summary><p class="live-equation">${step.math}</p></details>`;
  return `<div class="investigator-takeaway"><small>Investigator takeaway</small><strong>${step.takeaway}</strong></div><aside class="common-trap"><strong>Common trap</strong><p>${step.trap}</p></aside>`;
};

export const courseStepMarkup = (
  activeIndex: number,
  phaseIndex: number,
  selectedPredictionId: string | null,
  goalMet: boolean,
): string => {
  const module = COURSE_MODULES[activeIndex];
  const step = module.step;
  const phase = COURSE_PHASES[phaseIndex];
  const selected = step.predictions.find((prediction) => prediction.id === selectedPredictionId);
  const isLast = activeIndex === COURSE_MODULES.length - 1;
  const isFirst = activeIndex === 0 && phaseIndex === 0;
  const continueReady = phase !== "predict" || selected !== undefined;
  const interactionReady = phase !== "manipulate" || goalMet;
  const primaryAction = phase === "manipulate" && !goalMet ? "course-preset" : "course-next";
  const primaryLabel = phase === "orient"
    ? "Begin module"
    : phase === "notice"
      ? "I see it · Continue"
      : phase === "manipulate" && !goalMet
        ? step.tryAction
        : phase === "takeaway"
          ? isLast ? "Finish course" : "Next module"
          : "Continue";
  return `
    <section class="course-step guided-phase-${phase}" aria-labelledby="course-step-title">
      <div class="guided-instruction">
        <h1 id="course-step-title">${phaseTitle(phase, activeIndex)}</h1>
        ${phaseBody(phase, activeIndex, selectedPredictionId, goalMet)}
      </div>
      <footer class="course-step-actions">
        <button class="course-back" type="button" data-action="course-previous" ${isFirst ? "disabled" : ""}><span aria-hidden="true">←</span> Back</button>
        <p>${phase === "predict" && !selected ? "Choose one answer." : phase === "manipulate" && !goalMet ? "Make the change on the diagram." : `${phaseIndex + 1} of ${COURSE_PHASES.length}`}</p>
        ${(continueReady && interactionReady) || primaryAction === "course-preset" ? `<button type="button" class="course-next" data-action="${primaryAction}">${primaryLabel}<span aria-hidden="true"> →</span></button>` : ""}
      </footer>
    </section>
  `;
};
