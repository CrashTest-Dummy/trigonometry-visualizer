// @vitest-environment jsdom

import { describe, expect, it } from "vitest";
import {
  DEFAULT_PROGRESS,
  PROGRESS_STORAGE_KEY,
  loadProgress,
  resetProgress,
  saveProgress,
  validateProgress,
  type CourseProgress,
} from "../src/ui/progress";

class ThrowingStorage implements Storage {
  get length(): number { throw new Error("unavailable"); }
  clear(): void { throw new Error("unavailable"); }
  getItem(): string | null { throw new Error("unavailable"); }
  key(): string | null { throw new Error("unavailable"); }
  removeItem(): void { throw new Error("unavailable"); }
  setItem(): void { throw new Error("unavailable"); }
}

class MemoryStorage implements Storage {
  private values = new Map<string, string>();
  get length(): number { return this.values.size; }
  clear(): void { this.values.clear(); }
  getItem(key: string): string | null { return this.values.get(key) ?? null; }
  key(index: number): string | null { return [...this.values.keys()][index] ?? null; }
  removeItem(key: string): void { this.values.delete(key); }
  setItem(key: string, value: string): void { this.values.set(key, value); }
}

describe("versioned course progress", () => {
  it("validates known modules and removes unknown or duplicate completions", () => {
    const value = validateProgress({
      version: 1,
      lastMode: "guided",
      moduleId: "read-vector",
      stepId: "read-vector-345",
      completedStepIds: ["read-vector-345", "unknown", "read-vector-345"],
      introDismissed: true,
    });
    expect(value?.completedStepIds).toEqual(["read-vector-345"]);
  });

  it("rejects mismatched and unsupported stored shapes", () => {
    expect(validateProgress({ ...DEFAULT_PROGRESS, version: 2 })).toBeNull();
    expect(validateProgress({ ...DEFAULT_PROGRESS, stepId: "wrong" })).toBeNull();
    expect(validateProgress(null)).toBeNull();
  });

  it("saves, loads, and resets progress", () => {
    const storage = new MemoryStorage();
    const progress: CourseProgress = { ...DEFAULT_PROGRESS, lastMode: "reference", introDismissed: true };
    expect(saveProgress(progress, storage)).toBe(true);
    expect(loadProgress(storage)).toEqual(progress);
    expect(resetProgress(storage)).toEqual(DEFAULT_PROGRESS);
    expect(storage.getItem(PROGRESS_STORAGE_KEY)).toBeNull();
  });

  it("uses safe in-memory defaults if storage is corrupt or unavailable", () => {
    const corrupt = new MemoryStorage();
    corrupt.setItem(PROGRESS_STORAGE_KEY, "not-json");
    expect(loadProgress(corrupt)).toEqual(DEFAULT_PROGRESS);
    expect(loadProgress(new ThrowingStorage())).toEqual(DEFAULT_PROGRESS);
    expect(saveProgress(DEFAULT_PROGRESS, new ThrowingStorage())).toBe(false);
    expect(resetProgress(new ThrowingStorage())).toEqual(DEFAULT_PROGRESS);
  });
});
