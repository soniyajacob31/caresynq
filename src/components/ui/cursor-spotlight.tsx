"use client";

import { useCallback, useEffect } from "react";
import { motion, useSpring, useTransform, type SpringOptions } from "framer-motion";

import { cn } from "@/lib/utils";

type CursorSpotlightProps = {
  className?: string;
  /** Spotlight diameter in pixels — smaller = subtler. */
  size?: number;
  springOptions?: SpringOptions;
  /** Element whose bounds define pointer tracking (usually the hero `relative` container). */
  trackingRef: React.RefObject<HTMLElement | null>;
};

/**
 * Soft white glow that follows the pointer within the tracking region.
 */
export function CursorSpotlight({
  className,
  size = 110,
  springOptions = { stiffness: 260, damping: 32, mass: 0.55 },
  trackingRef,
}: CursorSpotlightProps) {
  const mouseX = useSpring(0, springOptions);
  const mouseY = useSpring(0, springOptions);

  const left = useTransform(mouseX, (x) => `${x - size / 2}px`);
  const top = useTransform(mouseY, (y) => `${y - size / 2}px`);

  const handleMove = useCallback(
    (event: MouseEvent) => {
      const el = trackingRef.current;
      if (!el) return;
      const { left: l, top: t } = el.getBoundingClientRect();
      mouseX.set(event.clientX - l);
      mouseY.set(event.clientY - t);
    },
    [mouseX, mouseY, trackingRef]
  );

  useEffect(() => {
    const el = trackingRef.current;
    if (!el) return;
    el.addEventListener("mousemove", handleMove, { passive: true });
    return () => el.removeEventListener("mousemove", handleMove);
  }, [handleMove, trackingRef]);

  return (
    <div
      className={cn("pointer-events-none absolute inset-0 z-[18] overflow-hidden", className)}
      aria-hidden
    >
      <motion.div
        className={cn(
          "pointer-events-none absolute rounded-full blur-2xl mix-blend-soft-light",
          "bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.35)_0%,rgba(255,255,255,0.08)_42%,transparent_68%)]"
        )}
        style={{
          width: size,
          height: size,
          left,
          top,
        }}
      />
    </div>
  );
}
