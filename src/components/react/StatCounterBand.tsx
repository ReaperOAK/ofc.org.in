import { useEffect, useRef, useState } from "react";
import {
  motion,
  useInView,
  useMotionValueEvent,
  useReducedMotion,
  useSpring,
} from "motion/react";

interface Stat {
  value: string;
  label: string;
  tone?: "light" | "dark";
}

interface Props {
  stats: readonly Stat[];
  tone?: "light" | "dark";
}

const LEADING_NUMBER = /^(\d+)(.*)$/;

function StatItem({ value, label, tone, index }: Stat & { index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });
  const reducedMotion = useReducedMotion();
  const match = value.match(LEADING_NUMBER);
  const target = match ? Number(match[1]) : null;
  const suffix = match ? match[2] : "";

  const spring = useSpring(0, { stiffness: 55, damping: 16, mass: 1 });
  const [display, setDisplay] = useState(target ?? 0);

  useMotionValueEvent(spring, "change", (latest) => {
    setDisplay(Math.round(latest));
  });

  useEffect(() => {
    if (!inView || target === null) return;
    if (reducedMotion) {
      setDisplay(target);
      return;
    }
    const timer = setTimeout(() => spring.set(target), index * 120);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, reducedMotion, target]);

  const valueClass = tone === "dark" ? "text-accent-dark" : "text-accent";

  return (
    <motion.div
      ref={ref}
      initial={reducedMotion ? undefined : { opacity: 0, y: 16 }}
      animate={inView ? { opacity: 1, y: 0 } : undefined}
      transition={{ type: "spring", stiffness: 120, damping: 18, mass: 0.7, delay: (index * 120) / 1000 }}
    >
      <p className={`font-display text-4xl tabular-nums md:text-5xl ${valueClass}`}>
        {target === null ? value : `${display}${suffix}`}
      </p>
      <p className="label-mono mt-2 opacity-70">{label}</p>
    </motion.div>
  );
}

export default function StatCounterBand({ stats, tone = "light" }: Props) {
  return (
    <div className="mt-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((s, i) => (
        <StatItem key={s.label} value={s.value} label={s.label} tone={tone} index={i} />
      ))}
    </div>
  );
}
