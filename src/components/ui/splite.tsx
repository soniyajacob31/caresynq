"use client";

import type { Application } from "@splinetool/runtime";
import { Suspense, lazy } from "react";

const Spline = lazy(() => import("@splinetool/react-spline"));

export interface SplineSceneProps {
  scene: string;
  className?: string;
  onLoad?: (app: Application) => void;
}

export function SplineScene({ scene, className, onLoad }: SplineSceneProps) {
  return (
    <Suspense
      fallback={
        <div className="flex h-full w-full items-center justify-center">
          <div
            className="h-10 w-10 animate-spin rounded-full border-2 border-teal-400/60 border-t-transparent"
            aria-hidden
          />
        </div>
      }
    >
      <Spline scene={scene} className={className} onLoad={onLoad} />
    </Suspense>
  );
}
