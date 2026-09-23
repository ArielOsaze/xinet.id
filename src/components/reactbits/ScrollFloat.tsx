import React, { useEffect, useMemo, useRef, type ReactNode, type RefObject } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface ScrollFloatProps {
  children: ReactNode;
  scrollContainerRef?: RefObject<HTMLElement>;
  containerClassName?: string;
  textClassName?: string;
  animationDuration?: number;
  ease?: string;
  scrollStart?: string;
  scrollEnd?: string;
  stagger?: number;
  /** Element to render. Defaults to h2. */
  as?: "h1" | "h2" | "h3" | "p" | "div";
}

const ScrollFloat: React.FC<ScrollFloatProps> = ({
  children,
  scrollContainerRef,
  containerClassName = '',
  textClassName = '',
  animationDuration = 1,
  ease = 'back.inOut(2)',
  scrollStart = 'center bottom+=50%',
  scrollEnd = 'bottom bottom-=40%',
  stagger = 0.03,
  as: Tag = 'h2'
}) => {
  // The tag is polymorphic, so the ref type is intentionally loose here.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const containerRef = useRef<any>(null);

  /**
   * Split into WORDS, not characters.
   *
   * The upstream version splits per character and swaps each space for U+00A0.
   * Layout looks identical, but `textContent` then reads
   * "Featuresthatactuallyexist" — non-breaking spaces are not word separators
   * for text extraction, so copy-paste, search engines and screen readers all
   * see one run-on word. Keeping real spaces between the spans fixes that while
   * animating exactly the same way.
   */
  const splitText = useMemo(() => {
    const text = typeof children === 'string' ? children : '';
    const words = text.split(' ');
    return words.flatMap((word, i) => {
      const nodes = [
        <span className="inline-block word" key={`w${i}`}>
          {word}
        </span>,
      ];
      // A real space BETWEEN the inline-blocks: collapses visually, but keeps
      // the words separate in the extracted text.
      if (i < words.length - 1) nodes.push(<span key={`s${i}`}> </span>);
      return nodes;
    });
  }, [children]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const scroller = scrollContainerRef && scrollContainerRef.current ? scrollContainerRef.current : window;

    const charElements = el.querySelectorAll('.word');

    gsap.fromTo(
      charElements,
      {
        willChange: 'opacity, transform',
        opacity: 0,
        yPercent: 120,
        scaleY: 2.3,
        scaleX: 0.7,
        transformOrigin: '50% 0%'
      },
      {
        duration: animationDuration,
        ease: ease,
        opacity: 1,
        yPercent: 0,
        scaleY: 1,
        scaleX: 1,
        stagger: stagger,
        scrollTrigger: {
          trigger: el,
          scroller,
          start: scrollStart,
          end: scrollEnd,
          scrub: true
        }
      }
    );
  }, [scrollContainerRef, animationDuration, ease, scrollStart, scrollEnd, stagger]);

  return (
    <Tag ref={containerRef} className={`my-5 overflow-hidden ${containerClassName}`}>
      <span className={`inline-block text-[clamp(1.6rem,4vw,3rem)] leading-[1.5] ${textClassName}`}>{splitText}</span>
    </Tag>
  );
};

export default ScrollFloat;
