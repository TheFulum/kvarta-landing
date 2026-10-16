import Link from "next/link";
import { contacts, photos } from "@/content/site";
import s from "./Footer.module.css";

export function Footer() {
  const credits = Object.values(photos);
  return (
    <footer className={s.footer} id="podval">
      <div className={s.tiles}>
        <div className={`${s.tile} ${s.statement}`}>
          <p className={s.big}>Жарим по&nbsp;четвергам с&nbsp;2019&nbsp;года.</p>
          <p className={s.small}>
            Учебный проект: «Кварта» — вымышленная обжарка из&nbsp;тестового задания. <Link href="/privacy">Политика обработки данных</Link>
          </p>
        </div>
        <nav className={`${s.tile} ${s.nav}`} aria-label="Разделы">
          <a href="#zerno">Зерно</a>
          <a href="#nedelya">Неделя обжарки</a>
          <a href="#podpiska">Подписка</a>
          <a href="#dostavka">Доставка и&nbsp;самовывоз</a>
        </nav>
        <div className={`${s.tile} ${s.place}`}>
          <p>{contacts.address}</p>
          <p className={s.small}>
            {contacts.hoursWeekdays}
            <br />
            {contacts.hoursWeekend}
          </p>
        </div>
        <div className={`${s.tile} ${s.call}`}>
          <a className={s.phone} href={contacts.phoneHref}>
            {contacts.phone}
          </a>
        </div>
        <p className={`${s.tile} ${s.wordmark}`} aria-hidden="true">
          Кварта
        </p>
        <a className={`${s.tile} ${s.cta}`} href="#zayavka">
          <span>Оставить заявку</span>
          <svg className={s.arrow} viewBox="0 0 48 48" aria-hidden="true">
            <path d="M10 38 38 10M16 10h22v22" fill="none" stroke="currentColor" strokeWidth="4" />
          </svg>
        </a>
      </div>
      <p className={s.credits}>
        Фото с&nbsp;Unsplash по&nbsp;лицензии Unsplash:{" "}
        {credits.map((p, i) => (
          <span key={p.src}>
            <a href={p.page} rel="noopener">
              {p.author}
            </a>
            {i < credits.length - 1 ? ", " : "."}
          </span>
        ))}
      </p>
    </footer>
  );
}
