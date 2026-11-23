import { useRef } from "react";
import { motion, useMotionValue, useSpring, useReducedMotion } from "motion/react";

interface Props {
  href: string;
  tone?: "light" | "dark";
  variant?: "solid" | "ghost";
  children: React.ReactNode;
}

// Cursor must be within this many px of the button's edge (on top of its
// own footprint) before the pull kicks in — a "proximity radius", not a
// whole-viewport magnet.
const PROXIMITY = 72;
const PULL_STRENGTH = 0.35;
const SPRING = { stiffness: 260, damping: 20, mass: 0.6 };

/**
 * A CTA that gently pulls toward the cursor within a proximity radius
 * and springs back on leave. Real mass/stiffness/damping springs
 * throughout — no linear or eased tweens. Under prefers-reduced-motion
 * the pull is disabled entirely (continuous cursor-tracking motion is a
 * known vestibular trigger); it renders as a plain, static CTA.
 */
export default function MagneticButton({ href, tone = "light", variant = "solid", children }: Props) {
  const ref = useRef<HTMLAnchorElement>(null);
  const reducedMotion = useReducedMotion();

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, SPRING);
  const springY = useSpring(y, SPRING);
  const scale = useSpring(1, { stiffness: 400, damping: 25, mass: 0.5 });

  const handlePointerMove = (e: React.PointerEvent<HTMLAnchorElement>) => {
    if (reducedMotion || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = e.clientX - cx;
    const dy = e.clientY - cy;
    const distance = Math.hypot(dx, dy) - Math.max(rect.width, rect.height) / 2;

    if (distance < PROXIMITY) {
      x.set(dx * PULL_STRENGTH);
      y.set(dy * PULL_STRENGTH);
    } else {
      x.set(0);
      y.set(0);
    }
  };

  const handleLeave = () => {
    x.set(0);
    y.set(0);
  };

  const solid =
    tone === "dark"
      ? "bg-[var(--color-accent-dark)] text-[var(--color-body)]"
      : "bg-[var(--color-accent)] text-[var(--color-surface)]";
  const ghost =
    tone === "dark"
      ? "border border-[var(--color-accent-dark)] text-[var(--color-accent-dark)]"
      : "border border-[var(--color-accent)] text-[var(--color-accent)]";
  const classes = variant === "solid" ? solid : ghost;

  return (
    <motion.a
      ref={ref}
      href={href}
      onPointerMove={handlePointerMove}
      onPointerLeave={handleLeave}
      onPointerDown={() => scale.set(0.98)}
      onPointerUp={() => scale.set(1)}
      style={{ x: springX, y: springY, scale }}
      className={`inline-flex min-h-11 items-center gap-2 px-6 py-3 text-sm font-medium ${classes}`}
    >
      {children}
    </motion.a>
  );
}
