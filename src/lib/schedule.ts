// Расписание обжарки «Кварты». Минск живёт по UTC+3 круглый год (без перехода
// на летнее время с 2011), поэтому часовой пояс считаем сдвигом, без Intl.

const MINSK_OFFSET_MS = 3 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

/** Заявки на партию принимаем до среды, 20:00 (допущение, записано в README). */
export const CUTOFF_WEEKDAY = 3; // среда
export const CUTOFF_HOUR = 20;
export const ROAST_WEEKDAY = 4; // четверг: «кварта» — четвёртая
export const DELIVERY_WEEKDAY = 5; // пятница

const WEEKDAYS = [
  "понедельник",
  "вторник",
  "среда",
  "четверг",
  "пятница",
  "суббота",
  "воскресенье",
] as const;

const MONTHS_GENITIVE = [
  "января",
  "февраля",
  "марта",
  "апреля",
  "мая",
  "июня",
  "июля",
  "августа",
  "сентября",
  "октября",
  "ноября",
  "декабря",
] as const;

/** Локальные минские «часы» как Date в UTC: читать только через getUTC*. */
function toMinsk(now: Date): Date {
  return new Date(now.getTime() + MINSK_OFFSET_MS);
}

/** 1 = понедельник … 7 = воскресенье */
function isoWeekday(d: Date): number {
  const day = d.getUTCDay();
  return day === 0 ? 7 : day;
}

function startOfDay(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

export type DayStamp = {
  /** 1 = пн … 7 = вс */
  weekday: number;
  weekdayName: string;
  day: number;
  /** «22 октября» */
  long: string;
  /** «22.10» */
  short: string;
};

function stamp(d: Date): DayStamp {
  const weekday = isoWeekday(d);
  const day = d.getUTCDate();
  const month = d.getUTCMonth();
  return {
    weekday,
    weekdayName: WEEKDAYS[weekday - 1],
    day,
    long: `${day} ${MONTHS_GENITIVE[month]}`,
    short: `${String(day).padStart(2, "0")}.${String(month + 1).padStart(2, "0")}`,
  };
}

export type RoastSchedule = {
  today: DayStamp;
  /** В какую обжарку попадёт заявка, оставленная сейчас */
  roast: DayStamp;
  delivery: DayStamp;
  /** Последний день приёма заявок на эту партию (до CUTOFF_HOUR) */
  cutoff: DayStamp;
  /** Через сколько дней обжарка: 0 — сегодня (но уже в следующую партию не успеть) */
  daysToRoast: number;
};

export function getRoastSchedule(now: Date = new Date()): RoastSchedule {
  const local = toMinsk(now);
  const today = startOfDay(local);
  const weekday = isoWeekday(local);

  const beforeCutoff =
    weekday < CUTOFF_WEEKDAY ||
    (weekday === CUTOFF_WEEKDAY && local.getUTCHours() < CUTOFF_HOUR);

  let daysToRoast = ROAST_WEEKDAY - weekday;
  if (!beforeCutoff) daysToRoast += 7;

  const roast = new Date(today.getTime() + daysToRoast * DAY_MS);
  const delivery = new Date(roast.getTime() + (DELIVERY_WEEKDAY - ROAST_WEEKDAY) * DAY_MS);
  const cutoff = new Date(roast.getTime() - (ROAST_WEEKDAY - CUTOFF_WEEKDAY) * DAY_MS);

  return {
    today: stamp(today),
    roast: stamp(roast),
    delivery: stamp(delivery),
    cutoff: stamp(cutoff),
    daysToRoast,
  };
}
