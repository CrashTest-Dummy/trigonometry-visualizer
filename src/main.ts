import "./styles.css";
import {
  angleFromCoordinates,
  atan2Degrees,
  atanDegrees,
  getQuadrant,
  tangentFromComponents,
  vectorMagnitude,
} from "./math/trig";
import {
  clampGraphCoordinates,
  createPlotMarkup,
  graphToVector,
  renderVector,
  type Lesson,
  type VectorState,
} from "./visualization/vectorPlot";

const app = document.querySelector<HTMLDivElement>("#app");

if (!app) {
  throw new Error("Application root was not found.");
}

app.innerHTML = `
  <header class="site-header">
    <a class="brand" href="#top" aria-label="TrigLab home">
      <span class="brand-mark" aria-hidden="true"><i></i></span>
      <span>TRIG<span>/</span>LAB</span>
    </a>
    <div class="header-context">
      <span class="status-dot" aria-hidden="true"></span>
      Interactive lesson · Tangent &amp; atan2
    </div>
  </header>

  <main id="top">
    <section class="intro" aria-labelledby="page-title">
      <div>
        <p class="eyebrow">See the relationship</p>
        <h1 id="page-title">Move the vector.<br /><em>Watch the math follow.</em></h1>
      </div>
      <p class="intro-copy">Drag the green endpoint anywhere on the plane. The triangle, ratio, and angle remain different views of the <strong>same geometry.</strong></p>
    </section>

    <nav class="lesson-tabs" aria-label="Choose a lesson">
      <button class="lesson-tab is-active" type="button" data-lesson="tangent" aria-pressed="true">
        <span>01</span> Tangent &amp; slope
      </button>
      <button class="lesson-tab" type="button" data-lesson="quadrants" aria-pressed="false">
        <span>02</span> atan vs atan2
      </button>
      <div class="future-lessons" aria-label="Future lessons">
        <span>Sine</span><span>Cosine</span><span>Unit circle</span>
      </div>
    </nav>

    <section class="workspace" aria-label="Interactive trigonometry lesson">
      <article class="plot-card">
        <div class="plot-heading">
          <div>
            <p class="card-kicker">Interactive coordinate plane</p>
            <h2>One vector, three sides</h2>
          </div>
          <p class="convention"><span aria-hidden="true">↺</span> 0° at +X · counterclockwise</p>
        </div>

        <div class="plot-wrap">
          ${createPlotMarkup()}
          <div class="drag-prompt" id="drag-prompt" aria-hidden="true"><span>↖</span> Drag me</div>
        </div>

        <div class="vector-readout" aria-label="Live vector values">
          <div class="metric metric-x">
            <span class="metric-symbol">X</span>
            <span class="metric-copy"><small>Adjacent · run</small><strong id="x-readout">10.00</strong></span>
          </div>
          <div class="metric metric-y">
            <span class="metric-symbol">Y</span>
            <span class="metric-copy"><small>Opposite · rise</small><strong id="y-readout">5.00</strong></span>
          </div>
          <div class="metric metric-r">
            <span class="metric-symbol">R</span>
            <span class="metric-copy"><small>Resultant</small><strong id="r-readout">11.18</strong></span>
          </div>
          <div class="metric metric-angle">
            <span class="metric-symbol">θ</span>
            <span class="metric-copy"><small>Direction</small><strong id="angle-readout">26.6°</strong></span>
          </div>
        </div>

        <form class="component-controls" id="component-form">
          <div class="control-heading">
            <div>
              <p class="card-kicker">Set components directly</p>
              <p>Editing either value moves the same endpoint.</p>
            </div>
            <button class="reset-button" type="button" id="reset-button">Reset example</button>
          </div>
          <div class="input-row">
            <label class="component-input input-x">
              <span><i aria-hidden="true"></i> X · horizontal</span>
              <div><input id="x-input" name="x" type="number" min="-12" max="12" step="0.1" value="10" inputmode="decimal" /><b>units</b></div>
            </label>
            <label class="component-input input-y">
              <span><i aria-hidden="true"></i> Y · vertical</span>
              <div><input id="y-input" name="y" type="number" min="-10" max="10" step="0.1" value="5" inputmode="decimal" /><b>units</b></div>
            </label>
          </div>
        </form>
      </article>

      <aside class="lesson-panel">
        <section id="tangent-lesson" class="lesson-content" aria-labelledby="tangent-title">
          <div class="lesson-heading">
            <p class="card-kicker">The live relationship</p>
            <h2 id="tangent-title">Tangent is <em>steepness.</em></h2>
            <p>For every unit the vector moves horizontally, tangent tells us how many units it moves vertically.</p>
          </div>

          <div class="ratio-visual" aria-label="Tangent is rise divided by run">
            <div class="ratio-top ratio-y"><span class="mini-line vertical"></span><strong id="ratio-y">5.00</strong><small>rise</small></div>
            <div class="fraction-bar"></div>
            <div class="ratio-bottom ratio-x"><span class="mini-line horizontal"></span><strong id="ratio-x">10.00</strong><small>run</small></div>
            <div class="ratio-equals">=</div>
            <div class="ratio-result"><strong id="ratio-result">0.500</strong><small>rise per 1 run</small></div>
          </div>

          <div class="equation-stack">
            <div class="equation-step">
              <span class="step-number">1</span>
              <div><small>Turn the sides into a ratio</small><p>tan(<mark class="angle-text" id="tan-angle">26.6°</mark>) = <span class="y-text" id="tan-y">5.00</span> ÷ <span class="x-text" id="tan-x">10.00</span></p></div>
            </div>
            <div class="equation-step">
              <span class="step-number">2</span>
              <div><small>The ratio describes the slope</small><p>tan(<mark class="angle-text" id="tan-angle-2">26.6°</mark>) = <strong id="tan-result">0.500</strong></p></div>
            </div>
            <div class="equation-step inverse-step">
              <span class="step-number">3</span>
              <div><small>Ask the question in reverse</small><p>atan(<strong id="atan-ratio">0.500</strong>) = <mark class="angle-text" id="atan-result">26.6°</mark></p></div>
            </div>
          </div>

          <div class="plain-english" id="plain-english">
            <span aria-hidden="true">↗</span>
            <p><strong>Read it plainly:</strong> this vector rises <b id="slope-rise">0.50</b> units for every 1 unit it runs to the right.</p>
          </div>
        </section>

        <section id="quadrant-lesson" class="lesson-content" aria-labelledby="quadrant-title" hidden>
          <div class="lesson-heading">
            <p class="card-kicker">Why two inputs matter</p>
            <h2 id="quadrant-title"><code>atan</code> loses the <em>quadrant.</em></h2>
            <p>A ratio remembers steepness, but dividing two negative components erases both signs. <code>atan2(y, x)</code> keeps them.</p>
          </div>

          <div class="sign-grid" aria-label="Current vector signs and quadrant">
            <div><small>X sign</small><strong class="x-text" id="x-sign">positive +</strong></div>
            <div><small>Y sign</small><strong class="y-text" id="y-sign">positive +</strong></div>
            <div><small>Quadrant</small><strong id="quadrant-readout">I</strong></div>
          </div>

          <div class="comparison">
            <div class="comparison-row">
              <span class="method-label">atan(y ÷ x)</span>
              <code id="simple-atan-equation">atan(5 ÷ 10)</code>
              <strong id="simple-atan-result">26.6°</strong>
              <small>ratio only</small>
            </div>
            <div class="comparison-row recommended">
              <span class="method-label">atan2(y, x)</span>
              <code id="atan2-equation">atan2(5, 10)</code>
              <strong id="atan2-result">26.6°</strong>
              <small>both signs</small>
            </div>
          </div>

          <div class="ambiguity-demo">
            <div class="ambiguity-heading">
              <p class="card-kicker">Same ratio, opposite direction</p>
              <button type="button" id="flip-button">Flip vector 180° <span aria-hidden="true">↻</span></button>
            </div>
            <div class="opposite-row">
              <div><small>Current</small><strong id="current-components">(10, 5)</strong><span id="current-ratio">ratio 0.500</span></div>
              <div class="direction-arrow" aria-hidden="true">⇄</div>
              <div><small>Opposite</small><strong id="opposite-components">(−10, −5)</strong><span id="opposite-ratio">ratio 0.500</span></div>
            </div>
            <p id="ambiguity-copy"><code>atan</code> returns the same 26.6° for both. <code>atan2</code> separates them by 180°.</p>
          </div>

          <div class="plain-english quadrant-note">
            <span aria-hidden="true">◎</span>
            <p><strong>Think of it this way:</strong> slope tells you the tilt of a road. The signs of X and Y tell you which direction you are traveling on it.</p>
          </div>
        </section>
      </aside>
    </section>

    <section class="coming-next" aria-label="Future lesson roadmap">
      <p class="card-kicker">The bridge we are building</p>
      <div class="roadmap" aria-hidden="true">
        <span class="is-current">Geometry</span><i>→</i><span>Ratios</span><i>→</i><span>Trig functions</span><i>→</i><span>Angles</span><i>→</i><span>Real vectors</span>
      </div>
    </section>

    <footer>
      <p><strong>Educational use only.</strong> Standard math convention shown: 0° is +X, counterclockwise positive.</p>
      <p>PDOF and vehicle-coordinate conventions can differ. Follow validated tools, applicable standards, agency procedures, and manufacturer or EDR documentation for reconstruction work.</p>
    </footer>
  </main>

  <div class="sr-only" id="live-values" aria-live="polite"></div>
`;

let state: VectorState = { x: 10, y: 5 };
let lesson: Lesson = "tangent";
let hasDragged = false;

const requiredElement = <T extends Element>(selector: string): T => {
  const element = document.querySelector<T>(selector);
  if (!element) throw new Error(`Required element not found: ${selector}`);
  return element;
};

const setText = (id: string, value: string): void => {
  requiredElement<HTMLElement>(`#${id}`).textContent = value;
};

const format = (value: number, digits = 2): string => {
  const rounded = Math.abs(value) < 0.0005 ? 0 : value;
  return rounded.toFixed(digits);
};

const formatComponentPair = (x: number, y: number): string =>
  `(${format(x).replace("-", "−")}, ${format(y).replace("-", "−")})`;

const render = (announce = false): void => {
  renderVector(state, lesson);

  const magnitude = vectorMagnitude(state.x, state.y);
  const angle = angleFromCoordinates(state.x, state.y);
  const tangent = tangentFromComponents(state.x, state.y);
  const atan2 = atan2Degrees(state.y, state.x);
  const quadrant = getQuadrant(state.x, state.y);
  const angleText = angle === null ? "—" : `${format(angle, 1)}°`;
  const tangentText = tangent === null ? "undefined" : format(tangent, 3);
  const simpleAtan = tangent === null ? null : atanDegrees(tangent);

  setText("x-readout", format(state.x));
  setText("y-readout", format(state.y));
  setText("r-readout", format(magnitude));
  setText("angle-readout", angleText);
  setText("ratio-y", format(state.y));
  setText("ratio-x", format(state.x));
  setText("ratio-result", tangentText);
  setText("tan-angle", angleText);
  setText("tan-angle-2", angleText);
  setText("tan-y", format(state.y));
  setText("tan-x", format(state.x));
  setText("tan-result", tangentText);
  setText("atan-ratio", tangentText);
  setText("atan-result", simpleAtan === null ? "undefined" : `${format(simpleAtan, 1)}°`);

  const plainEnglish = requiredElement<HTMLElement>("#plain-english");
  const inverseStep = requiredElement<HTMLElement>(".inverse-step");
  if (tangent === null) {
    plainEnglish.classList.add("is-undefined");
    plainEnglish.querySelector("p")!.innerHTML = "<strong>Tangent is undefined here:</strong> the vector has rise, but no horizontal run to divide by.";
    inverseStep.classList.add("is-muted");
  } else {
    plainEnglish.classList.remove("is-undefined");
    inverseStep.classList.remove("is-muted");
    const direction = state.x < 0 ? "left" : "right";
    plainEnglish.querySelector("p")!.innerHTML = `<strong>Read it plainly:</strong> this line changes <b>${format(Math.abs(tangent), 2)}</b> vertical units for every 1 unit it runs ${direction}.`;
  }

  setText("x-sign", state.x === 0 ? "zero" : state.x > 0 ? "positive +" : "negative −");
  setText("y-sign", state.y === 0 ? "zero" : state.y > 0 ? "positive +" : "negative −");
  setText("quadrant-readout", quadrant);
  setText("simple-atan-equation", tangent === null ? "atan(y ÷ 0)" : `atan(${format(state.y)} ÷ ${format(state.x)})`);
  setText("simple-atan-result", simpleAtan === null ? "undefined" : `${format(simpleAtan, 1)}°`);
  setText("atan2-equation", `atan2(${format(state.y)}, ${format(state.x)})`);
  setText("atan2-result", atan2 === null ? "undefined" : `${format(atan2, 1)}°`);
  setText("current-components", formatComponentPair(state.x, state.y));
  setText("opposite-components", formatComponentPair(-state.x, -state.y));
  setText("current-ratio", `ratio ${tangentText}`);
  setText("opposite-ratio", `ratio ${tangentText}`);
  setText(
    "ambiguity-copy",
    tangent === null
      ? "With no horizontal run, the one-number ratio is undefined. atan2 can still use the component signs."
      : `atan returns ${format(simpleAtan!, 1)}° for both vectors. atan2 places them 180° apart.`,
  );

  const xInput = requiredElement<HTMLInputElement>("#x-input");
  const yInput = requiredElement<HTMLInputElement>("#y-input");
  if (document.activeElement !== xInput) xInput.value = format(state.x);
  if (document.activeElement !== yInput) yInput.value = format(state.y);

  if (announce) {
    setText("live-values", `X ${format(state.x)}, Y ${format(state.y)}, magnitude ${format(magnitude)}, direction ${angleText}`);
  }
};

const updateState = (next: VectorState, announce = false): void => {
  state = clampGraphCoordinates(next);
  render(announce);
};

const plot = requiredElement<SVGSVGElement>("#vector-plot");
const endpointHit = requiredElement<SVGCircleElement>("#endpoint-hit");

const updateFromPointer = (event: PointerEvent): void => {
  const point = plot.createSVGPoint();
  point.x = event.clientX;
  point.y = event.clientY;
  const matrix = plot.getScreenCTM();
  if (!matrix) return;
  const svgPoint = point.matrixTransform(matrix.inverse());
  updateState(graphToVector(svgPoint.x, svgPoint.y));
};

endpointHit.addEventListener("pointerdown", (event) => {
  hasDragged = true;
  requiredElement<HTMLElement>("#drag-prompt").classList.add("is-hidden");
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
  const delta: Record<string, VectorState> = {
    ArrowLeft: { x: -step, y: 0 },
    ArrowRight: { x: step, y: 0 },
    ArrowUp: { x: 0, y: step },
    ArrowDown: { x: 0, y: -step },
  };
  if (!delta[event.key]) return;
  event.preventDefault();
  updateState({ x: state.x + delta[event.key].x, y: state.y + delta[event.key].y }, true);
});

requiredElement<HTMLFormElement>("#component-form").addEventListener("input", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLInputElement) || target.value === "") return;
  const value = Number(target.value);
  if (!Number.isFinite(value)) return;
  updateState(target.name === "x" ? { ...state, x: value } : { ...state, y: value });
});

requiredElement<HTMLButtonElement>("#reset-button").addEventListener("click", () => {
  hasDragged = false;
  requiredElement<HTMLElement>("#drag-prompt").classList.remove("is-hidden");
  updateState({ x: 10, y: 5 }, true);
});

requiredElement<HTMLButtonElement>("#flip-button").addEventListener("click", () => {
  updateState({ x: -state.x, y: -state.y }, true);
});

document.querySelectorAll<HTMLButtonElement>(".lesson-tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    lesson = tab.dataset.lesson as Lesson;
    document.querySelectorAll<HTMLButtonElement>(".lesson-tab").forEach((button) => {
      const active = button === tab;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });
    requiredElement<HTMLElement>("#tangent-lesson").hidden = lesson !== "tangent";
    requiredElement<HTMLElement>("#quadrant-lesson").hidden = lesson !== "quadrants";
    render();
  });
});

window.setTimeout(() => {
  if (!hasDragged) requiredElement<HTMLElement>("#drag-prompt").classList.add("is-visible");
}, 650);

render();

