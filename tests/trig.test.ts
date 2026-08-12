import { describe, expect, it } from "vitest";
import {
  angleFromCoordinates,
  acosDegrees,
  angularDistance,
  asinDegrees,
  atan2Degrees,
  atanDegrees,
  cosineFromComponents,
  coordinatesFromAngle,
  degreesToRadians,
  displayAngle,
  getQuadrant,
  normalizeDegrees360,
  normalizeDegreesSigned,
  radiansToDegrees,
  sineFromComponents,
  tangentFromComponents,
  vectorMagnitude,
} from "../src/math/trig";

describe("angle conversion", () => {
  it("converts between degrees and radians", () => {
    expect(degreesToRadians(180)).toBeCloseTo(Math.PI);
    expect(radiansToDegrees(Math.PI / 2)).toBeCloseTo(90);
  });

  it("normalizes positive and signed angles", () => {
    expect(normalizeDegrees360(360)).toBe(0);
    expect(normalizeDegrees360(-90)).toBe(270);
    expect(normalizeDegrees360(810)).toBe(90);
    expect(normalizeDegreesSigned(270)).toBe(-90);
    expect(normalizeDegreesSigned(-190)).toBe(170);
    expect(displayAngle(315, "signed")).toBe(-45);
    expect(displayAngle(-45, "unsigned")).toBe(315);
    expect(angularDistance(359, 1)).toBe(2);
  });
});

describe("vector calculations", () => {
  it("calculates magnitude without early rounding", () => {
    expect(vectorMagnitude(3, 4)).toBe(5);
    expect(vectorMagnitude(-18, 7)).toBeCloseTo(19.3132, 4);
  });

  it("converts angles and magnitude back to coordinates", () => {
    expect(coordinatesFromAngle(0, 10)).toEqual({ x: 10, y: 0 });
    const ninety = coordinatesFromAngle(90, 5);
    expect(ninety.x).toBeCloseTo(0, 12);
    expect(ninety.y).toBeCloseTo(5, 12);
    const fullTurn = coordinatesFromAngle(360, 5);
    expect(fullTurn).toEqual({ x: 5, y: 0 });
  });

  it.each([
    [1, 1, 45],
    [-1, 1, 135],
    [-1, -1, 225],
    [1, -1, 315],
    [1, 0, 0],
    [0, 1, 90],
    [-1, 0, 180],
    [0, -1, 270],
  ])("finds the quadrant-aware direction for (%s, %s)", (x, y, expected) => {
    expect(angleFromCoordinates(x, y)).toBeCloseTo(expected);
    expect(atan2Degrees(y, x)).toBeCloseTo(expected);
  });

  it("does not invent a direction for the zero vector", () => {
    expect(angleFromCoordinates(0, 0)).toBeNull();
    expect(atan2Degrees(0, 0)).toBeNull();
    expect(getQuadrant(0, 0)).toBe("origin");
  });
});

describe("tangent, atan, and atan2", () => {
  it("treats tangent as undefined when horizontal run is zero", () => {
    expect(tangentFromComponents(0, 5)).toBeNull();
    expect(tangentFromComponents(Number.EPSILON / 2, 5)).toBeNull();
  });

  it("shows why atan of a ratio loses the quadrant", () => {
    const forwardRatio = tangentFromComponents(10, 5)!;
    const oppositeRatio = tangentFromComponents(-10, -5)!;
    expect(forwardRatio).toBe(oppositeRatio);
    expect(atanDegrees(forwardRatio)).toBeCloseTo(26.565);
    expect(atanDegrees(oppositeRatio)).toBeCloseTo(26.565);
    expect(atan2Degrees(5, 10)).toBeCloseTo(26.565);
    expect(atan2Degrees(-5, -10)).toBeCloseTo(206.565);
  });

  it.each([
    [1, 1, "I"],
    [-1, 1, "II"],
    [-1, -1, "III"],
    [1, -1, "IV"],
    [1, 0, "+X axis"],
    [0, 1, "+Y axis"],
    [-1, 0, "−X axis"],
    [0, -1, "−Y axis"],
  ])("labels quadrant or axis for (%s, %s)", (x, y, expected) => {
    expect(getQuadrant(x, y)).toBe(expected);
  });
});

describe("sine, cosine, and inverse functions", () => {
  it("derives signed projections from components", () => {
    expect(sineFromComponents(3, 4)).toBeCloseTo(0.8);
    expect(cosineFromComponents(3, 4)).toBeCloseTo(0.6);
    expect(sineFromComponents(-3, -4)).toBeCloseTo(-0.8);
    expect(cosineFromComponents(-3, -4)).toBeCloseTo(-0.6);
  });

  it("does not define ratios for the zero vector", () => {
    expect(sineFromComponents(0, 0)).toBeNull();
    expect(cosineFromComponents(0, 0)).toBeNull();
  });

  it("returns the expected principal inverse ranges", () => {
    expect(asinDegrees(0.5)).toBeCloseTo(30);
    expect(asinDegrees(-0.5)).toBeCloseTo(-30);
    expect(acosDegrees(0.5)).toBeCloseTo(60);
    expect(acosDegrees(-0.5)).toBeCloseTo(120);
  });

  it("clamps harmless floating-point drift and rejects invalid ratios", () => {
    expect(asinDegrees(1 + Number.EPSILON)).toBeCloseTo(90);
    expect(acosDegrees(-1 - Number.EPSILON)).toBeCloseTo(180);
    expect(asinDegrees(1.01)).toBeNull();
    expect(acosDegrees(Number.NaN)).toBeNull();
  });
});

