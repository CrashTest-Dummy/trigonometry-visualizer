import { describe, expect, it } from "vitest";
import { CONCEPTS, conceptById, conceptValue } from "../src/ui/concepts";

describe("plain-language concept help", () => {
  it("covers the taught relationships and reciprocal functions", () => {
    expect(CONCEPTS.map((concept) => concept.id)).toEqual([
      "vector",
      "magnitude",
      "sine",
      "cosine",
      "tangent",
      "cotangent",
      "secant",
      "cosecant",
      "arcsine",
      "arccosine",
      "arctangent",
      "atan2",
      "unit-circle",
    ]);
    for (const concept of CONCEPTS) {
      expect(concept.plainLanguage.length).toBeGreaterThan(30);
      expect(concept.formula.length).toBeGreaterThan(5);
      expect(concept.undefinedWhen.length).toBeGreaterThan(20);
      expect(concept.relatedLesson).toBeTruthy();
    }
    expect(conceptById("cotangent")?.reciprocal).toContain("tangent");
    expect(conceptById("secant")?.reciprocal).toContain("cosine");
    expect(conceptById("cosecant")?.reciprocal).toContain("sine");
  });

  it("shows live values without Infinity or NaN", () => {
    expect(conceptValue("cotangent", { x: 3, y: 4 })).toContain("0.750");
    expect(conceptValue("secant", { x: 3, y: 4 })).toContain("1.667");
    expect(conceptValue("cosecant", { x: 3, y: 4 })).toContain("1.250");
    expect(conceptValue("arctangent", { x: 3, y: 4 })).toContain("53.130°");
    expect(conceptValue("atan2", { x: -3, y: 4 })).toContain("126.870°");
    for (const id of CONCEPTS.map((concept) => concept.id)) {
      expect(conceptValue(id, { x: 3, y: 4 })).not.toMatch(/Infinity|NaN/);
    }
  });

  it("explains zero-denominator and zero-vector cases", () => {
    expect(conceptValue("tangent", { x: 0, y: 4 })).toContain("undefined");
    expect(conceptValue("secant", { x: 0, y: 4 })).toContain("undefined");
    expect(conceptValue("cotangent", { x: 4, y: 0 })).toContain("undefined");
    expect(conceptValue("cosecant", { x: 4, y: 0 })).toContain("undefined");
    expect(conceptValue("sine", { x: 0, y: 0 })).toContain("undefined");
    expect(conceptValue("cosine", { x: 0, y: 0 })).toContain("undefined");
    expect(conceptValue("atan2", { x: 0, y: 0 })).toContain("undefined");
    expect(conceptValue("magnitude", { x: 0, y: 0 })).toContain("0.000");
  });
});
