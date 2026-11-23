import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring, useReducedMotion } from "motion/react";

/**
 * Custom cursor: a small dot with a trailing ring, spring-follows the
 * pointer and scales up over interactive targets (anything with
 * data-cursor-hover, or a native a/button/[role=button]).
 *
 * Pointer-only by construction: it never renders on a coarse/no-hover
 * device (checked once on mount, before any listener is attached), and
 * it never hides the native cursor until it has actually mounted and
 * confirmed that. Under prefers-reduced-motion it doesn't render at all
 * — the native cursor is a fine, zero-motion fallback.
 */
export default function Cursor() {
  const [enabled, setEnabled] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [pressed, setPressed] = useState(false);
  const reducedMotion = useReducedMotion();

  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const springX = useSpring(x, { stiffness: 500, damping: 40, mass: 0.4 });
  const springY = useSpring(y, { stiffness: 500, damping: 40, mass: 0.4 });

  useEffect(() => {
    if (reducedMotion) return;
    const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (!canHover) return;

    setEnabled(true);
    document.documentElement.classList.add("has-custom-cursor");

    const move = (e: PointerEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      const target = e.target as Element | null;
      setHovering(!!target?.closest('a, button, [role="button"], [data-cursor-hover]'));
    };
    const down = () => setPressed(true);
    const up = () => setPressed(false);
    const leave = () => setEnabled(false);
    const enter = () => setEnabled(true);

    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerdown", down);
    window.addEventListener("pointerup", up);
    document.documentElement.addEventListener("mouseleave", leave);
    document.documentElement.addEventListener("mouseenter", enter);

    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerdown", down);
      window.removeEventListener("pointerup", up);
      document.documentElement.removeEventListener("mouseleave", leave);
      document.documentElement.removeEventListener("mouseenter", enter);
      document.documentElement.classList.remove("has-custom-cursor");
    };
  }, [reducedMotion, x, y]);

  return (
    <motion.div
      aria-hidden="true"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        x: springX,
        y: springY,
        translateX: "-50%",
        translateY: "-50%",
        pointerEvents: "none",
        zIndex: 100,
        opacity: enabled ? 1 : 0,
      }}
    >
      <motion.div
        animate={{
          width: hovering ? 56 : pressed ? 20 : 28,
          height: hovering ? 56 : pressed ? 20 : 28,
          borderColor: hovering ? "var(--color-accent-dark)" : "rgba(250, 250, 249, 0.6)",
        }}
        transition={{ type: "spring", stiffness: 400, damping: 30, mass: 0.5 }}
        style={{
          borderRadius: "9999px",
          border: "1.5px solid rgba(250, 250, 249, 0.6)",
          mixBlendMode: "difference",
        }}
      />
    </motion.div>
  );
}
