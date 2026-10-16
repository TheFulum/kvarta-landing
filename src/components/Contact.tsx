import { contacts } from "@/content/site";
import { LeadForm } from "./LeadForm";
import s from "./Contact.module.css";

const mapHref = `https://yandex.by/maps/?text=${encodeURIComponent(contacts.address)}`;

export function Contact() {
  return (
    <section className={s.contact} aria-labelledby="lead-title">
      <div className={s.coupon} id="zayavka">
        <div className={s.stub} data-reveal="rise">
          <h2 id="lead-title" className={s.title}>
            Оставьте
            <br /> заявку
          </h2>
          <p className={s.note}>
            Менеджер перезвонит, уточнит сорт и&nbsp;помол и&nbsp;запишет вас в&nbsp;ближайшую партию. Корзины
            и&nbsp;оплаты на&nbsp;сайте нет: всё решаем по&nbsp;телефону.
          </p>
        </div>
        <div className={s.body}>
          <LeadForm />
        </div>
      </div>

      <div className={s.info} id="dostavka">
        <div data-reveal="rise" style={{ ["--i" as string]: 0 }}>
          <h3 className={s.infoTitle}>Доставка по&nbsp;Минску</h3>
          <p>
            По пятницам, на&nbsp;следующий день после обжарки. От&nbsp;{contacts.freeDeliveryFrom}&nbsp;BYN
            бесплатно, за&nbsp;заказ дешевле стоимость курьера назовёт менеджер.
          </p>
        </div>
        <div data-reveal="rise" style={{ ["--i" as string]: 1 }}>
          <h3 className={s.infoTitle}>Самовывоз</h3>
          <p>
            {contacts.address}. Открыто {contacts.hoursWeekdays}, {contacts.hoursWeekend}. Свежую партию можно
            забрать с&nbsp;пятницы.
          </p>
          <a className={s.link} href={mapHref} target="_blank" rel="noopener">
            Открыть на&nbsp;карте
          </a>
        </div>
        <div data-reveal="rise" style={{ ["--i" as string]: 2 }}>
          <h3 className={s.infoTitle}>Позвонить</h3>
          <p>
            <a className={s.phone} href={contacts.phoneHref}>
              {contacts.phone}
            </a>
          </p>
          <p>Менеджер перезванивает по&nbsp;заявкам в&nbsp;часы работы мастерской.</p>
        </div>
      </div>
    </section>
  );
}
