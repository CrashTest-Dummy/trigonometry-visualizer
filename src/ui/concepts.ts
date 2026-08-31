import {
  acosDegrees,
  asinDegrees,
  atan2Degrees,
  atanDegrees,
  cosineFromComponents,
  sineFromComponents,
  tangentFromComponents,
  vectorMagnitude,
} from "../math/trig";
import type { Lesson, Relation, VectorState } from "../visualization/vectorPlot";

export type ConceptDefinition = {
  id: string;
  name: string;
  cue: string;
  plainLanguage: string;
  formula: string;
  reciprocal: string | null;
  undefinedWhen: string;
  relatedLesson: Lesson;
  relation?: Relation;
};

export const CONCEPTS: readonly ConceptDefinition[] = [
  {
    id: "vector",
    name: "Vector",
    cue: "size plus direction",
    plainLanguage: "A vector combines an amount with a direction. Its X and Y components describe the same vector along two perpendicular axes.",
    formula: "vector = horizontal component + vertical component",
    reciprocal: null,
    undefinedWhen: "A zero vector still has a magnitude of zero, but it has no defined direction.",
    relatedLesson: "basics",
  },
  {
    id: "magnitude",
    name: "Magnitude",
    cue: "combined length",
    plainLanguage: "Magnitude is the straight-line length of the vector after its perpendicular components are combined.",
    formula: "R = √(X² + Y²)",
    reciprocal: null,
    undefinedWhen: "Magnitude is defined for every vector, including zero.",
    relatedLesson: "basics",
  },
  {
    id: "sine",
    name: "Sine",
    cue: "vertical share",
    plainLanguage: "Sine tells how much of the resultant points vertically on the axes shown.",
    formula: "sin(θ) = Y ÷ R",
    reciprocal: "Cosecant is its reciprocal: csc(θ) = R ÷ Y.",
    undefinedWhen: "Sine from components is undefined for the zero vector because there is no resultant length to divide by.",
    relatedLesson: "sine",
  },
  {
    id: "cosine",
    name: "Cosine",
    cue: "horizontal share",
    plainLanguage: "Cosine tells how much of the resultant points horizontally on the axes shown.",
    formula: "cos(θ) = X ÷ R",
    reciprocal: "Secant is its reciprocal: sec(θ) = R ÷ X.",
    undefinedWhen: "Cosine from components is undefined for the zero vector because there is no resultant length to divide by.",
    relatedLesson: "cosine",
  },
  {
    id: "tangent",
    name: "Tangent",
    cue: "rise per run",
    plainLanguage: "Tangent is the vector's steepness. It compares vertical change with horizontal change.",
    formula: "tan(θ) = Y ÷ X",
    reciprocal: "Cotangent reverses the comparison: cot(θ) = X ÷ Y.",
    undefinedWhen: "Tangent is undefined when X is zero. There is rise but no run.",
    relatedLesson: "tangent",
  },
  {
    id: "cotangent",
    name: "Cotangent",
    cue: "run per rise",
    plainLanguage: "Cotangent reverses tangent. It tells how many horizontal units occur for every vertical unit.",
    formula: "cot(θ) = X ÷ Y = 1 ÷ tan(θ)",
    reciprocal: "Cotangent and tangent are reciprocals when both are defined.",
    undefinedWhen: "Cotangent is undefined when Y is zero. There is run but no rise.",
    relatedLesson: "tangent",
  },
  {
    id: "secant",
    name: "Secant",
    cue: "resultant per horizontal",
    plainLanguage: "Secant compares the whole vector with its horizontal component. It is the reciprocal of cosine.",
    formula: "sec(θ) = R ÷ X = 1 ÷ cos(θ)",
    reciprocal: "Secant and cosine are reciprocals when both are defined.",
    undefinedWhen: "Secant is undefined when X is zero because cosine is zero.",
    relatedLesson: "cosine",
  },
  {
    id: "cosecant",
    name: "Cosecant",
    cue: "resultant per vertical",
    plainLanguage: "Cosecant compares the whole vector with its vertical component. It is the reciprocal of sine.",
    formula: "csc(θ) = R ÷ Y = 1 ÷ sin(θ)",
    reciprocal: "Cosecant and sine are reciprocals when both are defined.",
    undefinedWhen: "Cosecant is undefined when Y is zero because sine is zero.",
    relatedLesson: "sine",
  },
  {
    id: "arcsine",
    name: "Arcsine",
    cue: "vertical share to angle",
    plainLanguage: "Arcsine starts with a vertical-share ratio and returns its principal angle.",
    formula: "asin(Y ÷ R) = principal angle",
    reciprocal: null,
    undefinedWhen: "The input must be between −1 and 1. The principal result alone does not identify every quadrant.",
    relatedLesson: "inverse",
    relation: "sine",
  },
  {
    id: "arccosine",
    name: "Arccosine",
    cue: "horizontal share to angle",
    plainLanguage: "Arccosine starts with a horizontal-share ratio and returns its principal angle.",
    formula: "acos(X ÷ R) = principal angle",
    reciprocal: null,
    undefinedWhen: "The input must be between −1 and 1. Its principal range is 0° through 180°.",
    relatedLesson: "inverse",
    relation: "cosine",
  },
  {
    id: "arctangent",
    name: "Arctangent",
    cue: "steepness to angle",
    plainLanguage: "Arctangent starts with a rise-to-run ratio and returns its principal angle.",
    formula: "atan(Y ÷ X) = principal angle",
    reciprocal: null,
    undefinedWhen: "A simple ratio can lose the original signs, so arctangent alone cannot identify every quadrant.",
    relatedLesson: "inverse",
    relation: "tangent",
  },
  {
    id: "atan2",
    name: "atan2",
    cue: "signed components to direction",
    plainLanguage: "atan2 receives Y and X separately. Keeping both signs lets it place the vector in the correct quadrant on the displayed axes.",
    formula: "θ = atan2(Y, X)",
    reciprocal: null,
    undefinedWhen: "Direction is undefined when both X and Y are zero.",
    relatedLesson: "quadrants",
  },
  {
    id: "unit-circle",
    name: "Unit circle",
    cue: "ratios on a radius of one",
    plainLanguage: "On a circle with radius 1, the endpoint's X coordinate is cosine and its Y coordinate is sine.",
    formula: "x = cos(θ), y = sin(θ), R = 1",
    reciprocal: null,
    undefinedWhen: "Tangent and secant are undefined where X is zero. Cotangent and cosecant are undefined where Y is zero.",
    relatedLesson: "unit-circle",
  },
];

export const conceptById = (id: string): ConceptDefinition | undefined =>
  CONCEPTS.find((concept) => concept.id === id);

const format = (value: number): string =>
  (Math.abs(value) < 0.0005 ? 0 : value).toFixed(3);

export const conceptValue = (id: string, vector: VectorState): string => {
  const magnitude = vectorMagnitude(vector.x, vector.y);
  const sine = sineFromComponents(vector.x, vector.y);
  const cosine = cosineFromComponents(vector.x, vector.y);
  const tangent = tangentFromComponents(vector.x, vector.y);
  if (id === "vector") return `Current vector: X ${format(vector.x)}, Y ${format(vector.y)}`;
  if (id === "magnitude") return `Current magnitude: ${format(magnitude)}`;
  if (id === "sine") return sine === null ? "Current value: undefined" : `Current value: ${format(sine)}`;
  if (id === "cosine") return cosine === null ? "Current value: undefined" : `Current value: ${format(cosine)}`;
  if (id === "tangent") return tangent === null ? "Current value: undefined" : `Current value: ${format(tangent)}`;
  if (id === "cotangent") return Math.abs(vector.y) < 1e-10 ? "Current value: undefined" : `Current value: ${format(vector.x / vector.y)}`;
  if (id === "secant") return Math.abs(vector.x) < 1e-10 ? "Current value: undefined" : `Current value: ${format(magnitude / vector.x)}`;
  if (id === "cosecant") return Math.abs(vector.y) < 1e-10 ? "Current value: undefined" : `Current value: ${format(magnitude / vector.y)}`;
  if (id === "arcsine") {
    const result = sine === null ? null : asinDegrees(sine);
    return result === null ? "Current result: undefined" : `Current principal result: ${format(result)}°`;
  }
  if (id === "arccosine") {
    const result = cosine === null ? null : acosDegrees(cosine);
    return result === null ? "Current result: undefined" : `Current principal result: ${format(result)}°`;
  }
  if (id === "arctangent") return tangent === null ? "Current result: undefined" : `Current principal result: ${format(atanDegrees(tangent))}°`;
  if (id === "atan2") {
    const angle = atan2Degrees(vector.y, vector.x);
    return angle === null ? "Current direction: undefined" : `Current direction: ${format(angle)}°`;
  }
  return `Current point: (${format(vector.x)}, ${format(vector.y)})`;
};

export const conceptDialogMarkup = (): string => `
  <dialog class="concept-dialog" id="concept-dialog" aria-labelledby="concept-dialog-title">
    <div class="concept-dialog-shell">
      <header class="concept-dialog-header">
        <div><p class="eyebrow">Plain-language help</p><h2 id="concept-dialog-title">What do you want to understand?</h2></div>
        <button type="button" class="concept-dialog-close" data-action="close-concepts" aria-label="Close concept help">×</button>
      </header>
      <div class="concept-dialog-body">
        <nav class="concept-list" aria-label="Choose a concept">
          ${CONCEPTS.map((concept) => `<button type="button" data-concept="${concept.id}"><strong>${concept.name}</strong><small>${concept.cue}</small></button>`).join("")}
        </nav>
        <article class="concept-detail" id="concept-detail" aria-live="polite">
          <p class="concept-empty">Choose any term. The explanation will appear here without changing your course progress.</p>
        </article>
      </div>
    </div>
  </dialog>
`;

export const conceptDetailMarkup = (concept: ConceptDefinition, vector: VectorState): string => `
  <p class="card-kicker">${concept.cue}</p>
  <h3>${concept.name}</h3>
  <p class="concept-plain">${concept.plainLanguage}</p>
  <code class="concept-formula">${concept.formula}</code>
  <strong class="concept-current">${conceptValue(concept.id, vector)}</strong>
  ${concept.reciprocal ? `<p class="concept-reciprocal"><b>Reciprocal relationship</b>${concept.reciprocal}</p>` : ""}
  <p class="concept-edge"><b>Watch for this</b>${concept.undefinedWhen}</p>
  <button type="button" class="concept-lesson-link" data-concept-lesson="${concept.relatedLesson}"${concept.relation ? ` data-concept-relation="${concept.relation}"` : ""}>Open the related lesson</button>
`;
