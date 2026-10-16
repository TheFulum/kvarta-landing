"use client";

import { useEffect } from "react";

/**
 * Один наблюдатель на страницу: элементам с data-reveal ставит .is-in, когда они въезжают в экран.
 * Скрытое состояние в CSS включается только под html.js, так что без JS всё видно сразу.
 */
export function RevealObserver() {
  useEffect(() => {
    (window as Window & { __revealReady?: boolean }).__revealReady = true;
    const items = document.querySelectorAll<HTMLElement>("[data-reveal]");
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add("is-in");
          io.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -12% 0px" },
    );
    items.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return null;
}
