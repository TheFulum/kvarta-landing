import Image from "next/image";
import { photos, coffees, contacts } from "@/content/site";
import { RoastStamp, NextBatchDetails } from "./HeroLive";
import s from "./Hero.module.css";

// «от … за 250 г» считаем только по пачкам: дрип-пакеты продаются по 10 штук
const minPrice = Math.min(...coffees.filter((c) => c.weight === "250 г").map((c) => c.price));

export function Hero() {
  return (
    <header className={s.hero} id="top">
      <Image
        className={s.photo}
        src={photos.roaster.src}
        alt=""
        fill
        sizes="100vw"
        loading="eager"
        fetchPriority="high"
      />

      <nav className={s.bar} aria-label="Основная навигация">
        <a className={s.wordmark} href="#top">
          Кварта
        </a>
        <ul className={s.links}>
          <li>
            <a href="#zerno">Зерно</a>
          </li>
          <li>
            <a href="#nedelya">Неделя</a>
          </li>
          <li>
            <a href="#dostavka">Доставка</a>
          </li>
        </ul>
        <a className={`button ${s.barAction}`} href="#zayavka">
          Оставить заявку
        </a>
      </nav>

      <div className={s.card}>
        <h1 className={s.title}>
          Обжарено
          <br /> в&nbsp;четверг
        </h1>

        <RoastStamp />

        <p className={s.lead}>
          Маленькая обжарка в&nbsp;Минске. Жарим партиями по&nbsp;5&nbsp;кг и&nbsp;в&nbsp;пятницу
          развозим по&nbsp;городу: зерно у&nbsp;вас на&nbsp;<span className={s.nowrap}>1–3&nbsp;день</span> после
          обжарки.
        </p>

        <NextBatchDetails minPrice={minPrice} />

        <div className={s.actions}>
          <a className="button" href="#zayavka">
            Оставить заявку
          </a>
          <a className={s.textLink} href="#zerno">
            Сорта и&nbsp;цены
          </a>
        </div>

        <p className={s.cardFoot}>
          Мастерская и&nbsp;самовывоз: {contacts.address}
          <br />
          {contacts.hoursWeekdays}, {contacts.hoursWeekend}
        </p>
      </div>
    </header>
  );
}
