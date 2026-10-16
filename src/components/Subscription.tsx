import { subscription } from "@/content/site";
import s from "./Subscription.module.css";

export function Subscription() {
  return (
    <section className={s.band} id="podpiska" aria-labelledby="sub-title">
      <div className={s.ticket} data-reveal="rise">
        <div className={s.main}>
          <h2 id="sub-title" className={s.title}>
            Подписка
          </h2>
          <p className={s.what}>{subscription.what}</p>
          <ul className={s.terms}>
            {subscription.terms.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </div>
        <div className={s.stub}>
          <p className={s.price}>
            {subscription.price}&nbsp;<span className={s.currency}>BYN</span>
          </p>
          <p className={s.per}>в месяц, доставка включена</p>
          <a className={`button ${s.action}`} href="#zayavka" data-lead-interest="subscription">
            Оформить подписку
          </a>
        </div>
      </div>
      <p className={s.after} data-reveal="rise" style={{ ["--i" as string]: 1 }}>
        Не нужно следить, когда кончится пачка: раз в месяц свежая обжарка приезжает сама.
      </p>
    </section>
  );
}
