import { COURSE_MODULES, COURSE_PHASES, COURSE_STEP_IDS, type AppMode, type CoursePhase } from "./course";

export const PROGRESS_STORAGE_KEY = "triglab.learning.v1";

export type CourseProgress = {
  version: 2;
  lastMode: AppMode;
  moduleId: string;
  phase: CoursePhase;
  completedStepIds: string[];
  introDismissed: boolean;
};

export const DEFAULT_PROGRESS: CourseProgress = {
  version: 2,
  lastMode: "guided",
  moduleId: COURSE_MODULES[0].id,
  phase: "orient",
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
    candidate.version !== 2
    || !isMode(candidate.lastMode)
    || !module
    || !COURSE_PHASES.includes(candidate.phase as CoursePhase)
    || !Array.isArray(candidate.completedStepIds)
    || typeof candidate.introDismissed !== "boolean"
  ) return null;

  return {
    version: 2,
    lastMode: candidate.lastMode,
    moduleId: module.id,
    phase: candidate.phase as CoursePhase,
    completedStepIds: [...new Set(candidate.completedStepIds.filter((id): id is string => typeof id === "string" && COURSE_STEP_IDS.includes(id)))],
    introDismissed: candidate.introDismissed,
  };
};

export const migrateProgress = (value: unknown): CourseProgress | null => {
  const current = validateProgress(value);
  if (current) return current;
  if (!value || typeof value !== "object") return null;
  const legacy = value as {
    version?: unknown;
    lastMode?: unknown;
    moduleId?: unknown;
    stepId?: unknown;
    completedStepIds?: unknown;
    introDismissed?: unknown;
  };
  const module = COURSE_MODULES.find((item) => item.id === legacy.moduleId && item.step.id === legacy.stepId);
  if (
    legacy.version !== 1
    || !isMode(legacy.lastMode)
    || !module
    || !Array.isArray(legacy.completedStepIds)
    || typeof legacy.introDismissed !== "boolean"
  ) return null;
  return {
    version: 2,
    lastMode: legacy.lastMode,
    moduleId: module.id,
    phase: "orient",
    completedStepIds: [...new Set(legacy.completedStepIds.filter((id): id is string => typeof id === "string" && COURSE_STEP_IDS.includes(id)))],
    introDismissed: legacy.introDismissed,
  };
};

export const loadProgress = (storage?: Storage | null): CourseProgress => {
  try {
    const resolvedStorage = storage === undefined ? globalThis.localStorage : storage;
    const raw = resolvedStorage?.getItem(PROGRESS_STORAGE_KEY);
    if (!raw) return { ...DEFAULT_PROGRESS, completedStepIds: [] };
    const migrated = migrateProgress(JSON.parse(raw));
    if (migrated) {
      if (migrated.version === 2) resolvedStorage?.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(migrated));
      return migrated;
    }
    return { ...DEFAULT_PROGRESS, completedStepIds: [] };
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
