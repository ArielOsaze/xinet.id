'use client';

import React, { useRef, useCallback } from 'react';

/**
 * GlareHover — a single sweep of light across an element on hover.
 *
 * Hardened against the jitter the stock version produced when layered inside a
 * scroll-driven card:
 *
 *  - `willChange` is set only while the sweep runs, then cleared. Leaving it on
 *    permanently promotes the element to its own compositing layer, and that
 *    promotion collides with the parent card's per-frame transform updates.
 *  - `activeRef` guards against re-entry: `mouseenter` fires again whenever the
 *    pointer crosses onto a child, which restarted the animation mid-sweep and
 *    read as flicker.
 *  - The wrapper is `block`, not `grid place-items-center`. As a grid container
 *    it re-measured its child on every hover frame.
 *  - `borderRadius` is applied to the overlay too, so the sweep follows the
 *    card's rounded corners instead of painting square ones.
 */

interface GlareHoverProps {
  width?: string;
  height?: string;
  background?: string;
  borderRadius?: string;
  borderColor?: string;
  children?: React.ReactNode;
  glareColor?: string;
  glareOpacity?: number;
  glareAngle?: number;
  glareSize?: number;
  transitionDuration?: number;
  playOnce?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

const GlareHover: React.FC<GlareHoverProps> = ({
  width = 'auto',
  height = 'auto',
  background = 'transparent',
  borderRadius = '1rem',
  borderColor = 'transparent',
  children,
  glareColor = '#ffffff',
  glareOpacity = 0.5,
  glareAngle = -45,
  glareSize = 250,
  transitionDuration = 650,
  playOnce = false,
  className = '',
  style = {}
}) => {
  const hex = glareColor.replace('#', '');
  let rgba = glareColor;
  if (/^[\dA-Fa-f]{6}$/.test(hex)) {
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    rgba = `rgba(${r}, ${g}, ${b}, ${glareOpacity})`;
  } else if (/^[\dA-Fa-f]{3}$/.test(hex)) {
    const r = parseInt(hex[0] + hex[0], 16);
    const g = parseInt(hex[1] + hex[1], 16);
    const b = parseInt(hex[2] + hex[2], 16);
    rgba = `rgba(${r}, ${g}, ${b}, ${glareOpacity})`;
  }

  const overlayRef = useRef<HTMLDivElement | null>(null);
  const activeRef = useRef(false);
  const releaseTimer = useRef<number | null>(null);

  const animateIn = useCallback(() => {
    const el = overlayRef.current;
    if (!el || activeRef.current) return;
    activeRef.current = true;

    if (releaseTimer.current) {
      window.clearTimeout(releaseTimer.current);
      releaseTimer.current = null;
    }

    el.style.willChange = 'background-position';
    el.style.transition = 'none';
    el.style.backgroundPosition = '-100% -100%, 0 0';

    // Commit the reset before starting the transition, otherwise the browser
    // coalesces both writes and no sweep is visible.
    void el.offsetWidth;

    el.style.transition = `background-position ${transitionDuration}ms ease`;
    el.style.backgroundPosition = '100% 100%, 0 0';
  }, [transitionDuration]);

  const animateOut = useCallback(() => {
    const el = overlayRef.current;
    if (!el) return;
    activeRef.current = false;

    el.style.transition = playOnce
      ? 'none'
      : `background-position ${transitionDuration}ms ease`;
    el.style.backgroundPosition = '-100% -100%, 0 0';

    // Drop the compositing hint once the sweep has finished.
    if (releaseTimer.current) window.clearTimeout(releaseTimer.current);
    releaseTimer.current = window.setTimeout(() => {
      if (overlayRef.current && !activeRef.current) {
        overlayRef.current.style.willChange = 'auto';
      }
    }, transitionDuration + 60);
  }, [playOnce, transitionDuration]);

  const overlayStyle: React.CSSProperties = {
    position: 'absolute',
    inset: 0,
    background: `linear-gradient(${glareAngle}deg,
        hsla(0,0%,0%,0) 60%,
        ${rgba} 70%,
        hsla(0,0%,0%,0) 100%)`,
    backgroundSize: `${glareSize}% ${glareSize}%, 100% 100%`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: '-100% -100%, 0 0',
    pointerEvents: 'none',
    borderRadius
  };

  return (
    <div
      className={`relative block overflow-hidden ${className}`}
      style={{
        width,
        height,
        background,
        borderRadius,
        borderColor,
        ...style
      }}
      onMouseEnter={animateIn}
      onMouseLeave={animateOut}
    >
      <div ref={overlayRef} style={overlayStyle} aria-hidden="true" />
      {children}
    </div>
  );
};

export default GlareHover;
