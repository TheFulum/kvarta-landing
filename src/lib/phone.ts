// Проверка белорусского номера. Одна функция и в браузере (подсказка сразу),
// и на сервере (окончательное решение), поэтому без зависимостей.
//
// Шаблоны номеров взяты из метаданных libphonenumber для BY (мобильные и городские);
// тест сверяет нас с libphonenumber на тысячах случайных номеров.

const MOBILE = /^(?:2(?:5[5-79]|9[1-9])|(?:33|44)\d)\d{6}$/;
const FIXED =
  /^(?:1(?:5(?:1[1-5]|[24]\d|6[2-4]|9[1-7])|6(?:[235]\d|4[1-7])|7\d\d)|2(?:1(?:[246]\d|3[0-35-9]|5[1-9])|2(?:[235]\d|4[0-8])|3(?:[26]\d|3[02-79]|4[024-7]|5[03-7])))\d{5}$/;

export type PhoneOk = { ok: true; e164: string; pretty: string; kind: "mobile" | "fixed" };
export type PhoneError = { ok: false; reason: "empty" | "foreign" | "short" | "long" | "code"; message: string };
export type PhoneCheck = PhoneOk | PhoneError;

const EXAMPLE = "+375 29 123-45-67";

const messages: Record<PhoneError["reason"], string> = {
  empty: "Укажите телефон — по нему менеджер перезвонит",
  foreign: "Принимаем белорусские номера: +375 и ещё 9 цифр",
  short: `Не хватает цифр. Нужно +375 и ещё 9, например ${EXAMPLE}`,
  long: `Лишние цифры. Нужно +375 и ещё 9, например ${EXAMPLE}`,
  code: "Такого кода нет. Мобильные начинаются с 25, 29, 33 или 44, городские — с 15, 16, 17, 21, 22 или 23",
};

function fail(reason: PhoneError["reason"]): PhoneError {
  return { ok: false, reason, message: messages[reason] };
}

/** Достаём 9 цифр национального номера из того, как люди их пишут на самом деле. */
function nationalDigits(input: string): string | PhoneError {
  const hasPlus = input.trimStart().startsWith("+");
  const digits = input.replace(/\D/g, "");

  let national: string;
  if (hasPlus) {
    if (!digits.startsWith("375")) return fail("foreign");
    national = digits.slice(3);
  } else if (digits.startsWith("375") && digits.length >= 12) {
    national = digits.slice(3); // 375 29 1234567 без плюса
  } else if (digits.startsWith("80") && digits.length === 11) {
    national = digits.slice(2); // 8 029 123-45-67 — внутренний формат
  } else if (/^[78]\d{10}$/.test(digits)) {
    return fail("foreign"); // 8 9xx … и 7 xxx … — российские/казахстанские
  } else if (digits.startsWith("0") && digits.length === 10) {
    national = digits.slice(1); // 029 123-45-67
  } else {
    national = digits; // 29 123-45-67
  }

  // «+375 (029) …» — лишний ноль перед кодом
  if (national.length === 10 && national.startsWith("0")) national = national.slice(1);

  if (national.length < 9) return fail("short");
  if (national.length > 9) return fail("long");
  return national;
}

export function checkByPhone(input: string): PhoneCheck {
  if (!input.trim()) return fail("empty");

  const national = nationalDigits(input);
  if (typeof national !== "string") return national;

  const kind = MOBILE.test(national) ? "mobile" : FIXED.test(national) ? "fixed" : null;
  if (!kind) return fail("code");

  const pretty = `+375 ${national.slice(0, 2)} ${national.slice(2, 5)}-${national.slice(5, 7)}-${national.slice(7)}`;
  return { ok: true, e164: `+375${national}`, pretty, kind };
}
