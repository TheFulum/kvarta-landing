import { contacts } from "@/content/site";
import s from "./About.module.css";

export function About() {
  return (
    <section className={s.about} id="o-nas" aria-label="О мастерской">
      <article className={s.sheet} data-reveal="rise">
        <p>
          Мы — Аня и&nbsp;Дмитрий. Несколько лет стояли за&nbsp;стойкой бариста и&nbsp;видели, как кофе, обжаренный
          пару месяцев назад, тускнеет в&nbsp;чашке, как аккуратно его ни&nbsp;заваривай.
        </p>
        <p>
          В&nbsp;2019 году мы начали жарить сами. Партия у&nbsp;нас — 5&nbsp;кг: столько успеваем обжарить, остудить
          и&nbsp;разложить по&nbsp;пачкам за&nbsp;один четверг.
        </p>
        <p>
          Поэтому жарим под заявки. Всё, что пришло до&nbsp;среды, обжариваем в&nbsp;четверг,{" "}
          <mark className={s.mark}>а&nbsp;в&nbsp;пятницу оно уже едет к&nbsp;вам</mark>.
        </p>
        <p>
          Если не&nbsp;знаете, что выбрать, просто расскажите, как вы завариваете кофе дома или в&nbsp;офисе. Подберём
          сорт и&nbsp;помол и&nbsp;подскажем рецепт.
        </p>
        <footer className={s.sign}>
          <p className={s.names}>Аня и&nbsp;Дмитрий</p>
          <p className={s.role}>основатели «Кварты», бывшие бариста</p>
        </footer>
        <div className={s.strip}>
          <p>
            Мастерская: {contacts.address}. Заходите за&nbsp;зерном — {contacts.hoursWeekdays}, {contacts.hoursWeekend}.
          </p>
        </div>
      </article>
    </section>
  );
}
