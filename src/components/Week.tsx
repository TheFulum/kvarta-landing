"use client";

import Image from "next/image";
import { week, freshness, photos, contacts } from "@/content/site";
import type { RoastSchedule } from "@/lib/schedule";
import { useSchedule } from "./schedule-context";
import s from "./Week.module.css";

function nowSentence({ today, roast, delivery, daysToRoast }: RoastSchedule): string {
  const when = `обжарим в четверг, ${roast.long}, и привезём в пятницу, ${delivery.long}`;
  if (daysToRoast === 1) {
    return `Сегодня среда, ${today.long}. Успеваете в завтрашнюю партию: заявки принимаем до 20:00, привезём в пятницу, ${delivery.long}.`;
  }
  if (today.weekday === 3) {
    return `Сегодня среда, ${today.long}, приём на эту неделю закрыт. Новую заявку ${when}.`;
  }
  if (today.weekday === 4) {
    return `Сегодня четверг: в мастерской жарят. Новую заявку ${when}.`;
  }
  return `Сегодня ${today.weekdayName}, ${today.long}. Оставите заявку сейчас — ${when}.`;
}

export function Week() {
  const schedule = useSchedule();
  const { today, roast, delivery } = schedule;

  return (
    <section className={s.week} id="nedelya" aria-labelledby="week-title">
      <div className={s.head}>
        <h2 id="week-title" className={s.title}>
          Неделя обжарки
        </h2>
        <p className={s.now} aria-live="polite">
          {nowSentence(schedule)}
        </p>
      </div>

      <ol className={s.days}>
        {week.map((d) => {
          const isToday = d.weekday === today.weekday;
          const kind =
            d.weekday === 4 ? s.roast : d.weekday === 5 ? s.delivery : d.weekday > 5 ? s.weekend : s.plain;

          return (
            <li
              key={d.weekday}
              className={`${s.day} ${kind}`}
              aria-current={isToday ? "date" : undefined}
              data-reveal="rise"
              style={{ ["--i" as string]: d.weekday - 1 }}
            >
              <div className={s.dayHead}>
                <span className={s.dayShort}>{d.short}</span>
                {isToday && <span className={s.todayTag}>сегодня</span>}
              </div>
              <h3 className={s.dayTitle}>{d.title}</h3>
              {d.weekday === 4 && <p className={s.dayDate}>{roast.long}</p>}
              {d.weekday === 5 && <p className={s.dayDate}>{delivery.long}</p>}
              <p className={s.dayText}>{d.text}</p>
              {d.weekday === 4 && (
                <Image
                  className={s.dayPhoto}
                  data-reveal="photo"
                  src={photos.coolingTray.src}
                  alt={photos.coolingTray.alt}
                  width={photos.coolingTray.width}
                  height={photos.coolingTray.height}
                  sizes="(max-width: 900px) 92vw, 22vw"
                />
              )}
              {d.weekday === 5 && (
                <Image
                  className={s.dayPhoto}
                  data-reveal="photo"
                  src={photos.minsk.src}
                  alt={photos.minsk.alt}
                  width={photos.minsk.width}
                  height={photos.minsk.height}
                  sizes="(max-width: 900px) 92vw, 18vw"
                />
              )}
            </li>
          );
        })}
      </ol>

      <div className={s.fresh}>
        <h3 className={s.freshTitle}>Дни после обжарки</h3>
        <ol className={s.scale}>
          {freshness.map((f, i) => (
            <li key={f.days} className={s.step} style={{ ["--grow" as string]: f.grow }} data-step={i}>
              <span className={s.stepBar} aria-hidden="true" data-reveal="bar" style={{ ["--i" as string]: i }} />
              <span className={s.stepDays}>{f.days}</span>
              <span className={s.stepLabel}>{f.label}</span>
            </li>
          ))}
        </ol>
        <p className={s.freshNote}>
          Зерно сразу после обжарки ещё отдаёт газ, поэтому самый полный вкус — через неделю, и&nbsp;он держится
          около месяца. Доставка по&nbsp;Минску в&nbsp;пятницу, от&nbsp;{contacts.freeDeliveryFrom}&nbsp;BYN
          бесплатно. Самовывоз — {contacts.address}.
        </p>
      </div>
    </section>
  );
}
