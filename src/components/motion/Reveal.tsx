"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface RevealProps {
  children: React.ReactNode;
  variant?: "hero" | "image" | "grid" | "fade";
  className?: string;
}

export function Reveal({
  children,
  variant = "fade",
  className,
}: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const mm = gsap.matchMedia();

    mm.add(
      "(prefers-reduced-motion: no-preference)",
      () => {
        if (variant === "hero") {
          const targets = el.children.length ? el.children : el;
          gsap.from(targets, {
            y: 20,
            opacity: 0,
            duration: 0.75,
            stagger: 0.08,
            ease: "power3.out",
            clearProps: "transform",
          });
          return;
        }

        if (variant === "image") {
          gsap.fromTo(
            el,
            { clipPath: "inset(6% 0% 0% 0%)" },
            {
              clipPath: "inset(0% 0% 0% 0%)",
              duration: 0.85,
              ease: "power3.out",
              clearProps: "clipPath",
              scrollTrigger: { trigger: el, start: "top 88%", once: true },
            }
          );
          const imgs = el.querySelectorAll("img");
          if (imgs.length) {
            gsap.fromTo(
              imgs,
              { scale: 1.04 },
              {
                scale: 1,
                duration: 0.85,
                ease: "power3.out",
                clearProps: "transform",
                scrollTrigger: { trigger: el, start: "top 88%", once: true },
              }
            );
          }
          return;
        }

        if (variant === "grid") {
          const targets = el.children.length ? el.children : el;
          gsap.from(targets, {
            y: 20,
            opacity: 0,
            duration: 0.65,
            stagger: 0.07,
            ease: "power3.out",
            clearProps: "transform",
            scrollTrigger: { trigger: el, start: "top 88%", once: true },
          });
          return;
        }

        gsap.from(el, {
          y: 20,
          opacity: 0,
          duration: 0.65,
          ease: "power3.out",
          clearProps: "transform",
          scrollTrigger: { trigger: el, start: "top 88%", once: true },
        });
      },
      ref
    );

    return () => mm.revert();
  }, [variant]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
