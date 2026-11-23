import { motion, useReducedMotion } from "motion/react";

interface Props {
  title: string;
  summary: string;
  capabilities: readonly string[];
  href: string;
  index: number;
}

const LIFT_SPRING = { type: "spring" as const, stiffness: 300, damping: 22, mass: 0.7 };

/**
 * Glassmorphism service card: backdrop-blur(20px) over the mesh
 * gradient, a 1px inner-glow border, and a spring lift on hover (real
 * mass/stiffness/damping, no eased tween). Padding is 32px throughout —
 * matching every other card on the page, per the 16px grid rule.
 */
export default function ServiceCardGlass({ title, summary, capabilities, href, index }: Props) {
  const reducedMotion = useReducedMotion();
  const num = String(index).padStart(2, "0");

  return (
    <motion.article
      className="glass-card flex h-full flex-col rounded-2xl p-8"
      whileHover={reducedMotion ? undefined : { y: -8, scale: 1.015 }}
      transition={LIFT_SPRING}
    >
      <p className="label-mono opacity-70">{num}</p>
      <h3 className="mt-4 text-balance font-display text-2xl">{title}</h3>
      <p className="mt-4 max-w-prose text-sm leading-relaxed opacity-80">{summary}</p>
      <ul className="mt-6 space-y-2">
        {capabilities.map((c) => (
          <li key={c} className="text-sm leading-relaxed opacity-90">
            {c}
          </li>
        ))}
      </ul>
      <a href={href} className="label-mono mt-auto self-start pt-8 underline underline-offset-4">
        View {title} services
      </a>
    </motion.article>
  );
}
