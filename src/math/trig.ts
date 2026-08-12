export const degreesToRadians = (degrees: number): number =>
  (degrees * Math.PI) / 180;

export const radiansToDegrees = (radians: number): number =>
  (radians * 180) / Math.PI;

export const vectorMagnitude = (x: number, y: number): number =>
  Math.hypot(x, y);

export const normalizeDegrees360 = (degrees: number): number =>
  ((degrees % 360) + 360) % 360;

export const normalizeDegreesSigned = (degrees: number): number => {
  const normalized = normalizeDegrees360(degrees);
  return normalized > 180 ? normalized - 360 : normalized;
};

export const angleFromCoordinates = (x: number, y: number): number | null =>
  x === 0 && y === 0 ? null : normalizeDegrees360(radiansToDegrees(Math.atan2(y, x)));

export const coordinatesFromAngle = (
  degrees: number,
  magnitude: number,
): { x: number; y: number } => {
  const radians = degreesToRadians(degrees);
  return {
    x: magnitude * Math.cos(radians),
    y: magnitude * Math.sin(radians),
  };
};

export const tangentFromComponents = (x: number, y: number): number | null =>
  Math.abs(x) < Number.EPSILON ? null : y / x;

export const atanDegrees = (ratio: number): number =>
  radiansToDegrees(Math.atan(ratio));

export const atan2Degrees = (y: number, x: number): number | null =>
  x === 0 && y === 0 ? null : normalizeDegrees360(radiansToDegrees(Math.atan2(y, x)));

export const getQuadrant = (x: number, y: number): string => {
  if (x === 0 && y === 0) return "origin";
  if (y === 0) return x > 0 ? "+X axis" : "−X axis";
  if (x === 0) return y > 0 ? "+Y axis" : "−Y axis";
  if (x > 0 && y > 0) return "I";
  if (x < 0 && y > 0) return "II";
  if (x < 0 && y < 0) return "III";
  return "IV";
};

