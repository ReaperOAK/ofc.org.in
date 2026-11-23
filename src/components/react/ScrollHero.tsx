import { useRef } from "react";
import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react";
import MagneticButton from "./MagneticButton";

interface Props {
  imageSrc: string;
  eyebrow: string;
  heading: string;
  body: string;
}

/**
 * The hero's headline opacity/scale is tied directly to scroll progress
 * through the hero's own height (useScroll + useTransform on a ref, not
 * a one-shot IntersectionObserver trigger) — it should feel like the
 * headline is dissolving as you descend. The background image parallaxes
 * at a different rate via a separate transform on the same progress
 * value. Under prefers-reduced-motion both are pinned to their resting
 * values: no parallax, no scroll-linked fade/scale.
 */
export default function ScrollHero({ imageSrc, eyebrow, heading, body }: Props) {
  const heroRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const reducedMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  const headlineOpacity = useTransform(scrollYProgress, [0, 1], [1, 0]);
  const headlineScale = useTransform(scrollYProgress, [0, 1], [1, 0.82]);
  const headlineY = useTransform(scrollYProgress, [0, 1], ["0%", "-8%"]);
  const imageY = useTransform(scrollYProgress, [0, 1], ["0%", "24%"]);

  // Applied via a direct, imperative write rather than the `style` prop.
  // Every other scroll-linked value on this page (scale, y, the image's
  // parallax) is transform-based and Motion composites those into a
  // single `transform` string on every frame regardless of prior value.
  // Plain (non-transform) style properties like opacity go through a
  // separate diff-and-bail codepath, and in this component tree Motion
  // was intermittently skipping the write after the reduced-motion
  // effect fires its first post-mount re-render. Setting it by hand
  // sidesteps that entirely and is unaffected by clamping either way.
  useMotionValueEvent(headlineOpacity, "change", (latest) => {
    if (!headingRef.current || reducedMotion) return;
    headingRef.current.style.opacity = String(latest);
  });

  return (
    <div ref={heroRef} className="relative flex min-h-[100svh] items-end overflow-hidden">
      <motion.img
        src={imageSrc}
        alt=""
        style={{ y: reducedMotion ? "0%" : imageY }}
        className="absolute inset-0 h-full w-full object-cover opacity-25"
      />
      {/* Scrim: the photo reads as texture, not content — text legibility
          over a busy production-floor image is craft, not decoration. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-t from-[var(--color-surface-dark)] via-[var(--color-surface-dark)]/75 to-[var(--color-surface-dark)]/35"
      />
      <div className="relative z-10 mx-auto w-full max-w-6xl px-6 pb-16 pt-40 md:px-8 md:pb-24 md:pt-48">
        <p className="label-mono text-accent-dark">{eyebrow}</p>
        <motion.h1
          ref={headingRef}
          style={reducedMotion ? undefined : { scale: headlineScale, y: headlineY }}
          className="hero-display mt-5 max-w-5xl origin-bottom-left text-balance"
        >
          {heading}
        </motion.h1>
        <p className="mt-8 max-w-2xl text-lg leading-relaxed opacity-90">{body}</p>
        <div className="mt-10 flex flex-wrap gap-4">
          <MagneticButton href="/contact" tone="dark">
            Request a consultation
          </MagneticButton>
          <MagneticButton href="/consultancy" tone="dark" variant="ghost">
            Explore our services
          </MagneticButton>
        </div>
      </div>
    </div>
  );
}
