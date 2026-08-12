import {
  acosDegrees,
  asinDegrees,
  atan2Degrees,
  atanDegrees,
  cosineFromComponents,
  displayAngle,
  getQuadrant,
  sineFromComponents,
  tangentFromComponents,
  vectorMagnitude,
  type AngleDisplayMode,
} from "../math/trig";
import type { Lesson, Relation, VectorState } from "../visualization/vectorPlot";

export type LessonDefinition = {
  id: Lesson;
  number: string;
  shortLabel: string;
};

export const LESSONS: LessonDefinition[] = [
  { id: "basics", number: "01", shortLabel: "Triangle basics" },
  { id: "sine", number: "02", shortLabel: "Sine" },
  { id: "cosine", number: "03", shortLabel: "Cosine" },
  { id: "tangent", number: "04", shortLabel: "Tangent" },
  { id: "inverse", number: "05", shortLabel: "Inverse trig" },
  { id: "quadrants", number: "06", shortLabel: "atan2" },
  { id: "unit-circle", number: "07", shortLabel: "Unit circle" },
  { id: "delta-v", number: "08", shortLabel: "Delta-V / PDOF" },
];

export type LessonContext = {
  vector: VectorState;
  angleMode: AngleDisplayMode;
  relation: Relation;
  units: "mph" | "km/h";
};

const equation = (content: string): string => `<p class="live-equation">${content}</p>`;

const explanation = (icon: string, content: string, className = ""): string => `
  <div class="plain-english ${className}">
    <span aria-hidden="true">${icon}</span><p>${content}</p>
  </div>
`;

const ratioBlock = (
  numeratorClass: string,
  numeratorName: string,
  numeratorSlot: string,
  denominatorClass: string,
  denominatorName: string,
  denominatorSlot: string,
  resultSlot: string,
  resultName: string,
): string => `
  <div class="ratio-visual" aria-label="Live side ratio">
    <div class="ratio-top ${numeratorClass}"><span class="mini-line"></span><strong data-value="${numeratorSlot}">—</strong><small>${numeratorName}</small></div>
    <div class="fraction-bar"></div>
    <div class="ratio-bottom ${denominatorClass}"><span class="mini-line"></span><strong data-value="${denominatorSlot}">—</strong><small>${denominatorName}</small></div>
    <div class="ratio-equals">=</div>
    <div class="ratio-result"><strong data-value="${resultSlot}">—</strong><small>${resultName}</small></div>
  </div>
`;

const inverseSelector = (active: Relation): string => `
  <div class="inverse-selector" role="group" aria-label="Choose an inverse function">
    <button type="button" data-relation="sine" aria-pressed="${active === "sine"}">sin<sup>−1</sup></button>
    <button type="button" data-relation="cosine" aria-pressed="${active === "cosine"}">cos<sup>−1</sup></button>
    <button type="button" data-relation="tangent" aria-pressed="${active === "tangent"}">tan<sup>−1</sup></button>
  </div>
`;

export const lessonMarkup = (lesson: Lesson, relation: Relation): string => {
  if (lesson === "basics") return `
    <section class="lesson-content" aria-labelledby="lesson-title">
      <div class="lesson-heading"><p class="card-kicker">Start with the geometry</p><h2 id="lesson-title">A vector is a <em>right triangle.</em></h2><p>X and Y are perpendicular components. The resultant is the straight-line distance created when they act together.</p></div>
      <div class="side-key"><div class="key-x"><span>—</span><strong>Adjacent</strong><small>horizontal projection</small></div><div class="key-y"><span>┊</span><strong>Opposite</strong><small>vertical projection</small></div><div class="key-r"><span>↗</span><strong>Hypotenuse</strong><small>resultant vector</small></div></div>
      <div class="equation-card"><small>Pythagorean relationship</small>${equation(`<span class="r-text">R</span> = √(<span class="x-text">X²</span> + <span class="y-text">Y²</span>)`)}${equation(`<span class="r-text" data-value="r">—</span> = √(<span class="x-text" data-value="x2">—</span> + <span class="y-text" data-value="y2">—</span>)`)}</div>
      ${explanation("◇", `<strong>Why a square root?</strong> X² and Y² turn perpendicular distances into comparable areas. Adding those areas gives R²; the square root returns to an ordinary length.`)}
    </section>`;

  if (lesson === "sine") return `
    <section class="lesson-content" aria-labelledby="lesson-title">
      <div class="lesson-heading"><p class="card-kicker">Vertical share of the vector</p><h2 id="lesson-title">Sine measures <em>height.</em></h2><p>Sine tells us what signed fraction of the resultant lies along the vertical direction.</p></div>
      ${ratioBlock("ratio-y", "opposite · Y", "y", "ratio-r", "hypotenuse · R", "r", "sin", "vertical share")}
      <div class="equation-stack"><div class="equation-step"><span class="step-number">1</span><div><small>Compare vertical component to the whole</small>${equation(`sin(<mark class="angle-text" data-value="angle">—</mark>) = <span class="y-text" data-value="y">—</span> ÷ <span class="r-text" data-value="r">—</span>`)}</div></div><div class="equation-step"><span class="step-number">2</span><div><small>Reverse the ratio to recover a principal angle</small>${equation(`asin(<strong data-value="sin">—</strong>) = <mark class="angle-text" data-value="asin">—</mark>`)}</div></div></div>
      ${explanation("↕", `<strong>Read it plainly:</strong> the vertical component is <b data-value="sin-percent">—</b> of the vector’s length. The sign tells whether it projects above or below the X-axis.`)}
    </section>`;

  if (lesson === "cosine") return `
    <section class="lesson-content" aria-labelledby="lesson-title">
      <div class="lesson-heading"><p class="card-kicker">Horizontal share of the vector</p><h2 id="lesson-title">Cosine measures <em>reach.</em></h2><p>Cosine tells us what signed fraction of the resultant lies along the horizontal direction.</p></div>
      ${ratioBlock("ratio-x", "adjacent · X", "x", "ratio-r", "hypotenuse · R", "r", "cos", "horizontal share")}
      <div class="equation-stack"><div class="equation-step"><span class="step-number">1</span><div><small>Compare horizontal component to the whole</small>${equation(`cos(<mark class="angle-text" data-value="angle">—</mark>) = <span class="x-text" data-value="x">—</span> ÷ <span class="r-text" data-value="r">—</span>`)}</div></div><div class="equation-step"><span class="step-number">2</span><div><small>Reverse the ratio to recover a principal angle</small>${equation(`acos(<strong data-value="cos">—</strong>) = <mark class="angle-text" data-value="acos">—</mark>`)}</div></div></div>
      ${explanation("↔", `<strong>Read it plainly:</strong> the horizontal component is <b data-value="cos-percent">—</b> of the vector’s length. A negative value means the projection points toward −X.`)}
    </section>`;

  if (lesson === "tangent") return `
    <section class="lesson-content" aria-labelledby="lesson-title">
      <div class="lesson-heading"><p class="card-kicker">Rise compared with run</p><h2 id="lesson-title">Tangent is <em>steepness.</em></h2><p>For every unit the vector moves horizontally, tangent tells us how many units it moves vertically.</p></div>
      ${ratioBlock("ratio-y", "rise · Y", "y", "ratio-x", "run · X", "x", "tan", "rise per 1 run")}
      <div class="equation-stack"><div class="equation-step"><span class="step-number">1</span><div><small>Turn the two components into a slope</small>${equation(`tan(<mark class="angle-text" data-value="angle">—</mark>) = <span class="y-text" data-value="y">—</span> ÷ <span class="x-text" data-value="x">—</span> = <strong data-value="tan">—</strong>`)}</div></div><div class="equation-step"><span class="step-number">2</span><div><small>Ask the slope question in reverse</small>${equation(`atan(<strong data-value="tan">—</strong>) = <mark class="angle-text" data-value="atan">—</mark>`)}</div></div></div>
      ${explanation("↗", `<strong>Read it plainly:</strong> this line changes <b data-value="tan-absolute">—</b> vertical units for every 1 horizontal unit.`, "tangent-explanation")}
    </section>`;

  if (lesson === "inverse") {
    const names = relation === "sine"
      ? { title: "Arcsine", ratio: "Y ÷ R", functionName: "asin", ratioSlot: "sin", resultSlot: "asin", question: "vertical-share" }
      : relation === "cosine"
        ? { title: "Arccosine", ratio: "X ÷ R", functionName: "acos", ratioSlot: "cos", resultSlot: "acos", question: "horizontal-share" }
        : { title: "Arctangent", ratio: "Y ÷ X", functionName: "atan", ratioSlot: "tan", resultSlot: "atan", question: "rise-to-run" };
    return `
      <section class="lesson-content" aria-labelledby="lesson-title">
        <div class="lesson-heading"><p class="card-kicker">Run the relationship backward</p><h2 id="lesson-title">${names.title} recovers an <em>angle.</em></h2><p>Forward trig turns an angle into a ratio. Inverse trig starts with a ratio and asks which principal angle creates it.</p></div>
        ${inverseSelector(relation)}
        <div class="inverse-question"><small>The reverse question</small><p>If the <strong>${names.question}</strong> ratio is <b data-value="${names.ratioSlot}">—</b>, what principal angle creates it?</p></div>
        <div class="equation-card"><small>Live inverse calculation</small>${equation(`${names.functionName}(${names.ratio}) = ${names.functionName}(<strong data-value="${names.ratioSlot}">—</strong>)`)}${equation(`principal angle = <mark class="angle-text" data-value="${names.resultSlot}">—</mark>`)}</div>
        <div class="principal-compare"><div><small>Principal inverse result</small><strong data-value="${names.resultSlot}">—</strong></div><span aria-hidden="true">→</span><div><small>Full vector direction</small><strong data-value="angle">—</strong></div></div>
        ${explanation("↩", `<strong>Important:</strong> a single ratio may fit more than one direction. Inverse functions return a limited principal range; component signs and <code>atan2</code> recover the full quadrant.`, "inverse-note")}
      </section>`;
  }

  if (lesson === "quadrants") return `
    <section class="lesson-content" aria-labelledby="lesson-title">
      <div class="lesson-heading"><p class="card-kicker">Why two inputs matter</p><h2 id="lesson-title"><code>atan</code> loses the <em>quadrant.</em></h2><p>A ratio remembers steepness, but dividing two negative components erases both signs. <code>atan2(y, x)</code> keeps them.</p></div>
      <div class="sign-grid"><div><small>X sign</small><strong class="x-text" data-value="x-sign">—</strong></div><div><small>Y sign</small><strong class="y-text" data-value="y-sign">—</strong></div><div><small>Location</small><strong data-value="quadrant">—</strong></div></div>
      <div class="comparison"><div class="comparison-row"><span class="method-label">atan(y ÷ x)</span><code data-value="atan-equation">—</code><strong data-value="atan">—</strong><small>ratio only</small></div><div class="comparison-row recommended"><span class="method-label">atan2(y, x)</span><code data-value="atan2-equation">—</code><strong data-value="angle">—</strong><small>both signs</small></div></div>
      <div class="ambiguity-demo"><div class="ambiguity-heading"><p class="card-kicker">Same ratio, opposite direction</p><button type="button" data-action="flip">Flip vector 180° <span aria-hidden="true">↻</span></button></div><div class="opposite-row"><div><small>Current</small><strong data-value="pair">—</strong><span data-value="ratio-label">—</span></div><div class="direction-arrow">⇄</div><div><small>Opposite</small><strong data-value="opposite-pair">—</strong><span data-value="ratio-label">—</span></div></div><p data-value="ambiguity">—</p></div>
      ${explanation("◎", `<strong>Think of it this way:</strong> slope tells you the tilt of a road. The signs of X and Y tell you which direction you are traveling on it.`)}
    </section>`;

  if (lesson === "unit-circle") return `
    <section class="lesson-content" aria-labelledby="lesson-title">
      <div class="lesson-heading"><p class="card-kicker">One special radius</p><h2 id="lesson-title">On the unit circle, <em>R = 1.</em></h2><p>Dividing by a hypotenuse of 1 changes nothing. The endpoint’s coordinates become cosine and sine themselves.</p></div>
      <div class="unit-identity"><div class="key-x"><small>horizontal coordinate</small><strong>x = cos(θ)</strong><b data-value="cos">—</b></div><div class="key-y"><small>vertical coordinate</small><strong>y = sin(θ)</strong><b data-value="sin">—</b></div></div>
      <div class="equation-stack"><div class="equation-step"><span class="step-number">1</span><div><small>Cosine on a radius of one</small>${equation(`cos(<mark class="angle-text" data-value="angle">—</mark>) = <span class="x-text" data-value="x">—</span> ÷ 1 = <strong data-value="cos">—</strong>`)}</div></div><div class="equation-step"><span class="step-number">2</span><div><small>Sine on a radius of one</small>${equation(`sin(<mark class="angle-text" data-value="angle">—</mark>) = <span class="y-text" data-value="y">—</span> ÷ 1 = <strong data-value="sin">—</strong>`)}</div></div><div class="equation-step"><span class="step-number">3</span><div><small>Tangent still compares the coordinates</small>${equation(`tan(θ) = y ÷ x = <strong data-value="tan">—</strong>`)}</div></div></div>
      ${explanation("○", `<strong>Rotate the endpoint:</strong> sine and cosine are not arbitrary calculator outputs. They are the changing Y and X coordinates of a point moving around a radius-one circle.`)}
    </section>`;

  return `
    <section class="lesson-content delta-lesson" aria-labelledby="lesson-title">
      <div class="lesson-heading"><p class="card-kicker">Crash-reconstruction connection</p><h2 id="lesson-title">Components become a <em>Delta-V vector.</em></h2><p>Relabel the same geometry: longitudinal and lateral Delta-V combine into a resultant magnitude and direction.</p></div>
      <div class="unit-control"><label for="unit-select">Display units</label><select id="unit-select"><option value="mph">mph</option><option value="km/h">km/h</option></select><button type="button" data-action="delta-example">Load −18, 7 example</button></div>
      <div class="equation-card delta-equations"><small>Resultant magnitude</small>${equation(`<span class="r-text">R</span> = √((<span class="x-text" data-value="x">—</span>)² + (<span class="y-text" data-value="y">—</span>)²)`)}${equation(`<span class="r-text" data-value="r">—</span> <b data-value="units">mph</b>`)}<small>Quadrant-aware direction</small>${equation(`θ = atan2(<span class="y-text" data-value="y">—</span>, <span class="x-text" data-value="x">—</span>) = <mark class="angle-text" data-value="angle">—</mark>`)}</div>
      <div class="convention-card"><p class="card-kicker">Convention shown</p><strong>Standard mathematical display—no PDOF conversion</strong><ul><li>+X points right; +Y points up.</li><li>0° is +X; positive angles are counterclockwise.</li><li>Entered values are generic signed components.</li></ul><p>For comparison, U.S. EDR rules define longitudinal positive as forward and lateral positive from the driver’s left to right. A source system may report or transform direction differently.</p><a href="https://www.govinfo.gov/link/cfr/49/563?link-type=pdf&sectionnum=5&year=mostrecent" target="_blank" rel="noreferrer">Read 49 CFR §563.5 definitions ↗</a></div>
      ${explanation("!", `<strong>Educational use only.</strong> Do not treat this angle as an authoritative case-specific PDOF. Follow validated tools, applicable standards, agency procedures, manufacturer documentation, and the relevant EDR report.`, "warning-note")}
    </section>`;
};

const format = (value: number, digits = 2): string => {
  const safe = Math.abs(value) < 0.0005 ? 0 : value;
  return safe.toFixed(digits);
};

const angleText = (value: number | null, mode: AngleDisplayMode): string =>
  value === null ? "undefined" : `${format(displayAngle(value, mode), 1)}°`;

const pairText = (x: number, y: number): string =>
  `(${format(x).replace("-", "−")}, ${format(y).replace("-", "−")})`;

const signText = (value: number): string => value === 0 ? "zero" : value > 0 ? "positive +" : "negative −";

export const updateLessonValues = (root: HTMLElement, context: LessonContext): void => {
  const { vector, angleMode } = context;
  const magnitude = vectorMagnitude(vector.x, vector.y);
  const angle = atan2Degrees(vector.y, vector.x);
  const sine = sineFromComponents(vector.x, vector.y);
  const cosine = cosineFromComponents(vector.x, vector.y);
  const tangent = tangentFromComponents(vector.x, vector.y);
  const asin = sine === null ? null : asinDegrees(sine);
  const acos = cosine === null ? null : acosDegrees(cosine);
  const atan = tangent === null ? null : atanDegrees(tangent);
  const values: Record<string, string> = {
    x: format(vector.x),
    y: format(vector.y),
    r: format(magnitude),
    x2: format(vector.x ** 2),
    y2: format(vector.y ** 2),
    angle: angleText(angle, angleMode),
    sin: sine === null ? "undefined" : format(sine, 3),
    cos: cosine === null ? "undefined" : format(cosine, 3),
    tan: tangent === null ? "undefined" : format(tangent, 3),
    asin: angleText(asin, "signed"),
    acos: angleText(acos, "unsigned"),
    atan: angleText(atan, "signed"),
    "sin-percent": sine === null ? "undefined" : `${format(sine * 100, 1)}%`,
    "cos-percent": cosine === null ? "undefined" : `${format(cosine * 100, 1)}%`,
    "tan-absolute": tangent === null ? "undefined" : format(Math.abs(tangent), 2),
    "x-sign": signText(vector.x),
    "y-sign": signText(vector.y),
    quadrant: getQuadrant(vector.x, vector.y),
    "atan-equation": tangent === null ? "atan(y ÷ 0)" : `atan(${format(vector.y)} ÷ ${format(vector.x)})`,
    "atan2-equation": `atan2(${format(vector.y)}, ${format(vector.x)})`,
    pair: pairText(vector.x, vector.y),
    "opposite-pair": pairText(-vector.x, -vector.y),
    "ratio-label": tangent === null ? "ratio undefined" : `ratio ${format(tangent, 3)}`,
    ambiguity: tangent === null
      ? "With no horizontal run, the ratio is undefined. atan2 can still use both components."
      : `atan returns ${angleText(atan, "signed")} for both vectors; atan2 places their directions 180° apart.`,
    units: context.units,
  };

  root.querySelectorAll<HTMLElement>("[data-value]").forEach((element) => {
    const key = element.dataset.value;
    if (key && values[key] !== undefined) element.textContent = values[key];
  });

  root.querySelector(".tangent-explanation")?.classList.toggle("is-undefined", tangent === null);
  root.querySelectorAll<HTMLButtonElement>("[data-relation]").forEach((button) => {
    button.setAttribute("aria-pressed", String(button.dataset.relation === context.relation));
  });
  const unitSelect = root.querySelector<HTMLSelectElement>("#unit-select");
  if (unitSelect) unitSelect.value = context.units;
};
