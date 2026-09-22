import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * XinetLogo — the single swap point for the brand artwork.
 *
 * To replace the logo, drop the new asset into `public/brand/` and update the
 * SOURCES map below. No other file references logo artwork directly, so the
 * supplied final logo can replace the current asset without touching layout.
 */

const SOURCES = {
  /** X mark only (square-ish) — compact surfaces. */
  mark: { src: "/brand/xinet-mark.png", width: 200, height: 156 },
  /** X mark + INET wordmark — navigation, hero. */
  wordmark: { src: "/brand/xinet-wordmark.png", width: 831, height: 156 },
  /** Full lockup including the tagline. */
  lockup: { src: "/brand/xinet-lockup-tagline.png", width: 831, height: 220 },
} as const;

type LogoVariant = keyof typeof SOURCES;

type XinetLogoProps = {
  variant?: LogoVariant;
  /** Rendered height in px. Width follows the artwork ratio automatically. */
  height?: number;
  className?: string;
  /** Set on above-the-fold logos so the mark paints immediately. */
  priority?: boolean;
  alt?: string;
};

export function XinetLogo({
  variant = "wordmark",
  height = 28,
  className,
  priority = false,
  alt = "Xinet",
}: XinetLogoProps) {
  const source = SOURCES[variant];
  const width = Math.round((source.width / source.height) * height);

  return (
    <Image
      src={source.src}
      alt={alt}
      width={width}
      height={height}
      priority={priority}
      // Intrinsic ratio is supplied, so no layout shift while decoding.
      className={cn("block h-auto w-auto select-none", className)}
      style={{ height, width }}
      draggable={false}
    />
  );
}
