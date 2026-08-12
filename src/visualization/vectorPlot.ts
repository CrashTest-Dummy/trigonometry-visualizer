import { angleFromCoordinates, displayAngle, vectorMagnitude, type AngleDisplayMode } from "../math/trig";

export type VectorState = { x: number; y: number };
export type Lesson = "basics" | "sine" | "cosine" | "tangent" | "inverse" | "quadrants" | "unit-circle" | "delta-v";
export type Relation = "sine" | "cosine" | "tangent";
export type PlotOptions = {
  lesson: Lesson;
  relation: Relation;
  angleMode: AngleDisplayMode;
};

const VIEW_WIDTH = 680;
const VIEW_HEIGHT = 560;
const ORIGIN_X = VIEW_WIDTH / 2;
const ORIGIN_Y = VIEW_HEIGHT / 2;
const SCALE = 13.5;
const UNIT_CIRCLE_SCALE = 215;
const MAX_X = 20;
const MAX_Y = 15;

const gridLines = (): string => {
  const lines: string[] = [];
  for (let x = -23; x <= 23; x += 1) {
    if (x === 0) continue;
    const px = ORIGIN_X + x * SCALE;
    lines.push(`<line x1="${px}" y1="20" x2="${px}" y2="540" />`);
  }
  for (let y = -19; y <= 19; y += 1) {
    if (y === 0) continue;
    const py = ORIGIN_Y - y * SCALE;
    lines.push(`<line x1="20" y1="${py}" x2="660" y2="${py}" />`);
  }
  return lines.join("");
};

const axisTicks = (): string => {
  const ticks: string[] = [];
  for (let x = -20; x <= 20; x += 5) {
    if (x === 0) continue;
    const px = ORIGIN_X + x * SCALE;
    ticks.push(`<line x1="${px}" y1="276" x2="${px}" y2="284" /><text x="${px}" y="300">${x}</text>`);
  }
  for (let y = -15; y <= 15; y += 5) {
    if (y === 0) continue;
    const py = ORIGIN_Y - y * SCALE;
    ticks.push(`<line x1="336" y1="${py}" x2="344" y2="${py}" /><text x="328" y="${py + 4}" class="y-tick">${y}</text>`);
  }
  return ticks.join("");
};

export const createPlotMarkup = (): string => `
  <svg id="vector-plot" class="vector-plot" viewBox="0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}" role="img" aria-labelledby="plot-title plot-description">
    <title id="plot-title">Interactive vector and right triangle</title>
    <desc id="plot-description">Drag the endpoint or use arrow keys to change the X and Y components. Blue is horizontal, coral is vertical, and green is the resultant.</desc>
    <defs>
      <marker id="x-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" /></marker>
      <marker id="y-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" /></marker>
      <marker id="r-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" /></marker>
      <marker id="axis-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" /></marker>
      <clipPath id="plot-clip"><rect x="20" y="20" width="640" height="520" rx="16" /></clipPath>
    </defs>
    <g class="quadrant-wash" clip-path="url(#plot-clip)">
      <rect x="340" y="20" width="320" height="260" class="q1" />
      <rect x="20" y="20" width="320" height="260" class="q2" />
      <rect x="20" y="280" width="320" height="260" class="q3" />
      <rect x="340" y="280" width="320" height="260" class="q4" />
    </g>
    <g class="grid-lines">${gridLines()}</g>
    <g class="axis-lines">
      <line x1="20" y1="280" x2="660" y2="280" marker-end="url(#axis-arrow)" />
      <line x1="340" y1="540" x2="340" y2="20" marker-end="url(#axis-arrow)" />
    </g>
    <g class="axis-ticks">${axisTicks()}</g>
    <g class="unit-axis-ticks" aria-hidden="true">
      <text x="555" y="300">+1</text><text x="125" y="300">−1</text>
      <text x="328" y="69" class="y-tick">+1</text><text x="328" y="499" class="y-tick">−1</text>
    </g>
    <g class="quadrant-labels" aria-hidden="true">
      <text x="628" y="49">QI</text><text x="44" y="49">QII</text><text x="44" y="523">QIII</text><text x="620" y="523">QIV</text>
      <text x="646" y="302" class="axis-name">+X</text><text x="350" y="35" class="axis-name">+Y</text>
    </g>
    <g id="dynamic-circle" clip-path="url(#plot-clip)"><circle id="reference-circle" cx="340" cy="280" r="257" /></g>
    <g id="angle-group">
      <path id="angle-arc" d="" />
      <text id="angle-label" x="390" y="260">θ 26.6°</text>
    </g>
    <g id="triangle-group">
      <line id="x-component" x1="340" y1="280" x2="570" y2="280" marker-end="url(#x-arrow)" />
      <line id="y-component" x1="570" y1="280" x2="570" y2="165" marker-end="url(#y-arrow)" />
      <path id="right-angle" d="" />
      <line id="resultant" x1="340" y1="280" x2="570" y2="165" marker-end="url(#r-arrow)" />
      <text id="x-label" class="component-label x-label" x="455" y="304">X = 10.00</text>
      <text id="y-label" class="component-label y-label" x="582" y="224">Y = 5.00</text>
      <text id="r-label" class="component-label r-label" x="455" y="212">R = 11.18</text>
    </g>
    <circle class="origin-dot" cx="340" cy="280" r="5" />
    <g id="endpoint" transform="translate(570 165)">
      <circle class="endpoint-pulse" r="19" />
      <circle class="endpoint-dot" r="9" />
      <circle id="endpoint-hit" class="endpoint-hit" r="27" tabindex="0" role="slider" aria-label="Vector endpoint. Use arrow keys to adjust X and Y." aria-valuetext="X 10, Y 5" />
    </g>
    <text id="coordinate-label" class="coordinate-label" x="588" y="146">(10.00, 5.00)</text>
  </svg>
`;

export const clampGraphCoordinates = ({ x, y }: VectorState): VectorState => ({
  x: Math.max(-MAX_X, Math.min(MAX_X, x)),
  y: Math.max(-MAX_Y, Math.min(MAX_Y, y)),
});

export const graphToVector = (svgX: number, svgY: number): VectorState =>
  clampGraphCoordinates({
    x: (svgX - ORIGIN_X) / SCALE,
    y: (ORIGIN_Y - svgY) / SCALE,
  });

const point = (state: VectorState, scale = SCALE): { x: number; y: number } => ({
  x: ORIGIN_X + state.x * scale,
  y: ORIGIN_Y - state.y * scale,
});

const required = <T extends SVGElement>(id: string): T => {
  const element = document.querySelector<T>(`#${id}`);
  if (!element) throw new Error(`SVG element not found: ${id}`);
  return element;
};

const setAttributes = (element: SVGElement, attributes: Record<string, string | number>): void => {
  Object.entries(attributes).forEach(([name, value]) => element.setAttribute(name, String(value)));
};

const angleArcPath = (degrees: number, radius = 54): string => {
  const radians = (degrees * Math.PI) / 180;
  const endX = ORIGIN_X + radius * Math.cos(radians);
  const endY = ORIGIN_Y - radius * Math.sin(radians);
  const largeArc = degrees > 180 ? 1 : 0;
  return `M ${ORIGIN_X + radius} ${ORIGIN_Y} A ${radius} ${radius} 0 ${largeArc} 0 ${endX} ${endY}`;
};

const labelPosition = (
  a: { x: number; y: number },
  b: { x: number; y: number },
  offsetX: number,
  offsetY: number,
): { x: number; y: number } => ({
  x: (a.x + b.x) / 2 + offsetX,
  y: (a.y + b.y) / 2 + offsetY,
});

export const renderVector = (state: VectorState, options: PlotOptions): void => {
  const renderScale = options.lesson === "unit-circle" ? UNIT_CIRCLE_SCALE : SCALE;
  const endpoint = point(state, renderScale);
  const magnitude = vectorMagnitude(state.x, state.y);
  const angle = angleFromCoordinates(state.x, state.y);
  const foot = { x: endpoint.x, y: ORIGIN_Y };
  const origin = { x: ORIGIN_X, y: ORIGIN_Y };
  const format = (value: number, digits = 2): string => (Math.abs(value) < 0.0005 ? 0 : value).toFixed(digits);

  setAttributes(required("x-component"), { x2: foot.x, y2: foot.y });
  setAttributes(required("y-component"), { x1: foot.x, y1: foot.y, x2: endpoint.x, y2: endpoint.y });
  setAttributes(required("resultant"), { x2: endpoint.x, y2: endpoint.y });
  setAttributes(required("endpoint"), { transform: `translate(${endpoint.x} ${endpoint.y})` });
  setAttributes(required("reference-circle"), { r: magnitude * renderScale });

  const towardOrigin = state.x >= 0 ? -1 : 1;
  const towardEndpoint = state.y >= 0 ? -1 : 1;
  const markerSize = 14;
  required<SVGPathElement>("right-angle").setAttribute(
    "d",
    `M ${foot.x + towardOrigin * markerSize} ${foot.y} L ${foot.x + towardOrigin * markerSize} ${foot.y + towardEndpoint * markerSize} L ${foot.x} ${foot.y + towardEndpoint * markerSize}`,
  );

  if (angle === null) {
    required<SVGPathElement>("angle-arc").setAttribute("d", "");
    required<SVGTextElement>("angle-label").textContent = "θ undefined";
  } else {
    required<SVGPathElement>("angle-arc").setAttribute("d", angleArcPath(angle));
    const labelRadians = (((angle > 340 ? 340 : angle) / 2) * Math.PI) / 180;
    setAttributes(required("angle-label"), {
      x: ORIGIN_X + 76 * Math.cos(labelRadians),
      y: ORIGIN_Y - 76 * Math.sin(labelRadians),
    });
    required<SVGTextElement>("angle-label").textContent = `θ ${format(displayAngle(angle, options.angleMode), 1)}°`;
  }

  const xLabel = labelPosition(origin, foot, 0, state.y >= 0 ? 25 : -13);
  const yLabel = labelPosition(foot, endpoint, state.x >= 0 ? 16 : -16, 5);
  const perpendicularOffset = magnitude === 0 ? { x: 0, y: 0 } : {
    x: (-state.y / magnitude) * 23,
    y: (-state.x / magnitude) * 23,
  };
  const rLabel = labelPosition(origin, endpoint, perpendicularOffset.x, perpendicularOffset.y);
  setAttributes(required("x-label"), xLabel);
  setAttributes(required("y-label"), yLabel);
  setAttributes(required("r-label"), rLabel);
  const deltaMode = options.lesson === "delta-v";
  const unitCircleMode = options.lesson === "unit-circle";
  required<SVGTextElement>("x-label").textContent = unitCircleMode
    ? `x = cos θ = ${format(state.x)}`
    : `${deltaMode ? "ΔVx" : "X"} = ${format(state.x)}`;
  required<SVGTextElement>("y-label").textContent = unitCircleMode
    ? `y = sin θ = ${format(state.y)}`
    : `${deltaMode ? "ΔVy" : "Y"} = ${format(state.y)}`;
  required<SVGTextElement>("r-label").textContent = `${deltaMode ? "Resultant" : unitCircleMode ? "R" : "R"} = ${format(magnitude)}`;
  required<SVGTextElement>("y-label").setAttribute("text-anchor", state.x >= 0 ? "start" : "end");
  required<SVGTextElement>("r-label").setAttribute("text-anchor", "middle");

  const coordinateX = endpoint.x + (state.x >= 0 ? 18 : -18);
  const coordinateY = endpoint.y + (state.y >= 0 ? -18 : 28);
  setAttributes(required("coordinate-label"), { x: coordinateX, y: coordinateY });
  required<SVGTextElement>("coordinate-label").setAttribute("text-anchor", state.x >= 0 ? "start" : "end");
  required<SVGTextElement>("coordinate-label").textContent = `(${format(state.x)}, ${format(state.y)})`;
  required<SVGCircleElement>("endpoint-hit").setAttribute("aria-valuetext", `X ${format(state.x)}, Y ${format(state.y)}`);

  const plot = required<SVGSVGElement>("vector-plot");
  plot.dataset.lesson = options.lesson;
  plot.dataset.relation = options.lesson === "inverse" ? options.relation : options.lesson;
  required<SVGTitleElement>("plot-title").textContent = deltaMode
    ? "Longitudinal and lateral Delta-V components with resultant vector"
    : unitCircleMode
      ? "Unit circle with cosine and sine endpoint coordinates"
      : "Interactive vector and right triangle";
};
