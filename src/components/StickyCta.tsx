"use client";

import { useEffect, useState } from "react";
import s from "./StickyCta.module.css";

/**
 * Кнопка заявки внизу экрана на телефоне. Появляется, когда первый экран ушёл вверх,
 * и прячется, пока на экране форма или подвал (там своя кнопка).
 */
export function StickyCta() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const targets = ["top", "zayavka", "podval"]
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);
    const onScreen = new Set<string>();

    const io = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) onScreen.add(entry.target.id);
        else onScreen.delete(entry.target.id);
      }
      setVisible(onScreen.size === 0);
    });
    targets.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <div className={s.bar} data-visible={visible} aria-hidden={!visible}>
      <a className={`button ${s.button}`} href="#zayavka" tabIndex={visible ? 0 : -1}>
        Оставить заявку
      </a>
    </div>
  );
}
