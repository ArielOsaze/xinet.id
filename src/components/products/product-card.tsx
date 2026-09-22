"use client";

import { useRef, useState, type ReactNode } from "react";
import SpotlightCard from "@/components/reactbits/SpotlightCard";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

/**
 * ProductCard — the interactive surface for a featured product.
 *
 * Interaction budget (restrained by design):
 *  - spotlight that follows the pointer, very low alpha
 *  - a 2.5deg max tilt, disabled on touch devices and for reduced motion
 *  - artwork lift and a small CTA arrow shift on hover
 *  - brighter border on hover
 *
 * The whole card is one link target, so the CTA is a visual affordance rather
 * than a nested interactive element (no duplicate tab stops).
 */
export function ProductCard({
  children,
  href,
  accent,
  className,
  ariaLabel,
}: {
  children: ReactNode;
  href: string | null;
  /** RGB triplet, e.g. "34 199 232". */
  accent: string;
  className?: string;
  ariaLabel: string;
}) {
  const reduced = useReducedMotion();
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [hover, setHover] = useState(false);

  // SpotlightCard requires a literal rgba() with numeric channels, so parse the
  // triplet rather than passing an opaque string through.
  const [ar, ag, ab] = accent.split(" ").map(Number);
  const spotlightColor = `rgba(${ar}, ${ag}, ${ab}, 0.09)` as const;

  // Touch devices must never tilt: it fights scrolling and drains battery.
  const canTilt = () =>
    !reduced &&
    typeof window !== "undefined" &&
    window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  const onMove = (e: React.MouseEvent) => {
    if (!canTilt() || !cardRef.current) return;
    const r = cardRef.current.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    const MAX = 2.5; // degrees — spec ceiling is 2–4
    setTilt({ x: (0.5 - py) * MAX * 2, y: (px - 0.5) * MAX * 2 });
  };

  const reset = () => {
    setTilt({ x: 0, y: 0 });
    setHover(false);
  };

  const card = (
    <SpotlightCard
      spotlightColor={spotlightColor}
      className={cn(
        "border-line relative flex h-full flex-col overflow-hidden rounded-2xl border bg-[#0B0E11] transition-[border-color,box-shadow] duration-500 ease-out motion-reduce:transition-none",
        hover && "border-white/20",
        className
      )}
    >
      {children}
    </SpotlightCard>
  );

  // Products without a live destination are presented honestly as static.
  if (!href) {
    return (
      <div
        ref={cardRef}
        className="h-full"
        onMouseEnter={() => setHover(true)}
        onMouseLeave={reset}
        onMouseMove={onMove}
      >
        <div
          className="h-full transition-transform duration-500 ease-out motion-reduce:transition-none"
          style={
            hover && !reduced
              ? { transform: `perspective(1200px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)` }
              : undefined
          }
        >
          {card}
        </div>
      </div>
    );
  }

  return (
    <div
      ref={cardRef}
      className="h-full"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={reset}
      onMouseMove={onMove}
    >
      <div
        className="h-full transition-transform duration-500 ease-out motion-reduce:transition-none"
        style={
          hover && !reduced
            ? { transform: `perspective(1200px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)` }
            : undefined
        }
      >
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={ariaLabel}
          className="focus-visible:ring-accent block h-full rounded-2xl focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[#080A0C] focus-visible:outline-none"
        >
          {card}
        </a>
      </div>
    </div>
  );
}
