export const TRIG_EPSILON = 1e-10;

export type AngleDisplayMode = "unsigned" | "signed";

export const degreesToRadians = (degrees: number): number =>
  (degrees * Math.PI) / 180;

export const radiansToDegrees = (radians: number): number =>
  (radians * 180) / Math.PI;

export const vectorMagnitude = (x: number, y: number): number =>
  Math.hypot(x, y);

export const normalizeDegrees360 = (degrees: number): number => {
  const normalized = ((degrees % 360) + 360) % 360;
  return Math.abs(normalized) < TRIG_EPSILON ? 0 : normalized;
};

export const normalizeDegreesSigned = (degrees: number): number => {
  const normalized = normalizeDegrees360(degrees);
  return normalized > 180 ? normalized - 360 : normalized;
};

export const displayAngle = (
  degrees: number,
  mode: AngleDisplayMode,
): number => mode === "signed" ? normalizeDegreesSigned(degrees) : normalizeDegrees360(degrees);

export const angleFromCoordinates = (x: number, y: number): number | null =>
  Math.abs(x) < TRIG_EPSILON && Math.abs(y) < TRIG_EPSILON
    ? null
    : normalizeDegrees360(radiansToDegrees(Math.atan2(y, x)));

export const coordinatesFromAngle = (
  degrees: number,
  magnitude: number,
): { x: number; y: number } => {
  const radians = degreesToRadians(degrees);
  const x = magnitude * Math.cos(radians);
  const y = magnitude * Math.sin(radians);
  return {
    x: Math.abs(x) < TRIG_EPSILON ? 0 : x,
    y: Math.abs(y) < TRIG_EPSILON ? 0 : y,
  };
};

export const sineFromComponents = (x: number, y: number): number | null => {
  const magnitude = vectorMagnitude(x, y);
  return magnitude < TRIG_EPSILON ? null : y / magnitude;
};

export const cosineFromComponents = (x: number, y: number): number | null => {
  const magnitude = vectorMagnitude(x, y);
  return magnitude < TRIG_EPSILON ? null : x / magnitude;
};

export const tangentFromComponents = (x: number, y: number): number | null =>
  Math.abs(x) < TRIG_EPSILON ? null : y / x;

const validUnitRatio = (ratio: number): number | null => {
  if (!Number.isFinite(ratio) || ratio < -1 - TRIG_EPSILON || ratio > 1 + TRIG_EPSILON) {
    return null;
  }
  return Math.max(-1, Math.min(1, ratio));
};

export const asinDegrees = (ratio: number): number | null => {
  const valid = validUnitRatio(ratio);
  return valid === null ? null : radiansToDegrees(Math.asin(valid));
};

export const acosDegrees = (ratio: number): number | null => {
  const valid = validUnitRatio(ratio);
  return valid === null ? null : radiansToDegrees(Math.acos(valid));
};

export const atanDegrees = (ratio: number): number =>
  radiansToDegrees(Math.atan(ratio));

export const atan2Degrees = (y: number, x: number): number | null =>
  angleFromCoordinates(x, y);

export const getQuadrant = (x: number, y: number): string => {
  const xZero = Math.abs(x) < TRIG_EPSILON;
  const yZero = Math.abs(y) < TRIG_EPSILON;
  if (xZero && yZero) return "origin";
  if (yZero) return x > 0 ? "+X axis" : "−X axis";
  if (xZero) return y > 0 ? "+Y axis" : "−Y axis";
  if (x > 0 && y > 0) return "I";
  if (x < 0 && y > 0) return "II";
  if (x < 0 && y < 0) return "III";
  return "IV";
};

export const angularDistance = (a: number, b: number): number =>
  Math.abs(normalizeDegreesSigned(a - b));

