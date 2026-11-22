"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

const INTERACTIVE_SELECTOR =
  'a, button, [role="button"], [data-cursor="pointer"]';

export function CustomCursor() {
  const [enabled, setEnabled] = useState(false);
  const dotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    setEnabled(mq.matches);
    document.documentElement.classList.add("custom-cursor");
    return () => {
      document.documentElement.classList.remove("custom-cursor");
    };

    const onChange = (e: MediaQueryListEvent) => setEnabled(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const dot = dotRef.current;
    if (!dot) return;

    gsap.set(dot, { xPercent: -50, yPercent: -50, opacity: 0, scale: 8 / 28 });

    const xTo = gsap.quickTo(dot, "x", { duration: 0.22, ease: "power3.out" });
    const yTo = gsap.quickTo(dot, "y", { duration: 0.22, ease: "power3.out" });

    let visible = false;
    let hovered = false;

    const onMove = (e: MouseEvent) => {
      if (!visible) {
        visible = true;
        gsap.to(dot, { opacity: 1, duration: 0.15, ease: "power2.out" });
      }
      xTo(e.clientX);
      yTo(e.clientY);
    };

    const onOver = (e: MouseEvent) => {
      const next = Boolean(
        (e.target as Element | null)?.closest(INTERACTIVE_SELECTOR)
      );
      if (next === hovered) return;
      hovered = next;
      gsap.to(dot, {
        scale: next ? 1 : 8 / 28,
        backgroundColor: next ? "rgba(14, 14, 14, 0.12)" : "#0E0E0E",
        borderColor: next ? "rgba(14, 14, 14, 0.45)" : "transparent",
        duration: 0.2,
        ease: "power3.out",
      });
    };

    const onHide = () => {
      if (!visible) return;
      visible = false;
      gsap.to(dot, { opacity: 0, duration: 0.15, ease: "power2.out" });
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    document.addEventListener("mouseover", onOver, { passive: true });
    document.documentElement.addEventListener("mouseleave", onHide);
    window.addEventListener("blur", onHide);

    return () => {
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseover", onOver);
      document.documentElement.removeEventListener("mouseleave", onHide);
      window.removeEventListener("blur", onHide);
      gsap.killTweensOf(dot);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div
      ref={dotRef}
      aria-hidden="true"
      className="pointer-events-none fixed top-0 left-0 z-50 hidden size-7 rounded-full border border-transparent bg-foreground will-change-transform [@media(hover:hover)_and_(pointer:fine)]:block"
    />
  );
}
