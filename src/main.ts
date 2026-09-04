import "./styles.css";
import {
  angleFromCoordinates,
  coordinatesFromAngle,
  displayAngle,
  normalizeDegrees360,
  vectorMagnitude,
  type AngleDisplayMode,
} from "./math/trig";
import {
  COURSE_MODULES,
  COURSE_PHASES,
  GUIDED_DEFINITIONS,
  courseNavigationMarkup,
  courseStepMarkup,
  type AppMode,
  type CoursePhase,
  type InteractionGoal,
} from "./ui/course";
import { conceptById, conceptDetailMarkup, conceptDialogMarkup } from "./ui/concepts";
import { LESSONS, lessonMarkup, updateLessonValues } from "./ui/lessons";
import { loadProgress, resetProgress, saveProgress, type CourseProgress } from "./ui/progress";
import { definitionsMarkup, referenceMarkup } from "./ui/reference";
import {
  clampGraphCoordinates,
  createPlotMarkup,
  graphToVector,
  renderVector,
  type Lesson,
  type Relation,
  type VectorState,
} from "./visualization/vectorPlot";

const app = document.querySelector<HTMLDivElement>("#app");
if (!app) throw new Error("Application root was not found.");

const lessonFamilies: Array<{ label: string; lessons: Lesson[] }> = [
  { label: "Foundations", lessons: ["basics", "sine", "cosine", "tangent"] },
  { label: "Recovering direction", lessons: ["inverse", "quadrants"] },
  { label: "Connections", lessons: ["unit-circle", "delta-v"] },
];

const lessonTabs = lessonFamilies.map((family) => `
  <div class="lesson-family"><span>${family.label}</span><div>${family.lessons.map((lessonId) => {
    const item = LESSONS.find((candidate) => candidate.id === lessonId)!;
    return `<button class="lesson-tab${item.id === "basics" ? " is-active" : ""}" type="button" data-lesson="${item.id}" aria-pressed="${item.id === "basics"}"><span>${item.number}</span>${item.shortLabel}</button>`;
  }).join("")}</div></div>
`).join("");

let progress: CourseProgress = loadProgress();
let appMode: AppMode = progress.lastMode;
let activeCourseIndex = Math.max(0, COURSE_MODULES.findIndex((module) => module.id === progress.moduleId));
let activePhaseIndex = COURSE_PHASES.indexOf(progress.phase);
let selectedPredictionId: string | null = null;

app.innerHTML = `
  <header class="site-header">
    <a class="brand" href="#top" aria-label="TrigLab home"><span class="brand-mark" aria-hidden="true"><i></i></span><span>TRIG<span>/</span>LAB</span></a>
    <div class="header-actions">
      <div class="header-context"><span class="status-dot" aria-hidden="true"></span>Interactive geometry · ratios · vectors</div>
      <button class="concept-help-button" type="button" data-action="open-concepts"><span aria-hidden="true">?</span> Concept help</button>
      <button class="exit-guided" type="button" data-action="exit-guided" hidden>Exit guided course</button>
    </div>
  </header>

  <main id="top">
    <aside class="guided-exit-cue" id="guided-exit-cue" aria-labelledby="guided-exit-cue-copy" hidden>
      <span class="exit-cue-arrow" aria-hidden="true">↗</span>
      <p id="guided-exit-cue-copy"><strong>You can leave this walkthrough at any time.</strong><span>Choose Exit guided course to open Explore freely. Your course progress stays saved in this browser.</span></p>
      <button type="button" data-action="dismiss-exit-cue">Got it</button>
    </aside>

    <nav class="mode-switch" aria-label="Choose how to use TrigLab">
      <button type="button" data-app-mode="guided" aria-pressed="${appMode === "guided"}"><span aria-hidden="true">◎</span><b>Guided course</b><small>Build intuition step by step</small></button>
      <button type="button" data-app-mode="explore" aria-pressed="${appMode === "explore"}"><span aria-hidden="true">↗</span><b>Explore freely</b><small>Use the complete sandbox</small></button>
      <button type="button" data-app-mode="reference" aria-pressed="${appMode === "reference"}"><span aria-hidden="true">▤</span><b>Quick reference</b><small>Formulas, signs, and cautions</small></button>
    </nav>

    <section class="intro" id="mode-intro" aria-labelledby="page-title">
      <div><p class="eyebrow" id="intro-eyebrow">Guided course</p><h1 id="page-title">You already work with components.<br /><em>This course shows the picture behind them.</em></h1></div>
      <p class="intro-copy" id="intro-copy">Predict what will happen, manipulate the vector, then check the geometry. There are no scores, just a clearer mental picture.</p>
    </section>

    <div id="guided-navigation">${courseNavigationMarkup(activeCourseIndex, activePhaseIndex, progress.completedStepIds)}</div>
    <nav class="lesson-tabs" id="explore-navigation" aria-label="Choose a trigonometry lesson">${lessonTabs}</nav>

    <section class="workspace" aria-label="Interactive trigonometry lesson">
      <article class="plot-card">
        <div class="plot-heading">
          <div><p class="card-kicker" id="plot-kicker">Triangle basics</p><h2 id="plot-heading-text">One vector, three connected sides</h2></div>
          <p class="convention"><span aria-hidden="true">↺</span><b id="convention-label">0° at +X · counterclockwise</b></p>
        </div>

        <div class="plot-wrap">
          ${createPlotMarkup()}
          <div class="drag-prompt" id="drag-prompt" aria-hidden="true"><span>↖</span> Drag the endpoint</div>
        </div>

        <div class="vector-readout" aria-label="Live vector values">
          <div class="metric metric-x"><span class="metric-symbol">X</span><span class="metric-copy"><small id="x-metric-label">Adjacent · run</small><strong id="x-readout">10.00</strong></span></div>
          <div class="metric metric-y"><span class="metric-symbol">Y</span><span class="metric-copy"><small id="y-metric-label">Opposite · rise</small><strong id="y-readout">5.00</strong></span></div>
          <div class="metric metric-r"><span class="metric-symbol">R</span><span class="metric-copy"><small id="r-metric-label">Resultant</small><strong id="r-readout">11.18</strong></span></div>
          <div class="metric metric-angle"><span class="metric-symbol">θ</span><span class="metric-copy"><small>Direction</small><strong id="angle-readout">26.6°</strong></span></div>
        </div>

        <form class="vector-controls" id="vector-form">
          <div class="control-heading">
            <div><p class="card-kicker">Control the same vector three ways</p><p>Drag, enter components, or set the angle. Every control stays synchronized.</p></div>
            <button class="reset-button" type="button" id="reset-button">Reset example</button>
          </div>

          <div class="input-row" id="component-inputs">
            <label class="component-input input-x"><span><i aria-hidden="true"></i><b id="x-input-label">X · horizontal</b></span><div><input id="x-input" name="x" type="number" min="-20" max="20" step="0.1" value="10" inputmode="decimal" /><em id="x-unit">units</em></div></label>
            <label class="component-input input-y"><span><i aria-hidden="true"></i><b id="y-input-label">Y · vertical</b></span><div><input id="y-input" name="y" type="number" min="-15" max="15" step="0.1" value="5" inputmode="decimal" /><em id="y-unit">units</em></div></label>
          </div>

          <div class="angle-control">
            <div class="angle-control-heading"><label for="angle-slider"><span class="angle-swatch" aria-hidden="true">∠</span>Direction angle</label><div class="angle-format" role="group" aria-label="Angle display range"><button type="button" data-angle-mode="unsigned" aria-pressed="true">0–360°</button><button type="button" data-angle-mode="signed" aria-pressed="false">−180–180°</button></div></div>
            <div class="angle-control-row">
              <input id="angle-slider" type="range" min="0" max="360" step="0.1" value="26.565" list="special-angles" aria-label="Direction angle slider" />
              <label class="angle-number"><input id="angle-input" name="angle" type="number" min="0" max="360" step="0.1" value="26.6" inputmode="decimal" aria-label="Direction angle value" /><span>°</span></label>
            </div>
            <datalist id="special-angles"><option value="0"></option><option value="30"></option><option value="45"></option><option value="60"></option><option value="90"></option><option value="180"></option><option value="270"></option><option value="360"></option></datalist>
            <div class="special-angle-row" aria-label="Special angle shortcuts"><span>Jump to</span>${[0, 30, 45, 60, 90, 180, 270].map((angle) => `<button type="button" data-angle-preset="${angle}">${angle}°</button>`).join("")}</div>
            <p class="origin-angle-note" id="origin-angle-note" hidden>The zero vector has no direction. Changing the angle will restore the last non-zero length.</p>
          </div>
        </form>
      </article>

      <aside class="lesson-panel" id="lesson-panel"></aside>
    </section>

    <section class="coming-next" id="learning-bridge" aria-labelledby="bridge-title">
      <div class="bridge-heading"><div><p class="card-kicker">The complete bridge</p><h2 id="bridge-title">From geometry to field application</h2></div><button type="button" data-action="reset-course">Reset course progress</button></div>
      <ol class="roadmap" id="roadmap"></ol>
    </section>

    <div id="reference-view" hidden>${referenceMarkup()}</div>

    <footer>
      <p><strong>Educational use only.</strong> General lessons use the standard mathematical convention: 0° is +X and positive angles are counterclockwise.</p>
      <p>PDOF and vehicle-coordinate conventions can differ. Follow validated tools, applicable standards, agency procedures, manufacturer documentation, and EDR documentation for reconstruction work.</p>
    </footer>
  </main>
  ${conceptDialogMarkup()}
  <div class="sr-only" id="live-values" aria-live="polite"></div>
`;

let vector: VectorState = { x: 10, y: 5 };
let lesson: Lesson = "basics";
let relation: Relation = "sine";
let angleMode: AngleDisplayMode = "unsigned";
let units: "mph" | "km/h" = "mph";
let lastAngle = angleFromCoordinates(vector.x, vector.y) ?? 0;
let lastMagnitude = vectorMagnitude(vector.x, vector.y);
let magnitudeBeforeUnitCircle = lastMagnitude;
let hasDragged = false;
let courseInteractionOccurred = false;
let conceptOpener: HTMLElement | null = null;

const required = <T extends Element>(selector: string): T => {
  const element = document.querySelector<T>(selector);
  if (!element) throw new Error(`Required element not found: ${selector}`);
  return element;
};

const setText = (id: string, value: string): void => {
  required<HTMLElement>(`#${id}`).textContent = value;
};

const format = (value: number, digits = 2): string =>
  (Math.abs(value) < 0.0005 ? 0 : value).toFixed(digits);

const currentAngle = (): number => angleFromCoordinates(vector.x, vector.y) ?? lastAngle;

const currentRelation = (): Relation => {
  if (lesson === "sine") return "sine";
  if (lesson === "cosine") return "cosine";
  if (lesson === "tangent") return "tangent";
  return relation;
};

const activeCourseStep = () => COURSE_MODULES[activeCourseIndex].step;
const activeCoursePhase = (): CoursePhase => COURSE_PHASES[activePhaseIndex];

const goalIsMet = (goal: InteractionGoal): boolean => {
  if (!courseInteractionOccurred) return false;
  const tolerance = goal.tolerance ?? 0.08;
  if (goal.type === "preset-match") {
    return Math.abs(vector.x - goal.target.x) <= tolerance && Math.abs(vector.y - goal.target.y) <= tolerance;
  }
  const angle = angleFromCoordinates(vector.x, vector.y);
  if (angle === null) return false;
  const difference = Math.abs(((angle - goal.degrees + 540) % 360) - 180);
  return difference <= (goal.tolerance ?? 0.5);
};

const persistProgress = (): void => {
  progress.lastMode = appMode;
  progress.moduleId = COURSE_MODULES[activeCourseIndex].id;
  progress.phase = activeCoursePhase();
  saveProgress(progress);
};

const bridgeStageForLesson = (selectedLesson: Lesson): number => {
  if (selectedLesson === "basics") return 0;
  if (selectedLesson === "sine" || selectedLesson === "cosine" || selectedLesson === "tangent") return 1;
  if (selectedLesson === "inverse" || selectedLesson === "unit-circle") return 2;
  if (selectedLesson === "quadrants") return 3;
  return 4;
};

const bridgeStageForCourse = (): number => {
  if (activeCourseIndex === 0) return 0;
  if (activeCourseIndex === 1) return 1;
  if (activeCourseIndex === 2 || activeCourseIndex === 4 || activeCourseIndex === 5) return 2;
  if (activeCourseIndex === 3) return 3;
  return 4;
};

const updateBridge = (): void => {
  const stages = ["Geometry", "Components and ratios", "Trig functions", "Direction", "Field application"];
  const current = appMode === "guided" ? bridgeStageForCourse() : bridgeStageForLesson(lesson);
  required<HTMLOListElement>("#roadmap").innerHTML = stages.map((stage, index) => {
    const state = index < current ? "complete" : index === current ? "current" : "upcoming";
    return `<li data-state="${state}"${index === current ? ' aria-current="step"' : ""}><span>${index < current ? "✓" : index + 1}</span><b>${stage}</b>${index < stages.length - 1 ? '<i aria-hidden="true">→</i>' : ""}</li>`;
  }).join("");
};

const updateModePresentation = (): void => {
  const guided = appMode === "guided";
  const explore = appMode === "explore";
  const reference = appMode === "reference";
  const showExitCue = guided && !progress.introDismissed;
  const exitButton = required<HTMLButtonElement>(".exit-guided");
  required<HTMLElement>(".mode-switch").hidden = guided;
  required<HTMLElement>("#mode-intro").hidden = guided || reference;
  required<HTMLElement>("#guided-exit-cue").hidden = !showExitCue;
  required<HTMLElement>("#guided-navigation").hidden = !guided;
  required<HTMLElement>("#explore-navigation").hidden = !explore;
  required<HTMLElement>(".workspace").hidden = reference;
  required<HTMLElement>("#learning-bridge").hidden = guided || reference;
  required<HTMLElement>("#reference-view").hidden = !reference;
  exitButton.hidden = !guided;
  exitButton.classList.toggle("is-called-out", showExitCue);
  if (showExitCue) exitButton.setAttribute("aria-describedby", "guided-exit-cue-copy");
  else exitButton.removeAttribute("aria-describedby");
  document.body.classList.toggle("has-exit-cue", showExitCue);
  document.body.dataset.mode = appMode;
  document.querySelectorAll<HTMLButtonElement>("[data-app-mode]").forEach((button) => {
    button.setAttribute("aria-pressed", String(button.dataset.appMode === appMode));
  });

  if (explore) {
    setText("intro-eyebrow", "Explore every relationship");
    required<HTMLElement>("#page-title").innerHTML = "Move the geometry.<br /><em>Build the intuition.</em>";
    setText("intro-copy", "Every line, ratio, and equation is another view of the same vector. Choose a lesson and manipulate it freely.");
  }
  updateBridge();
};

const renderGuidedPanel = (): void => {
  const step = activeCourseStep();
  const panel = required<HTMLElement>("#lesson-panel");
  if (progress.completedStepIds.length === COURSE_MODULES.length && activeCourseIndex === COURSE_MODULES.length - 1 && activeCoursePhase() === "takeaway") {
    panel.innerHTML = `<section class="course-step course-complete-screen" aria-labelledby="course-step-title"><div class="guided-instruction"><span class="completion-check" aria-hidden="true">✓</span><h1 id="course-step-title">You crossed the complete bridge.</h1><p class="guided-lead">You can now revisit any relationship in Explore freely, or keep this course as a refresher.</p></div><footer class="course-step-actions"><button class="course-back" type="button" data-action="course-previous"><span aria-hidden="true">←</span> Back</button><p>7 of 7 modules complete</p><button type="button" class="course-next" data-action="course-finish-explore">Explore freely<span aria-hidden="true"> →</span></button></footer></section>`;
    required<HTMLElement>("#guided-navigation").innerHTML = courseNavigationMarkup(activeCourseIndex, activePhaseIndex, progress.completedStepIds);
    document.body.dataset.guidedPhase = "complete";
    return;
  }
  const definitions = activeCoursePhase() === "notice" ? definitionsMarkup(GUIDED_DEFINITIONS[step.id]) : "";
  panel.innerHTML = courseStepMarkup(activeCourseIndex, activePhaseIndex, selectedPredictionId, goalIsMet(step.interactionGoal)) + definitions;
  required<HTMLElement>("#guided-navigation").innerHTML = courseNavigationMarkup(activeCourseIndex, activePhaseIndex, progress.completedStepIds);
  document.body.dataset.guidedPhase = activeCoursePhase();
};

const updateDerivedMemory = (): void => {
  const magnitude = vectorMagnitude(vector.x, vector.y);
  const angle = angleFromCoordinates(vector.x, vector.y);
  if (angle !== null) lastAngle = angle;
  if (magnitude > 1e-10 && lesson !== "unit-circle") lastMagnitude = magnitude;
};

const updateLessonPanel = (): void => {
  const panel = required<HTMLElement>("#lesson-panel");
  if (appMode === "guided") {
    renderGuidedPanel();
    return;
  }
  panel.innerHTML = lessonMarkup(lesson, relation) + definitionsMarkup();
};

const lessonHeadings: Record<Lesson, { kicker: string; title: string }> = {
  basics: { kicker: "Triangle basics", title: "One vector, three connected sides" },
  sine: { kicker: "Sine · opposite ÷ hypotenuse", title: "See the vector’s vertical share" },
  cosine: { kicker: "Cosine · adjacent ÷ hypotenuse", title: "See the vector’s horizontal share" },
  tangent: { kicker: "Tangent · opposite ÷ adjacent", title: "See rise compared with run" },
  inverse: { kicker: "Inverse trigonometry", title: "Start with a ratio; recover an angle" },
  quadrants: { kicker: "atan versus atan2", title: "Keep the component signs visible" },
  "unit-circle": { kicker: "Radius fixed at one", title: "Coordinates become cosine and sine" },
  "delta-v": { kicker: "Delta-V / PDOF connection", title: "Combine longitudinal and lateral components" },
};

const render = (announce = false): void => {
  updateDerivedMemory();
  const magnitude = vectorMagnitude(vector.x, vector.y);
  const angle = angleFromCoordinates(vector.x, vector.y);
  const displayedAngle = angle === null ? null : displayAngle(angle, angleMode);
  const deltaMode = lesson === "delta-v";
  const unitCircleMode = lesson === "unit-circle";
  const suffix = deltaMode ? ` ${units}` : "";

  renderVector(vector, { lesson, relation: currentRelation(), angleMode });
  if (appMode === "guided") {
    renderGuidedPanel();
  } else if (appMode === "explore") {
    updateLessonValues(required<HTMLElement>("#lesson-panel"), { vector, angleMode, relation, units });
  }

  setText("x-readout", `${format(vector.x)}${suffix}`);
  setText("y-readout", `${format(vector.y)}${suffix}`);
  setText("r-readout", `${format(magnitude)}${suffix}`);
  setText("angle-readout", displayedAngle === null ? "undefined" : `${format(displayedAngle, 1)}°`);

  setText("plot-kicker", lessonHeadings[lesson].kicker);
  setText("plot-heading-text", lessonHeadings[lesson].title);
  setText("convention-label", deltaMode ? "Math display · no PDOF conversion" : "0° at +X · counterclockwise");
  setText("x-metric-label", deltaMode ? "ΔVx · longitudinal" : unitCircleMode ? "cos θ · X coordinate" : "Adjacent · horizontal");
  setText("y-metric-label", deltaMode ? "ΔVy · lateral" : unitCircleMode ? "sin θ · Y coordinate" : "Opposite · vertical");
  setText("r-metric-label", deltaMode ? "Resultant Delta-V" : unitCircleMode ? "Unit radius" : "Resultant");
  setText("x-input-label", deltaMode ? "ΔVx · longitudinal" : "X · horizontal");
  setText("y-input-label", deltaMode ? "ΔVy · lateral" : "Y · vertical");
  setText("x-unit", deltaMode ? units : "units");
  setText("y-unit", deltaMode ? units : "units");

  const xInput = required<HTMLInputElement>("#x-input");
  const yInput = required<HTMLInputElement>("#y-input");
  const angleInput = required<HTMLInputElement>("#angle-input");
  const angleSlider = required<HTMLInputElement>("#angle-slider");
  const componentInputs = required<HTMLElement>("#component-inputs");
  const guidedManipulation = appMode !== "guided" || activeCoursePhase() === "manipulate";
  required<SVGCircleElement>("#endpoint-hit").setAttribute("tabindex", guidedManipulation ? "0" : "-1");
  xInput.disabled = unitCircleMode;
  yInput.disabled = unitCircleMode;
  componentInputs.classList.toggle("is-unit-locked", unitCircleMode);
  componentInputs.setAttribute("aria-label", unitCircleMode ? "X and Y are outputs while radius is fixed to one" : "Editable X and Y components");
  if (document.activeElement !== xInput) xInput.value = format(vector.x);
  if (document.activeElement !== yInput) yInput.value = format(vector.y);

  const controlAngle = displayAngle(currentAngle(), angleMode);
  angleSlider.min = angleMode === "signed" ? "-180" : "0";
  angleSlider.max = angleMode === "signed" ? "180" : "360";
  angleSlider.value = String(controlAngle);
  angleInput.min = angleSlider.min;
  angleInput.max = angleSlider.max;
  if (document.activeElement !== angleInput) angleInput.value = format(controlAngle, 1);
  required<HTMLElement>("#origin-angle-note").hidden = angle !== null;

  document.body.dataset.lesson = lesson;
  updateBridge();
  if (announce) {
    setText("live-values", `X ${format(vector.x)}, Y ${format(vector.y)}, magnitude ${format(magnitude)}, direction ${displayedAngle === null ? "undefined" : `${format(displayedAngle, 1)} degrees`}`);
  }
};

const updateVector = (next: VectorState, announce = false): void => {
  vector = clampGraphCoordinates(next);
  render(announce);
};

const setAngle = (degrees: number, announce = false): void => {
  if (!Number.isFinite(degrees)) return;
  const magnitude = lesson === "unit-circle"
    ? 1
    : vectorMagnitude(vector.x, vector.y) || lastMagnitude || 1;
  lastAngle = normalizeDegrees360(degrees);
  vector = coordinatesFromAngle(lastAngle, magnitude);
  render(announce);
};

const selectLesson = (nextLesson: Lesson): void => {
  if (nextLesson === lesson) return;
  if (nextLesson === "inverse") relation = "sine";
  const leavingUnitCircle = lesson === "unit-circle" && nextLesson !== "unit-circle";
  const enteringUnitCircle = nextLesson === "unit-circle" && lesson !== "unit-circle";
  const angle = currentAngle();
  if (enteringUnitCircle) {
    magnitudeBeforeUnitCircle = vectorMagnitude(vector.x, vector.y) || lastMagnitude || 1;
    vector = coordinatesFromAngle(angle, 1);
  } else if (leavingUnitCircle) {
    vector = coordinatesFromAngle(angle, magnitudeBeforeUnitCircle || 1);
  }
  lesson = nextLesson;
  document.querySelectorAll<HTMLButtonElement>(".lesson-tab").forEach((button) => {
    const active = button.dataset.lesson === lesson;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-pressed", String(active));
  });
  updateLessonPanel();
  render(true);
};

const traceRelevantRelationship = (): void => {
  const ids = activeCourseStep().lesson === "basics"
    ? ["#x-component", "#y-component", "#resultant"]
    : activeCourseStep().relation === "sine"
      ? ["#y-component", "#resultant"]
      : activeCourseStep().relation === "cosine"
        ? ["#x-component", "#resultant"]
        : ["#x-component", "#y-component"];
  const elements: Element[] = ids.map((selector) => required<SVGElement>(selector));
  elements.push(...document.querySelectorAll<HTMLElement>(".guided-instruction"));
  elements.forEach((element) => element.classList.add("trace-focused"));
  window.setTimeout(() => elements.forEach((element) => element.classList.remove("trace-focused")), 750);
};

const setGuidedPosition = (moduleIndex: number, phaseIndex: number, announce = true): void => {
  const boundedModule = Math.max(0, Math.min(COURSE_MODULES.length - 1, moduleIndex));
  const boundedPhase = Math.max(0, Math.min(COURSE_PHASES.length - 1, phaseIndex));
  const step = COURSE_MODULES[boundedModule].step;
  const moduleChanged = boundedModule !== activeCourseIndex;
  activeCourseIndex = boundedModule;
  activePhaseIndex = boundedPhase;
  if (moduleChanged) selectedPredictionId = null;
  courseInteractionOccurred = false;
  selectLesson(step.lesson);
  relation = step.relation;
  if (activeCoursePhase() === "notice") {
    vector = clampGraphCoordinates(step.preset);
    lastAngle = angleFromCoordinates(vector.x, vector.y) ?? lastAngle;
    lastMagnitude = vectorMagnitude(vector.x, vector.y) || lastMagnitude;
  }
  persistProgress();
  updateLessonPanel();
  render(announce);
};

const previousCoursePosition = (): void => {
  if (activePhaseIndex > 0) {
    setGuidedPosition(activeCourseIndex, activePhaseIndex - 1);
  } else if (activeCourseIndex > 0) {
    setGuidedPosition(activeCourseIndex - 1, COURSE_PHASES.length - 1);
  }
};

const nextCoursePosition = (): void => {
  const phase = activeCoursePhase();
  const step = activeCourseStep();
  if (phase === "predict" && selectedPredictionId === null) return;
  if (phase === "manipulate" && !goalIsMet(step.interactionGoal)) return;
  if (phase === "takeaway") {
    if (!progress.completedStepIds.includes(step.id)) progress.completedStepIds.push(step.id);
    if (activeCourseIndex === COURSE_MODULES.length - 1) {
      persistProgress();
      renderGuidedPanel();
      return;
    }
    setGuidedPosition(activeCourseIndex + 1, 0);
    return;
  }
  setGuidedPosition(activeCourseIndex, activePhaseIndex + 1);
};

const setAppMode = (nextMode: AppMode): void => {
  if (appMode === nextMode) return;
  appMode = nextMode;
  if (appMode === "guided") {
    const step = activeCourseStep();
    lesson = step.lesson;
    relation = step.relation;
    courseInteractionOccurred = false;
    updateLessonPanel();
  } else if (appMode === "explore") {
    updateLessonPanel();
  }
  persistProgress();
  updateModePresentation();
  render(true);
};

const dismissExitCue = (): void => {
  if (progress.introDismissed) return;
  progress.introDismissed = true;
  persistProgress();
  updateModePresentation();
};

const conceptDialog = required<HTMLDialogElement>("#concept-dialog");

const openConceptDialog = (opener?: HTMLElement): void => {
  conceptOpener = opener ?? (document.activeElement instanceof HTMLElement ? document.activeElement : null);
  if (typeof conceptDialog.showModal === "function") conceptDialog.showModal();
  else conceptDialog.setAttribute("open", "");
  conceptDialog.querySelector<HTMLButtonElement>("[data-concept]")?.focus();
};

const closeConceptDialog = (): void => {
  if (typeof conceptDialog.close === "function") conceptDialog.close();
  else conceptDialog.removeAttribute("open");
  conceptOpener?.focus();
};

const showConcept = (id: string): void => {
  const concept = conceptById(id);
  if (!concept) return;
  required<HTMLElement>("#concept-detail").innerHTML = conceptDetailMarkup(concept, vector);
  conceptDialog.querySelectorAll<HTMLButtonElement>("[data-concept]").forEach((button) => {
    button.setAttribute("aria-pressed", String(button.dataset.concept === id));
  });
};

const plot = required<SVGSVGElement>("#vector-plot");
const endpointHit = required<SVGCircleElement>("#endpoint-hit");

const updateFromPointer = (event: PointerEvent): void => {
  const point = plot.createSVGPoint();
  point.x = event.clientX;
  point.y = event.clientY;
  const matrix = plot.getScreenCTM();
  if (!matrix) return;
  const svgPoint = point.matrixTransform(matrix.inverse());
  const rawVector = graphToVector(svgPoint.x, svgPoint.y);
  if (lesson === "unit-circle") {
    const angle = angleFromCoordinates(rawVector.x, rawVector.y);
    if (angle !== null) updateVector(coordinatesFromAngle(angle, 1));
  } else {
    updateVector(rawVector);
  }
};

endpointHit.addEventListener("pointerdown", (event) => {
  hasDragged = true;
  courseInteractionOccurred = true;
  required<HTMLElement>("#drag-prompt").classList.add("is-hidden");
  endpointHit.setPointerCapture(event.pointerId);
  updateFromPointer(event);
});
endpointHit.addEventListener("pointermove", (event) => {
  if (endpointHit.hasPointerCapture(event.pointerId)) updateFromPointer(event);
});
endpointHit.addEventListener("pointerup", (event) => {
  endpointHit.releasePointerCapture(event.pointerId);
  render(true);
});
endpointHit.addEventListener("keydown", (event) => {
  const step = event.shiftKey ? 0.1 : 0.5;
  if (lesson === "unit-circle" && ["ArrowLeft", "ArrowDown", "ArrowRight", "ArrowUp"].includes(event.key)) {
    event.preventDefault();
    courseInteractionOccurred = true;
    setAngle(currentAngle() + (event.key === "ArrowLeft" || event.key === "ArrowDown" ? -step * 5 : step * 5), true);
    return;
  }
  const delta: Record<string, VectorState> = { ArrowLeft: { x: -step, y: 0 }, ArrowRight: { x: step, y: 0 }, ArrowUp: { x: 0, y: step }, ArrowDown: { x: 0, y: -step } };
  if (!delta[event.key]) return;
  event.preventDefault();
  courseInteractionOccurred = true;
  updateVector({ x: vector.x + delta[event.key].x, y: vector.y + delta[event.key].y }, true);
});

required<HTMLFormElement>("#vector-form").addEventListener("input", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLInputElement) || target.value === "") return;
  const value = Number(target.value);
  if (!Number.isFinite(value)) return;
  courseInteractionOccurred = true;
  if (target.name === "x") updateVector({ ...vector, x: value });
  if (target.name === "y") updateVector({ ...vector, y: value });
  if (target.name === "angle" || target.id === "angle-slider") setAngle(value);
});

required<HTMLButtonElement>("#reset-button").addEventListener("click", () => {
  courseInteractionOccurred = true;
  if (lesson === "unit-circle") {
    vector = coordinatesFromAngle(30, 1);
  } else {
    vector = { x: 10, y: 5 };
  }
  lastAngle = angleFromCoordinates(vector.x, vector.y) ?? 0;
  lastMagnitude = vectorMagnitude(vector.x, vector.y);
  hasDragged = false;
  required<HTMLElement>("#drag-prompt").classList.remove("is-hidden");
  render(true);
});

document.querySelectorAll<HTMLButtonElement>(".lesson-tab").forEach((tab) => {
  tab.addEventListener("click", () => selectLesson(tab.dataset.lesson as Lesson));
});

document.querySelectorAll<HTMLButtonElement>("[data-angle-mode]").forEach((button) => {
  button.addEventListener("click", () => {
    angleMode = button.dataset.angleMode as AngleDisplayMode;
    document.querySelectorAll<HTMLButtonElement>("[data-angle-mode]").forEach((item) => item.setAttribute("aria-pressed", String(item === button)));
    render(true);
  });
});

document.querySelectorAll<HTMLButtonElement>("[data-angle-preset]").forEach((button) => {
  button.addEventListener("click", () => {
    courseInteractionOccurred = true;
    setAngle(Number(button.dataset.anglePreset), true);
  });
});

required<HTMLElement>("#lesson-panel").addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof Element)) return;
  const predictionButton = target.closest<HTMLButtonElement>("[data-prediction]");
  if (predictionButton && appMode === "guided") {
    selectedPredictionId = predictionButton.dataset.prediction ?? null;
    renderGuidedPanel();
    return;
  }
  const relationButton = target.closest<HTMLButtonElement>("[data-relation]");
  if (relationButton) {
    relation = relationButton.dataset.relation as Relation;
    updateLessonPanel();
    render(true);
    return;
  }
  const actionButton = target.closest<HTMLButtonElement>("[data-action]");
  if (actionButton?.dataset.action === "retry-prediction" && appMode === "guided") {
    selectedPredictionId = null;
    renderGuidedPanel();
    return;
  }
  if (actionButton?.dataset.action === "course-preset" && appMode === "guided") {
    const step = activeCourseStep();
    courseInteractionOccurred = true;
    updateVector(step.preset, true);
    traceRelevantRelationship();
  }
  if (actionButton?.dataset.action === "course-previous" && appMode === "guided") {
    previousCoursePosition();
  }
  if (actionButton?.dataset.action === "course-next" && appMode === "guided") {
    if (activeCourseIndex === 0 && activeCoursePhase() === "orient") dismissExitCue();
    nextCoursePosition();
  }
  if (actionButton?.dataset.action === "course-finish-explore") {
    setAppMode("explore");
  }
  if (actionButton?.dataset.action === "flip") updateVector({ x: -vector.x, y: -vector.y }, true);
  if (actionButton?.dataset.action === "delta-example") updateVector({ x: -18, y: 7 }, true);
});

required<HTMLElement>("#lesson-panel").addEventListener("change", (event) => {
  const target = event.target;
  if (target instanceof HTMLSelectElement && target.id === "unit-select") {
    units = target.value as "mph" | "km/h";
    render(true);
  }
});

window.setTimeout(() => {
  if (!hasDragged) required<HTMLElement>("#drag-prompt").classList.add("is-visible");
}, 650);

document.querySelectorAll<HTMLButtonElement>("[data-app-mode]").forEach((button) => {
  button.addEventListener("click", () => setAppMode(button.dataset.appMode as AppMode));
});

required<HTMLElement>("#guided-navigation").addEventListener("click", (event) => {
  event.preventDefault();
});

required<HTMLElement>("#guided-exit-cue").addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof Element) || !target.closest('[data-action="dismiss-exit-cue"]')) return;
  dismissExitCue();
});

required<HTMLElement>("#learning-bridge").addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof Element) || !target.closest('[data-action="reset-course"]')) return;
  progress = resetProgress();
  activeCourseIndex = 0;
  activePhaseIndex = 0;
  selectedPredictionId = null;
  courseInteractionOccurred = false;
  appMode = "guided";
  lesson = COURSE_MODULES[0].step.lesson;
  relation = COURSE_MODULES[0].step.relation;
  vector = COURSE_MODULES[0].step.preset;
  updateLessonPanel();
  updateModePresentation();
  render(true);
});

required<HTMLButtonElement>(".exit-guided").addEventListener("click", () => {
  dismissExitCue();
  setAppMode("explore");
});

document.querySelectorAll<HTMLButtonElement>('[data-action="open-concepts"]').forEach((button) => {
  button.addEventListener("click", () => openConceptDialog(button));
});

conceptDialog.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof Element)) return;
  const conceptButton = target.closest<HTMLButtonElement>("[data-concept]");
  if (conceptButton?.dataset.concept) {
    showConcept(conceptButton.dataset.concept);
    return;
  }
  if (target.closest('[data-action="close-concepts"]')) {
    closeConceptDialog();
    return;
  }
  const lessonButton = target.closest<HTMLButtonElement>("[data-concept-lesson]");
  if (!lessonButton?.dataset.conceptLesson) return;
  const nextLesson = lessonButton.dataset.conceptLesson as Lesson;
  const nextRelation = lessonButton.dataset.conceptRelation as Relation | undefined;
  closeConceptDialog();
  setAppMode("explore");
  selectLesson(nextLesson);
  if (nextRelation) {
    relation = nextRelation;
    updateLessonPanel();
    render(true);
  }
});

conceptDialog.addEventListener("close", () => conceptOpener?.focus());
conceptDialog.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;
  event.preventDefault();
  closeConceptDialog();
});

required<HTMLElement>("#reference-view").addEventListener("click", (event) => {
  const target = event.target;
  if (target instanceof Element && target.closest('[data-action="print-reference"]')) window.print();
});

if (appMode === "guided") {
  lesson = activeCourseStep().lesson;
  relation = activeCourseStep().relation;
  if (activeCoursePhase() !== "orient") {
    vector = clampGraphCoordinates(activeCourseStep().preset);
    lastAngle = angleFromCoordinates(vector.x, vector.y) ?? lastAngle;
    lastMagnitude = vectorMagnitude(vector.x, vector.y) || lastMagnitude;
  }
}
updateLessonPanel();
updateModePresentation();
render();
