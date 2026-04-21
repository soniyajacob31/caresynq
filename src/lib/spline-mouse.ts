import type { Application } from "@splinetool/runtime";

type CachedAxes = { x: string; y: string } | null;

let cachedAxes: CachedAxes = null;

const CANDIDATE_PAIRS: [string, string][] = [
  ["mouseX", "mouseY"],
  ["MouseX", "MouseY"],
  ["Mouse X", "Mouse Y"],
  ["mouse x", "mouse y"],
];

/**
 * Prefer Spline’s global pointer mode, discover mouse-related variables when present,
 * and forward normalized pointer coordinates for scenes wired to variables.
 */
export function configureSplinePointerBridge(app: Application): void {
  cachedAxes = null;
  try {
    app.setGlobalEvents(true);
  } catch {
    /* older runtimes */
  }

  const names = Object.keys(app.getVariables());
  for (const [xk, yk] of CANDIDATE_PAIRS) {
    if (names.includes(xk) && names.includes(yk)) {
      cachedAxes = { x: xk, y: yk };
      return;
    }
  }

  const lower = (s: string) => s.toLowerCase();
  const xName = names.find(
    (n) =>
      lower(n).includes("mouse") &&
      (lower(n).includes("x") || /\bx\b/.test(lower(n))) &&
      !lower(n).includes("y")
  );
  const yName = names.find(
    (n) =>
      lower(n).includes("mouse") &&
      (lower(n).includes("y") || /\by\b/.test(lower(n))) &&
      !lower(n).includes("x")
  );
  if (xName && yName) {
    cachedAxes = { x: xName, y: yName };
  }
}

/** Normalized 0–1 within the tracked region (typically the validation hero). */
export function forwardPointerToSpline(
  app: Application,
  nx: number,
  ny: number
): void {
  const clampedX = Math.min(1, Math.max(0, nx));
  const clampedY = Math.min(1, Math.max(0, ny));

  if (cachedAxes) {
    try {
      app.setVariables({
        [cachedAxes.x]: clampedX,
        [cachedAxes.y]: clampedY,
      });
    } catch {
      /* ignore */
    }
    return;
  }

  try {
    app.setVariables({
      mouseX: clampedX,
      mouseY: clampedY,
    });
  } catch {
    /* scene may not expose variables */
  }
}
