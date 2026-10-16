import Image from "next/image";
import { coffees, photos } from "@/content/site";
import s from "./Coffees.module.css";

export function Coffees() {
  return (
    <section className={s.coffees} id="zerno" aria-labelledby="coffee-title">
      <div className={s.column}>
        <h2 id="coffee-title" className={s.giant}>
          Зерно
        </h2>

        <ul className={s.list}>
          {coffees.map((c, i) => (
            <li key={c.id} className={s.item} data-reveal="row" style={{ ["--i" as string]: i }}>
              <div className={s.bar}>
                <h3 className={s.name}>{c.name}</h3>
                <p className={s.price}>
                  {c.price}&nbsp;BYN <span className={s.weight}>за&nbsp;{c.weight}</span>
                </p>
              </div>

              <div className={s.label}>
                <p className={s.notes}>{c.notes}</p>
                <dl className={s.facts}>
                  <div>
                    <dt>Обжарка</dt>
                    <dd>{c.roast}</dd>
                  </div>
                  <div>
                    <dt>Как заваривать</dt>
                    <dd>{c.brew}</dd>
                  </div>
                </dl>
                <a className={`button ${s.order}`} href="#zayavka">
                  Заказать
                </a>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <figure className={s.figure} data-reveal="photo">
        <Image
          className={s.photo}
          src={photos.scoop.src}
          alt={photos.scoop.alt}
          width={photos.scoop.width}
          height={photos.scoop.height}
          sizes="(max-width: 900px) 100vw, 45vw"
        />
      </figure>
    </section>
  );
}
