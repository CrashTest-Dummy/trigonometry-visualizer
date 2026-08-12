// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const click = (selector: string): void => {
  const element = document.querySelector<HTMLElement>(selector);
  if (!element) throw new Error(`Missing test element: ${selector}`);
  element.click();
};

const input = (selector: string, value: string): void => {
  const element = document.querySelector<HTMLInputElement>(selector);
  if (!element) throw new Error(`Missing test input: ${selector}`);
  element.value = value;
  element.dispatchEvent(new Event("input", { bubbles: true }));
};

const text = (selector: string): string => {
  const element = document.querySelector<HTMLElement>(selector);
  if (!element) throw new Error(`Missing test text: ${selector}`);
  return element.textContent?.trim() ?? "";
};

describe("TrigLab interface", () => {
  beforeEach(async () => {
    vi.useFakeTimers();
    vi.resetModules();
    document.body.innerHTML = '<div id="app"></div>';
    await import("../src/main");
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
    document.body.innerHTML = "";
  });

  it("boots with the complete eight-lesson path", () => {
    expect(document.querySelectorAll(".lesson-tab")).toHaveLength(8);
    expect(text("#lesson-title")).toBe("A vector is a right triangle.");
    expect(text("#r-readout")).toBe("11.18");
  });

  it("keeps component entry, angle, and magnitude synchronized", () => {
    input("#x-input", "3");
    input("#y-input", "4");
    expect(text("#r-readout")).toBe("5.00");
    expect(text("#angle-readout")).toBe("53.1°");
    expect(document.querySelector<HTMLInputElement>("#angle-input")?.value).toBe("53.1");

    click('[data-angle-preset="90"]');
    expect(text("#x-readout")).toBe("0.00");
    expect(text("#y-readout")).toBe("5.00");
    expect(text("#angle-readout")).toBe("90.0°");
  });

  it("switches between unsigned and signed direction displays", () => {
    input("#angle-input", "315");
    expect(text("#angle-readout")).toBe("315.0°");
    click('[data-angle-mode="signed"]');
    expect(text("#angle-readout")).toBe("-45.0°");
    expect(document.querySelector<HTMLInputElement>("#angle-slider")?.min).toBe("-180");
  });

  it("shows and emphasizes each forward relationship", () => {
    click('[data-lesson="sine"]');
    expect(text("#lesson-title")).toBe("Sine measures height.");
    expect(document.querySelector("#vector-plot")?.getAttribute("data-relation")).toBe("sine");
    expect(text('[data-value="sin"]')).toBe("0.447");

    click('[data-lesson="cosine"]');
    expect(text("#lesson-title")).toBe("Cosine measures reach.");
    expect(document.querySelector("#vector-plot")?.getAttribute("data-relation")).toBe("cosine");

    click('[data-lesson="tangent"]');
    expect(text("#lesson-title")).toBe("Tangent is steepness.");
    expect(text('[data-value="tan"]')).toBe("0.500");
  });

  it("switches among all three inverse functions", () => {
    click('[data-lesson="inverse"]');
    expect(text("#lesson-title")).toBe("Arcsine recovers an angle.");
    click('[data-relation="cosine"]');
    expect(text("#lesson-title")).toBe("Arccosine recovers an angle.");
    expect(document.querySelector("#vector-plot")?.getAttribute("data-relation")).toBe("cosine");
    click('[data-relation="tangent"]');
    expect(text("#lesson-title")).toBe("Arctangent recovers an angle.");
  });

  it("explains undefined tangent without Infinity or NaN", () => {
    click('[data-lesson="tangent"]');
    input("#x-input", "0");
    input("#y-input", "5");
    expect(text('[data-value="tan"]')).toBe("undefined");
    expect(document.querySelector(".tangent-explanation")?.classList.contains("is-undefined")).toBe(true);
    expect(document.body.textContent).not.toContain("Infinity");
    expect(document.body.textContent).not.toContain("NaN");
  });

  it("demonstrates atan ambiguity and quadrant-aware atan2", () => {
    input("#x-input", "-10");
    input("#y-input", "-5");
    click('[data-lesson="quadrants"]');
    expect(text('[data-value="quadrant"]')).toBe("III");
    expect(text('[data-value="atan"]')).toBe("26.6°");
    expect(text('[data-value="angle"]')).toBe("206.6°");
    click('[data-action="flip"]');
    expect(text("#x-readout")).toBe("10.00");
    expect(text("#y-readout")).toBe("5.00");
  });

  it("fixes the unit-circle radius at one and restores the prior magnitude", () => {
    const originalMagnitude = text("#r-readout");
    click('[data-lesson="unit-circle"]');
    expect(text("#r-readout")).toBe("1.00");
    expect(document.querySelector<HTMLInputElement>("#x-input")?.disabled).toBe(true);
    click('[data-angle-preset="180"]');
    expect(text("#x-readout")).toBe("-1.00");
    expect(text("#y-readout")).toBe("0.00");
    click('[data-lesson="basics"]');
    expect(text("#r-readout")).toBe(originalMagnitude);
    expect(text("#angle-readout")).toBe("180.0°");
  });

  it("calculates the crash-reconstruction example while preserving the disclaimer", () => {
    click('[data-lesson="delta-v"]');
    click('[data-action="delta-example"]');
    expect(text("#x-readout")).toBe("-18.00 mph");
    expect(text("#y-readout")).toBe("7.00 mph");
    expect(text("#r-readout")).toBe("19.31 mph");
    expect(text("#angle-readout")).toBe("158.7°");
    expect(document.body.textContent).toContain("no PDOF conversion");
    expect(document.body.textContent).toContain("Educational use only");

    const select = document.querySelector<HTMLSelectElement>("#unit-select")!;
    select.value = "km/h";
    select.dispatchEvent(new Event("change", { bubbles: true }));
    expect(text("#r-readout")).toBe("19.31 km/h");
  });

  it("treats the zero vector as having no direction and revives it through angle input", () => {
    input("#x-input", "0");
    input("#y-input", "0");
    expect(text("#angle-readout")).toBe("undefined");
    expect(document.querySelector<HTMLElement>("#origin-angle-note")?.hidden).toBe(false);
    input("#angle-input", "45");
    expect(text("#angle-readout")).toBe("45.0°");
    expect(text("#r-readout")).toBe("5.00");
  });
});
