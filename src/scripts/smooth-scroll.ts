import Lenis from "lenis";

/**
 * Site-wide interpolated smooth scroll.
 *
 * Lenis only ever binds to wheel and touch input — it does not attach a
 * keydown listener, so arrow keys, Page Up/Down, Home/End, and Space
 * keep triggering the browser's own native scroll exactly as they
 * always did. Lenis resyncs to that native scroll position on its own
 * "scroll" listener instead of fighting it, so keyboard scrolling is
 * never intercepted, delayed, or smoothed — only wheel/touch input is.
 *
 * Disabled entirely under prefers-reduced-motion: scroll-linked motion,
 * parallax, and interpolated scrolling are exactly the class of effect
 * that triggers vestibular discomfort, and native instant scroll behind
 * the reduced-motion media query already covers everyone who needs it.
 */
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (!prefersReducedMotion) {
  new Lenis({
    autoRaf: true,
    duration: 1.1,
    easing: (t: number) => 1 - Math.pow(1 - t, 3),
  });
}
