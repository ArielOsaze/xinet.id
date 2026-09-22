"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * AppWindow — a macOS-style window frame for real product screenshots.
 *
 * Renders a browser/app window with traffic-light controls and a title bar, so
 * each product card shows an actual capture of the running product rather than a
 * drawn illustration. The frame is Xinet's; the content is the product's own UI,
 * which is why each card keeps the product's real colours.
 */
export function AppWindow({
  src,
  alt,
  title,
  className,
  priority = false,
  sizes = "(max-width: 768px) 100vw, (max-width: 1200px) 60vw, 780px",
}: {
  src: string;
  alt: string;
  /** Shown in the window title bar, like a real window title. */
  title: string;
  className?: string;
  priority?: boolean;
  sizes?: string;
}) {
  return (
    <div
      className={cn(
        "border-line bg-elevated overflow-hidden rounded-xl border shadow-[0_24px_70px_-30px_rgba(0,0,0,0.9)]",
        className
      )}
    >
      {/* Title bar with traffic lights */}
      <div className="border-line bg-surface/90 flex items-center gap-2 border-b px-3.5 py-2.5">
        <span aria-hidden="true" className="flex shrink-0 items-center gap-1.5">
          <span className="block size-2.5 rounded-full bg-[#ff5f57]" />
          <span className="block size-2.5 rounded-full bg-[#febc2e]" />
          <span className="block size-2.5 rounded-full bg-[#28c840]" />
        </span>
        <span className="text-ink-subtle mx-auto truncate text-[0.6875rem] font-medium tracking-[-0.005em]">
          {title}
        </span>
        {/* Balances the traffic lights so the title stays optically centred */}
        <span aria-hidden="true" className="w-11 shrink-0" />
      </div>

      {/* Real product capture. `object-contain` keeps the whole screenshot
          visible: cropping a product UI cuts off the very parts that show what
          it does. The frame supplies the background so letterboxing is invisible. */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#0B0E11]">
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          className="object-contain object-top transition-transform duration-[900ms] ease-out group-hover:scale-[1.015] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
        />
      </div>
    </div>
  );
}
