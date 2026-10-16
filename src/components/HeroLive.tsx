"use client";

import { useSchedule } from "./schedule-context";
import s from "./Hero.module.css";

export function RoastStamp() {
  const { roast } = useSchedule();
  return (
    <p className={s.stamp}>
      {/* aria-label на абзаце запрещён, поэтому для скринридера — скрытый текст */}
      <span className="visually-hidden">
        Следующая обжарка — {roast.weekdayName}, {roast.long}
      </span>
      <span className={s.stampDate} aria-hidden="true">
        {roast.short}
      </span>
      <span className={s.stampBottom} aria-hidden="true">
        обжарка, {roast.weekdayName}
      </span>
    </p>
  );
}

export function NextBatchDetails({ minPrice }: { minPrice: number }) {
  const { roast, delivery, cutoff, daysToRoast } = useSchedule();
  // приём заявок всегда заканчивается в среду в 20:00
  const cutoffText = daysToRoast === 1 ? "сегодня до 20:00" : `до среды, ${cutoff.day}-го, 20:00`;

  return (
    <ul className={s.details}>
      <li>Следующая партия — {roast.long}</li>
      <li>Заявки на неё {cutoffText}</li>
      <li>Привезём по Минску {delivery.long}</li>
      <li>От {minPrice}&nbsp;BYN за&nbsp;250&nbsp;г</li>
    </ul>
  );
}
