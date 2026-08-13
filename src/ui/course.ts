import type { Lesson, Relation, VectorState } from "../visualization/vectorPlot";

export type AppMode = "guided" | "explore" | "reference";

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
      title: "Three measurements, one geometry",
      lesson: "basics",
      relation: "tangent",
      notice: "A reported X component and Y component are perpendicular. Their resultant is the straight-line vector they create together.",
      fieldConnection: "Think of these as two signed measurements reported along defined axes—not as two separate events.",
      predictionQuestion: "If X is 3 units and Y is 4 units, will the resultant be shorter than, equal to, or longer than either component?",
      predictions: [
        option("shorter", "Shorter than both", "A resultant spans both perpendicular components, so it cannot be shorter than the larger component.", false),
        option("equal", "Equal to the larger one", "That would ignore the distance contributed by the other component.", false),
        option("longer", "Longer than either", "Exactly. The resultant crosses the rectangle formed by both components; here it is 5 units.", true),
      ],
      tryPrompt: "Load the familiar 3–4–5 triangle, then trace blue X, coral Y, and green resultant on the diagram.",
      tryAction: "Load X = 3, Y = 4",
      preset: { x: 3, y: 4 },
      interactionGoal: { type: "preset-match", target: { x: 3, y: 4 } },
      why: "The two components form the legs of a right triangle. The resultant is its diagonal, so X² + Y² = R².",
      takeaway: "When a tool reports perpendicular components, the resultant is the combined magnitude—not X plus Y.",
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
      title: "A ratio describes direction without size",
      lesson: "tangent",
      relation: "tangent",
      notice: "Rise divided by run answers a plain question: how many lateral units occur for every longitudinal unit? Mathematicians call this steepness tangent.",
      fieldConnection: "Suppose a tool reports X = 10 and Y = 5. The ratio is 0.5 lateral units per longitudinal unit.",
      predictionQuestion: "If both components double to X = 20 and Y = 10, what happens to the direction?",
      predictions: [
        option("double", "The angle doubles", "Both parts grew by the same factor, so the shape did not change.", false),
        option("same", "The angle stays the same", "Correct. 5 ÷ 10 and 10 ÷ 20 are both 0.5, so the vectors have the same steepness.", true),
        option("half", "The angle is cut in half", "Scaling both components changes length, not the component ratio.", false),
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
      title: "Run the ratio question backward",
      lesson: "inverse",
      relation: "tangent",
      notice: "Arctangent asks the reverse question: which principal angle creates this rise-to-run ratio?",
      fieldConnection: "This is useful when the components are known and the direction relative to the displayed axes is the unknown.",
      predictionQuestion: "A Y/X ratio of 1 means equal vertical and horizontal components. Which principal angle fits?",
      predictions: [
        option("30", "30°", "At 30°, the vertical share is smaller than the horizontal share.", false),
        option("45", "45°", "Correct. Equal legs form a 45° right triangle in the first quadrant.", true),
        option("90", "90°", "At 90°, X is zero and Y/X is undefined rather than 1.", false),
      ],
      tryPrompt: "Load equal components and watch the angle become 45° while the ratio becomes 1.",
      tryAction: "Load X = 6, Y = 6",
      preset: { x: 6, y: 6 },
      interactionGoal: { type: "angle-match", degrees: 45 },
      why: "Forward tangent converts an angle to a ratio. Arctangent converts that ratio back to a principal angle.",
      takeaway: "Use inverse trig to recover an angle from a known ratio—but remember that a principal result does not preserve every possible quadrant.",
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
      title: "The ratio alone loses the quadrant",
      lesson: "quadrants",
      relation: "tangent",
      notice: "Dividing two negative components produces a positive ratio. The division has erased the two signs that identified the original direction.",
      fieldConnection: "When signed X and Y components are available, atan2(Y, X) retains both signs and locates the vector on the displayed coordinate plane.",
      predictionQuestion: "Do vectors (10, 5) and (−10, −5) have the same direction because both have a Y/X ratio of 0.5?",
      predictions: [
        option("yes", "Yes—the ratio matches", "The steepness matches, but the signs place the vectors in opposite quadrants.", false),
        option("no", "No—they point opposite ways", "Correct. atan2 separates the two directions by 180° because it keeps both signs.", true),
      ],
      tryPrompt: "Load the negative pair. Compare the simple atan result with the quadrant-aware atan2 result.",
      tryAction: "Load X = −10, Y = −5",
      preset: { x: -10, y: -5 },
      interactionGoal: { type: "preset-match", target: { x: -10, y: -5 } },
      why: "atan sees only the quotient 0.5. atan2 receives Y and X separately, so it knows both are negative and selects quadrant III.",
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
        option("point-six", "0.6", "That is the horizontal share: X/R = 6/10.", false),
        option("point-eight", "0.8", "Correct. Y/R = 8/10, so 80% of the vector’s length projects vertically.", true),
        option("one-four", "1.4", "A component-to-resultant share cannot exceed 1 in magnitude.", false),
      ],
      tryPrompt: "Load the 6–8–10 triangle and compare the blue and coral shares of the green resultant.",
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
      title: "Optional enrichment: set the whole to one",
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
      title: "From signed components to a resultant",
      lesson: "delta-v",
      relation: "tangent",
      notice: "Suppose a tool reports signed components ΔVx = −18 and ΔVy = 7. The same triangle gives a resultant magnitude and a direction relative to the axes shown.",
      fieldConnection: "The calculation is generic vector mathematics. Its interpretation depends on the reporting system’s documented axes, signs, and direction convention.",
      predictionQuestion: "Before calculating, where must the vector appear on this mathematical display?",
      predictions: [
        option("q1", "Quadrant I: +X, +Y", "X is negative, so the vector cannot point toward +X.", false),
        option("q2", "Quadrant II: −X, +Y", "Correct. Negative X points left and positive Y points up on the displayed axes.", true),
        option("q3", "Quadrant III: −X, −Y", "Y is positive, so the vector must appear above the X-axis.", false),
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
  completedStepIds: readonly string[],
): string => `
  <nav class="course-nav" aria-label="Guided course modules">
    <div class="course-nav-heading"><span>Guided course</span><strong>${completedStepIds.length} of ${COURSE_MODULES.length} complete</strong></div>
    <div class="course-module-list">
      ${COURSE_MODULES.map((module, index) => {
        const complete = completedStepIds.includes(module.step.id);
        const state = index === activeIndex ? "current" : complete ? "complete" : "upcoming";
        return `<button type="button" data-course-module="${index}" data-state="${state}" aria-current="${index === activeIndex ? "step" : "false"}"><span>${complete ? "✓" : module.number}</span><b>${module.title}</b>${module.step.enrichment ? "<em>Optional</em>" : ""}</button>`;
      }).join("")}
    </div>
  </nav>
`;

export const courseStepMarkup = (
  activeIndex: number,
  selectedPredictionId: string | null,
  goalMet: boolean,
  completedStepIds: readonly string[],
): string => {
  const module = COURSE_MODULES[activeIndex];
  const step = module.step;
  const selected = step.predictions.find((prediction) => prediction.id === selectedPredictionId);
  const canContinue = selected !== undefined && goalMet;
  const isLast = activeIndex === COURSE_MODULES.length - 1;
  return `
    <section class="course-step" aria-labelledby="course-step-title">
      <header class="course-step-header">
        <div><p class="card-kicker">Module ${module.number} of ${COURSE_MODULES.length}${step.enrichment ? " · optional enrichment" : ""}</p><h2 id="course-step-title">${step.title}</h2></div>
        <span class="course-complete-mark" aria-label="${completedStepIds.includes(step.id) ? "Completed" : "Not completed"}">${completedStepIds.includes(step.id) ? "✓ Complete" : "In progress"}</span>
      </header>

      <div class="course-notice"><small>What to notice</small><p>${step.notice}</p><div class="field-connection"><strong>Investigator context</strong>${step.fieldConnection}</div></div>

      <fieldset class="prediction-card">
        <legend><span>1</span> Predict before revealing</legend>
        <p>${step.predictionQuestion}</p>
        <div class="prediction-options">
          ${step.predictions.map((prediction) => `<button type="button" data-prediction="${prediction.id}" aria-pressed="${prediction.id === selectedPredictionId}">${prediction.label}</button>`).join("")}
        </div>
        ${selected ? `<div class="prediction-feedback ${selected.correct ? "is-correct" : "is-rethink"}" role="status"><strong>${selected.correct ? "That fits the geometry." : "Take another look."}</strong><p>${selected.feedback}</p>${selected.correct ? "" : "<small>This is practice, not a score. You may retry or continue after the Try it step.</small>"}</div>` : ""}
      </fieldset>

      <section class="try-card" aria-labelledby="try-title">
        <div class="course-section-title"><span>2</span><div><h3 id="try-title">Try it on the diagram</h3><p>${step.tryPrompt}</p></div></div>
        <button type="button" class="try-action" data-action="course-preset">${step.tryAction}</button>
        <p class="goal-status ${goalMet ? "is-met" : ""}" role="status"><span>${goalMet ? "✓" : "○"}</span>${goalMet ? "The diagram now shows the target relationship." : "Use the preset or manipulate the vector to reach the target."}</p>
      </section>

      ${selected ? `
        <section class="why-card" aria-labelledby="why-title">
          <div class="course-section-title"><span>3</span><div><h3 id="why-title">Why it works</h3><p>${step.why}</p></div></div>
          <div class="investigator-takeaway"><small>Investigator takeaway</small><strong>${step.takeaway}</strong></div>
          <details class="show-math"><summary>Show the math</summary><p class="live-equation">${step.math}</p></details>
          <aside class="common-trap"><strong>Common trap</strong><p>${step.trap}</p></aside>
        </section>
      ` : ""}

      <footer class="course-step-actions">
        <button type="button" data-action="course-previous" ${activeIndex === 0 ? "disabled" : ""}>← Previous</button>
        <p>${!selected ? "Make a prediction to reveal the explanation." : !goalMet ? "Complete the Try it step to continue." : "Ready for the next idea."}</p>
        <button type="button" class="course-next" data-action="course-next" ${canContinue ? "" : "disabled"}>${isLast ? "Finish course" : "Continue →"}</button>
      </footer>
    </section>
  `;
};
