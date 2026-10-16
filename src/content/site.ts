// Все тексты и факты лендинга в одном месте. Факты из ТЗ не трогаем;
// то, что дописано нами (способы заваривания, тексты дней), — помечено в README как допущение.

export const contacts = {
  // В ТЗ телефона нет. Заглушка заведомо не существует: код 29 0xx в Беларуси не выдаётся.
  phone: "+375 29 000-00-00",
  phoneHref: "tel:+375290000000",
  address: "Минск, ул. Короля, 9",
  hoursWeekdays: "пн–пт 8:00–20:00",
  hoursWeekend: "сб–вс 10:00–18:00",
  freeDeliveryFrom: 50,
};

export type Coffee = {
  id: string;
  name: string;
  origin: string;
  notes: string;
  roast: string;
  brew: string;
  weight: string;
  price: number;
};

export const coffees: Coffee[] = [
  {
    id: "ethiopia",
    name: "Эфиопия Иргачеффе",
    origin: "Эфиопия",
    notes: "Цветочный, бергамот",
    roast: "Светлая обжарка",
    brew: "Воронка, кемекс, аэропресс",
    weight: "250 г",
    price: 32,
  },
  {
    id: "colombia",
    name: "Колумбия Уила",
    origin: "Колумбия",
    notes: "Карамель, красное яблоко",
    roast: "Средняя обжарка",
    brew: "Фильтр, турка, гейзер",
    weight: "250 г",
    price: 29,
  },
  {
    id: "brazil",
    name: "Бразилия Серрадо",
    origin: "Бразилия",
    notes: "Орех, шоколад",
    roast: "Под эспрессо",
    brew: "Эспрессо, капучино, гейзер",
    weight: "250 г",
    price: 26,
  },
  {
    id: "drip",
    name: "Дрип-пакеты, ассорти",
    origin: "Три сорта",
    notes: "Все три сорта в пакетах на одну чашку",
    roast: "Заваривается прямо в кружке",
    brew: "Кружка и кипяток",
    weight: "10 штук",
    price: 18,
  },
];

// Условия «пауза», «выбор сорта» и день доставки — наши допущения, в ТЗ их нет (см. README)
export const subscription = {
  price: 54,
  what: "Две пачки по 250 г раз в месяц из свежей четверговой партии.",
  terms: [
    "Сорта выбираете вы или доверяете нам",
    "Привозим в пятницу, доставка бесплатно",
    "Можно поставить на паузу или пропустить месяц",
    "Отменить — одним звонком",
  ],
};

export type WeekDay = {
  weekday: number;
  short: string;
  title: string;
  text: string;
};

export const week: WeekDay[] = [
  { weekday: 1, short: "Пн", title: "Принимаем заявки", text: "Менеджер перезвонит и уточнит сорт и помол." },
  { weekday: 2, short: "Вт", title: "Принимаем заявки", text: "Под каждую заявку откладываем зелёное зерно." },
  { weekday: 3, short: "Ср", title: "Заявки до 20:00", text: "Всё, что пришло до вечера, едет в четверговую партию." },
  { weekday: 4, short: "Чт", title: "Обжарка", text: "Жарим партиями по 5 кг. «Кварта» значит «четвёртая»: четвёртый день недели — день обжарки." },
  { weekday: 5, short: "Пт", title: "Развозим по Минску", text: "Курьер привезёт зерно на следующий день после обжарки. Или заберите сами на Короля, 9." },
  { weekday: 6, short: "Сб", title: "Самовывоз 10–18", text: "Зерно отдыхает, вкус раскрывается." },
  { weekday: 7, short: "Вс", title: "Самовывоз 10–18", text: "Обжарки нет, мастерская открыта." },
];

/** Дни после обжарки → что происходит с зерном. Ширина — доля полосы. */
export const freshness = [
  { days: "0", label: "Обжарка", grow: 1 },
  { days: "1–3", label: "Зерно у вас", grow: 2 },
  { days: "4–7", label: "Вкус раскрывается", grow: 3 },
  { days: "7–30", label: "Лучшее время для чашки", grow: 8 },
];

export type Photo = {
  src: string;
  width: number;
  height: number;
  alt: string;
  author: string;
  page: string;
};

export const photos = {
  roaster: {
    src: "/photos/roaster-lamp.jpg",
    width: 2400,
    height: 1602,
    alt: "Обжарщик высыпает горячее зерно из барабана в лоток остывания под настольной лампой",
    author: "Yanapi Senaud",
    page: "https://unsplash.com/photos/person-pouring-coffee-beans-on-a-machine-6HR8vpjYUHo",
  },
  coolingTray: {
    src: "/photos/cooling-tray.jpg",
    width: 1600,
    height: 2000,
    alt: "Только что обжаренное зерно перемешивается в лотке остывания",
    author: "Scott Soltys-Curry",
    page: "https://unsplash.com/photos/a-close-up-of-a-machine-making-coffee-beans-_7CVm353m7A",
  },
  minsk: {
    src: "/photos/minsk-avenue.jpg",
    width: 1600,
    height: 2397,
    alt: "Утренняя улица в центре Минска, вдоль тротуара стоят машины",
    author: "Vitali Adutskevich",
    page: "https://unsplash.com/photos/a-street-lined-with-parked-cars-and-tall-buildings-bkA0LQZZ51M",
  },
  scoop: {
    src: "/photos/scoop-beans.jpg",
    width: 2000,
    height: 1334,
    alt: "Зерно сыплется из барабана в лоток, рядом совок для проб",
    author: "Tim Mossholder",
    page: "https://unsplash.com/photos/coffee-roasting-in-playa-del-carmen-YC6RVdoTtIk",
  },
} satisfies Record<string, Photo>;
