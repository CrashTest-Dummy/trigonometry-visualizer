import { COURSE_MODULES, COURSE_STEP_IDS, type AppMode } from "./course";

export const PROGRESS_STORAGE_KEY = "triglab.learning.v1";

export type CourseProgress = {
  version: 1;
  lastMode: AppMode;
  moduleId: string;
  stepId: string;
  completedStepIds: string[];
  introDismissed: boolean;
};

export const DEFAULT_PROGRESS: CourseProgress = {
  version: 1,
  lastMode: "guided",
  moduleId: COURSE_MODULES[0].id,
  stepId: COURSE_MODULES[0].step.id,
  completedStepIds: [],
  introDismissed: false,
};

const isMode = (value: unknown): value is AppMode =>
  value === "guided" || value === "explore" || value === "reference";

export const validateProgress = (value: unknown): CourseProgress | null => {
  if (!value || typeof value !== "object") return null;
  const candidate = value as Partial<CourseProgress>;
  const module = COURSE_MODULES.find((item) => item.id === candidate.moduleId);
  if (
    candidate.version !== 1
    || !isMode(candidate.lastMode)
    || !module
    || candidate.stepId !== module.step.id
    || !Array.isArray(candidate.completedStepIds)
    || typeof candidate.introDismissed !== "boolean"
  ) return null;

  return {
    version: 1,
    lastMode: candidate.lastMode,
    moduleId: module.id,
    stepId: module.step.id,
    completedStepIds: [...new Set(candidate.completedStepIds.filter((id): id is string => typeof id === "string" && COURSE_STEP_IDS.includes(id)))],
    introDismissed: candidate.introDismissed,
  };
};

export const loadProgress = (storage?: Storage | null): CourseProgress => {
  try {
    const resolvedStorage = storage === undefined ? globalThis.localStorage : storage;
    const raw = resolvedStorage?.getItem(PROGRESS_STORAGE_KEY);
    if (!raw) return { ...DEFAULT_PROGRESS, completedStepIds: [] };
    return validateProgress(JSON.parse(raw)) ?? { ...DEFAULT_PROGRESS, completedStepIds: [] };
  } catch {
    return { ...DEFAULT_PROGRESS, completedStepIds: [] };
  }
};

export const saveProgress = (
  progress: CourseProgress,
  storage?: Storage | null,
): boolean => {
  try {
    const resolvedStorage = storage === undefined ? globalThis.localStorage : storage;
    resolvedStorage?.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(progress));
    return resolvedStorage !== null;
  } catch {
    return false;
  }
};

export const resetProgress = (storage?: Storage | null): CourseProgress => {
  try {
    const resolvedStorage = storage === undefined ? globalThis.localStorage : storage;
    resolvedStorage?.removeItem(PROGRESS_STORAGE_KEY);
  } catch {
    // The in-memory default remains usable when storage is unavailable.
  }
  return { ...DEFAULT_PROGRESS, completedStepIds: [] };
};
