'use client';

import React, { useRef, useCallback, useEffect } from 'react';

/**
 * GlareHover — a single sweep of light across an element on hover.
 *
 * WHY THIS IS NOT THE STOCK IMPLEMENTATION
 *
 * The published version animates `background-position` on a gradient. That is a
 * *paint* animation: every frame repaints the overlay. Inside a scroll-driven
 * card that caused the reported "card shakes when the cursor is near the top
 * edge" bug, through a chain of three effects:
 *
 *   1. A paint animation on a layer whose parent is being transformed forces the
 *      compositor to re-promote that layer each frame.
 *   2. `void el.offsetWidth` forced a synchronous layout flush on every
 *      `mouseenter`. Near a card edge the pointer crosses in and out repeatedly
 *      as the stack settles, so that flush fired in a burst.
 *   3. Toggling `will-change` on enter and clearing it on leave asked the browser
 *      to create and destroy a composited layer on every pass.
 *
 * The sweep here is a `transform: translate3d()` on an oversized gradient band.
 * Transform animations run entirely on the compositor: they never repaint, never
 * touch layout, and so leave the card's own transform alone. It is driven with
 * the Web Animations API rather than a CSS transition, which means no forced
 * reflow is needed to (re)start it, and `reverse()` plays it back smoothly when
 * the pointer leaves mid-sweep instead of snapping.
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

/** Where the band rests: fully off one side. Both ends sit outside the card, so
 *  an interrupted sweep can never freeze a band in the middle of it. */
const SWEEP_FROM = 'translate3d(-62%, 0, 0)';
const SWEEP_TO = 'translate3d(62%, 0, 0)';

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
  const animRef = useRef<Animation | null>(null);

  const animateIn = useCallback(() => {
    const el = overlayRef.current;
    if (!el || typeof el.animate !== 'function') return;

    // A fresh sweep per entry. Cancelling first also clears a sweep that was
    // reversed halfway, so rapid enter/leave cannot stack animations.
    animRef.current?.cancel();

    animRef.current = el.animate(
      [{ transform: SWEEP_FROM }, { transform: SWEEP_TO }],
      {
        duration: transitionDuration,
        easing: 'cubic-bezier(0.22, 0.61, 0.24, 1)',
        fill: 'forwards'
      }
    );
  }, [transitionDuration]);

  const animateOut = useCallback(() => {
    const anim = animRef.current;
    if (!anim) return;
    // playOnce means the sweep stays where it landed.
    if (playOnce) return;

    // Play back from wherever the sweep currently is, so leaving mid-flight
    // eases out rather than snapping. Still transform-only.
    try {
      anim.reverse();
    } catch {
      anim.cancel();
    }
  }, [playOnce]);

  useEffect(() => {
    return () => {
      animRef.current?.cancel();
      animRef.current = null;
    };
  }, []);

  const overlayStyle: React.CSSProperties = {
    position: 'absolute',
    // Oversized so the rotated band still covers the card at both extremes.
    inset: '-50%',
    background: `linear-gradient(${glareAngle}deg,
        hsla(0,0%,0%,0) 42%,
        ${rgba} 50%,
        hsla(0,0%,0%,0) 58%)`,
    backgroundSize: `${glareSize}% ${glareSize}%`,
    backgroundRepeat: 'no-repeat',
    pointerEvents: 'none',
    transform: SWEEP_FROM,
    // Flatten this subtree: the card may sit inside a 3D rendering context, and
    // an overlay that inherits it is what makes the sweep shimmer.
    transformStyle: 'flat'
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
        transformStyle: 'flat',
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
