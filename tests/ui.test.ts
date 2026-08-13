// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { PROGRESS_STORAGE_KEY } from "../src/ui/progress";

class MemoryStorage implements Storage {
  private values = new Map<string, string>();
  get length(): number { return this.values.size; }
  clear(): void { this.values.clear(); }
  getItem(key: string): string | null { return this.values.get(key) ?? null; }
  key(index: number): string | null { return [...this.values.keys()][index] ?? null; }
  removeItem(key: string): void { this.values.delete(key); }
  setItem(key: string, value: string): void { this.values.set(key, value); }
}

let storage: MemoryStorage;

const boot = async (): Promise<void> => {
  vi.resetModules();
  document.body.innerHTML = '<div id="app"></div>';
  await import("../src/main");
};

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

const openExplore = (): void => click('[data-app-mode="explore"]');

describe("TrigLab interface", () => {
  beforeEach(async () => {
    vi.useFakeTimers();
    storage = new MemoryStorage();
    Object.defineProperty(globalThis, "localStorage", { configurable: true, value: storage });
    await boot();
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
    vi.restoreAllMocks();
    document.body.innerHTML = "";
  });

  it("opens the seven-module Guided course on a first visit", () => {
    expect(document.querySelector('[data-app-mode="guided"]')?.getAttribute("aria-pressed")).toBe("true");
    expect(document.querySelectorAll(".course-module-list button")).toHaveLength(7);
    expect(text("#course-step-title")).toBe("Three measurements, one geometry");
    expect(text("#r-readout")).toBe("11.18");
    expect(document.querySelectorAll("#roadmap li")).toHaveLength(5);
    expect(text("#roadmap")).toContain("Geometry");
    expect(text("#roadmap")).toContain("Field application");
  });

  it("gives constructive, unscored feedback and gates course progression", () => {
    click('[data-prediction="shorter"]');
    expect(text(".prediction-feedback")).toContain("not a score");
    expect(document.querySelector<HTMLButtonElement>('[data-action="course-next"]')?.disabled).toBe(true);
    click('[data-action="course-preset"]');
    expect(text("#r-readout")).toBe("5.00");
    expect(document.querySelector<HTMLButtonElement>('[data-action="course-next"]')?.disabled).toBe(false);
    click('[data-action="course-next"]');
    expect(text("#course-step-title")).toBe("A ratio describes direction without size");
    expect(JSON.parse(storage.getItem(PROGRESS_STORAGE_KEY)!).completedStepIds).toContain("read-vector-345");
  });

  it("provides every module, prediction feedback path, preset, and explanation", () => {
    for (let moduleIndex = 0; moduleIndex < 7; moduleIndex += 1) {
      click(`[data-course-module="${moduleIndex}"]`);
      const options = [...document.querySelectorAll<HTMLButtonElement>("[data-prediction]")];
      expect(options.length).toBeGreaterThanOrEqual(2);
      for (const option of options) {
        option.click();
        expect(text(".prediction-feedback").length).toBeGreaterThan(20);
        expect(text(".investigator-takeaway")).toContain("Investigator takeaway");
        expect(document.querySelector(".show-math")).not.toBeNull();
        expect(text(".common-trap")).toContain("Common trap");
      }
      click('[data-action="course-preset"]');
      expect(text(".goal-status")).toContain("target relationship");
      expect(document.querySelector<HTMLButtonElement>('[data-action="course-next"]')?.disabled).toBe(false);
    }
  });

  it("resumes the last Guided module without retaining prediction answers", async () => {
    click('[data-action="dismiss-intro"]');
    click('[data-course-module="3"]');
    click('[data-prediction="yes"]');
    await boot();
    expect(text("#course-step-title")).toBe("The ratio alone loses the quadrant");
    expect(document.querySelector(".prediction-feedback")).toBeNull();
    expect(document.querySelector<HTMLElement>("#guided-orientation")?.hidden).toBe(true);
  });

  it("falls back safely from corrupt progress and resets course progress", async () => {
    storage.setItem(PROGRESS_STORAGE_KEY, "{broken");
    await boot();
    expect(text("#course-step-title")).toBe("Three measurements, one geometry");
    click('[data-course-module="4"]');
    click('[data-action="reset-course"]');
    expect(text("#course-step-title")).toBe("Three measurements, one geometry");
    expect(storage.getItem(PROGRESS_STORAGE_KEY)).toBeNull();
    expect(document.querySelector("#roadmap li")?.getAttribute("data-state")).toBe("current");
  });

  it("preserves the canonical vector while switching modes", () => {
    input("#x-input", "3");
    input("#y-input", "4");
    click('[data-app-mode="reference"]');
    openExplore();
    expect(text("#x-readout")).toBe("3.00");
    expect(text("#y-readout")).toBe("4.00");
    expect(text("#r-readout")).toBe("5.00");
  });

  it("offers a complete printable Quick Reference", () => {
    const print = vi.spyOn(window, "print").mockImplementation(() => undefined);
    click('[data-app-mode="reference"]');
    expect(text("#reference-view")).toContain("Question → tool");
    expect(text("#reference-view")).toContain("atan2(Y, X)");
    expect(text("#reference-view")).toContain("direction is undefined");
    expect(text("#reference-view")).toContain("49 CFR §563.5");
    for (const term of ["Component", "Resultant", "Vector", "Ratio", "Quadrant", "Inverse function", "Delta-V", "PDOF"]) {
      expect(text("#reference-view")).toContain(term);
    }
    click('[data-action="print-reference"]');
    expect(print).toHaveBeenCalledOnce();
  });

  it("keeps the complete eight-lesson Explore path grouped and functional", () => {
    openExplore();
    expect(document.querySelectorAll(".lesson-family")).toHaveLength(3);
    expect(document.querySelectorAll(".lesson-tab")).toHaveLength(8);
    expect(text("#lesson-title")).toBe("A vector is a right triangle.");
  });

  it("keeps component entry, angle, and magnitude synchronized", () => {
    openExplore();
    input("#x-input", "3");
    input("#y-input", "4");
    expect(text("#r-readout")).toBe("5.00");
    expect(text("#angle-readout")).toBe("53.1°");
    expect(document.querySelector<HTMLInputElement>("#angle-input")?.value).toBe("53.1");
    click('[data-angle-preset="90"]');
    expect(text("#x-readout")).toBe("0.00");
    expect(text("#y-readout")).toBe("5.00");
  });

  it("switches between unsigned and signed direction displays", () => {
    input("#angle-input", "315");
    expect(text("#angle-readout")).toBe("315.0°");
    click('[data-angle-mode="signed"]');
    expect(text("#angle-readout")).toBe("-45.0°");
    expect(document.querySelector<HTMLInputElement>("#angle-slider")?.min).toBe("-180");
  });

  it("shows and emphasizes each forward relationship", () => {
    openExplore();
    click('[data-lesson="sine"]');
    expect(text("#lesson-title")).toBe("Sine measures height.");
    expect(document.querySelector("#vector-plot")?.getAttribute("data-relation")).toBe("sine");
    expect(text('[data-value="sin"]')).toBe("0.447");
    click('[data-lesson="cosine"]');
    expect(text("#lesson-title")).toBe("Cosine measures reach.");
    click('[data-lesson="tangent"]');
    expect(text('[data-value="tan"]')).toBe("0.500");
  });

  it("switches among all three inverse functions", () => {
    openExplore();
    click('[data-lesson="inverse"]');
    expect(text("#lesson-title")).toBe("Arcsine recovers an angle.");
    click('[data-relation="cosine"]');
    expect(text("#lesson-title")).toBe("Arccosine recovers an angle.");
    click('[data-relation="tangent"]');
    expect(text("#lesson-title")).toBe("Arctangent recovers an angle.");
  });

  it("explains undefined tangent without Infinity or NaN", () => {
    openExplore();
    click('[data-lesson="tangent"]');
    input("#x-input", "0");
    input("#y-input", "5");
    expect(text('[data-value="tan"]')).toBe("undefined");
    expect(document.querySelector(".tangent-explanation")?.classList.contains("is-undefined")).toBe(true);
    expect(document.body.textContent).not.toContain("Infinity");
    expect(document.body.textContent).not.toContain("NaN");
  });

  it("demonstrates atan ambiguity and quadrant-aware atan2", () => {
    openExplore();
    input("#x-input", "-10");
    input("#y-input", "-5");
    click('[data-lesson="quadrants"]');
    expect(text('[data-value="quadrant"]')).toBe("III");
    expect(text('[data-value="atan"]')).toBe("26.6°");
    expect(text('[data-value="angle"]')).toBe("206.6°");
    expect(text("#roadmap li[aria-current=\"step\"]")).toContain("Direction");
    click('[data-action="flip"]');
    expect(text("#x-readout")).toBe("10.00");
  });

  it("fixes the unit-circle radius at one and restores the prior magnitude", () => {
    openExplore();
    const originalMagnitude = text("#r-readout");
    click('[data-lesson="unit-circle"]');
    expect(text("#r-readout")).toBe("1.00");
    expect(document.querySelector<HTMLInputElement>("#x-input")?.disabled).toBe(true);
    click('[data-angle-preset="180"]');
    click('[data-lesson="basics"]');
    expect(text("#r-readout")).toBe(originalMagnitude);
    expect(text("#angle-readout")).toBe("180.0°");
  });

  it("calculates the collision example while preserving its convention disclaimer", () => {
    openExplore();
    click('[data-lesson="delta-v"]');
    click('[data-action="delta-example"]');
    expect(text("#x-readout")).toBe("-18.00 mph");
    expect(text("#y-readout")).toBe("7.00 mph");
    expect(text("#r-readout")).toBe("19.31 mph");
    expect(text("#angle-readout")).toBe("158.7°");
    expect(document.body.textContent).toContain("no PDOF conversion");
    expect(document.body.textContent).toContain("Educational use only");
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
