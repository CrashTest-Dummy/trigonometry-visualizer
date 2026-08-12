import "./styles.css";
import {
  angleFromCoordinates,
  coordinatesFromAngle,
  displayAngle,
  normalizeDegrees360,
  vectorMagnitude,
  type AngleDisplayMode,
} from "./math/trig";
import { LESSONS, lessonMarkup, updateLessonValues } from "./ui/lessons";
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

const lessonTabs = LESSONS.map((item) => `
  <button class="lesson-tab${item.id === "basics" ? " is-active" : ""}" type="button" data-lesson="${item.id}" aria-pressed="${item.id === "basics"}">
    <span>${item.number}</span>${item.shortLabel}
  </button>
`).join("");

app.innerHTML = `
  <header class="site-header">
    <a class="brand" href="#top" aria-label="TrigLab home"><span class="brand-mark" aria-hidden="true"><i></i></span><span>TRIG<span>/</span>LAB</span></a>
    <div class="header-context"><span class="status-dot" aria-hidden="true"></span>Interactive geometry · ratios · vectors</div>
  </header>

  <main id="top">
    <section class="intro" aria-labelledby="page-title">
      <div><p class="eyebrow">See why the formulas work</p><h1 id="page-title">Move the geometry.<br /><em>Build the intuition.</em></h1></div>
      <p class="intro-copy">Every line, ratio, and equation is another view of the <strong>same vector.</strong> Drag it, rotate it, or edit its components and watch every relationship stay connected.</p>
    </section>

    <nav class="lesson-tabs" aria-label="Choose a trigonometry lesson">${lessonTabs}</nav>

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

      <aside class="lesson-panel" id="lesson-panel">${lessonMarkup("basics", "sine")}</aside>
    </section>

    <section class="coming-next" aria-label="Learning path">
      <p class="card-kicker">The complete bridge</p>
      <div class="roadmap" aria-hidden="true"><span class="is-current">Geometry</span><i>→</i><span>Ratios</span><i>→</i><span>Trig functions</span><i>→</i><span>Angles</span><i>→</i><span>Real vectors</span></div>
    </section>

    <footer>
      <p><strong>Educational use only.</strong> General lessons use the standard mathematical convention: 0° is +X and positive angles are counterclockwise.</p>
      <p>PDOF and vehicle-coordinate conventions can differ. Follow validated tools, applicable standards, agency procedures, manufacturer documentation, and EDR documentation for reconstruction work.</p>
    </footer>
  </main>
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

const updateDerivedMemory = (): void => {
  const magnitude = vectorMagnitude(vector.x, vector.y);
  const angle = angleFromCoordinates(vector.x, vector.y);
  if (angle !== null) lastAngle = angle;
  if (magnitude > 1e-10 && lesson !== "unit-circle") lastMagnitude = magnitude;
};

const updateLessonPanel = (): void => {
  const panel = required<HTMLElement>("#lesson-panel");
  panel.innerHTML = lessonMarkup(lesson, relation);
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
  updateLessonValues(required<HTMLElement>("#lesson-panel"), { vector, angleMode, relation, units });

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
    setAngle(currentAngle() + (event.key === "ArrowLeft" || event.key === "ArrowDown" ? -step * 5 : step * 5), true);
    return;
  }
  const delta: Record<string, VectorState> = { ArrowLeft: { x: -step, y: 0 }, ArrowRight: { x: step, y: 0 }, ArrowUp: { x: 0, y: step }, ArrowDown: { x: 0, y: -step } };
  if (!delta[event.key]) return;
  event.preventDefault();
  updateVector({ x: vector.x + delta[event.key].x, y: vector.y + delta[event.key].y }, true);
});

required<HTMLFormElement>("#vector-form").addEventListener("input", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLInputElement) || target.value === "") return;
  const value = Number(target.value);
  if (!Number.isFinite(value)) return;
  if (target.name === "x") updateVector({ ...vector, x: value });
  if (target.name === "y") updateVector({ ...vector, y: value });
  if (target.name === "angle" || target.id === "angle-slider") setAngle(value);
});

required<HTMLButtonElement>("#reset-button").addEventListener("click", () => {
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
  button.addEventListener("click", () => setAngle(Number(button.dataset.anglePreset), true));
});

required<HTMLElement>("#lesson-panel").addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof Element)) return;
  const relationButton = target.closest<HTMLButtonElement>("[data-relation]");
  if (relationButton) {
    relation = relationButton.dataset.relation as Relation;
    updateLessonPanel();
    render(true);
    return;
  }
  const actionButton = target.closest<HTMLButtonElement>("[data-action]");
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

render();
