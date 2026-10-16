// Откуда пришёл клиент. При входе на сайт запоминаем метки рекламы, при отправке формы
// прикладываем к заявке: первое касание (30 дней) и последнее (реклама, которая привела сейчас).

import type { Attribution, Touch } from "./lead";

export const TRACKED_PARAMS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
  "yclid", // Яндекс Директ
  "fbclid", // Instagram / Facebook
  "gclid",
] as const;

const FIRST_KEY = "kvarta:touch:first";
const LAST_KEY = "kvarta:touch:last";
const FIRST_TTL_MS = 30 * 24 * 60 * 60 * 1000;
const MAX_URL = 2000;

/** Касание по адресу входа. null — если в адресе нет меток и человек пришёл не со стороннего сайта. */
export function touchFrom(url: URL, referrer: string, now: Date): Touch | null {
  const touch: Touch = {};
  for (const key of TRACKED_PARAMS) {
    const value = url.searchParams.get(key)?.trim();
    if (value) touch[key] = value.slice(0, 300);
  }

  let externalReferrer = "";
  try {
    if (referrer && new URL(referrer).origin !== url.origin) externalReferrer = referrer;
  } catch {
    // битый referrer просто не учитываем
  }

  const hasParams = Object.keys(touch).length > 0;
  if (!hasParams && !externalReferrer) return null;

  const landing = new URL(url.href);
  landing.hash = "";
  return {
    ...touch,
    landing: landing.href.slice(0, MAX_URL),
    referrer: externalReferrer ? externalReferrer.slice(0, MAX_URL) : undefined,
    at: now.toISOString(),
  };
}

function read(key: string): Touch | undefined {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as Touch) : undefined;
  } catch {
    return undefined;
  }
}

function write(key: string, touch: Touch) {
  try {
    localStorage.setItem(key, JSON.stringify(touch));
  } catch {
    // приватный режим Safari и т.п. — живём на текущем касании
  }
}

let current: Touch | null = null;

/** Вызывается один раз при загрузке страницы. */
export function rememberTouch(now = new Date()) {
  const direct: Touch = { landing: location.href.split("#")[0].slice(0, MAX_URL), at: now.toISOString() };
  current = touchFrom(new URL(location.href), document.referrer, now);

  if (current) write(LAST_KEY, current);

  const first = read(FIRST_KEY);
  const firstExpired = !first?.at || now.getTime() - Date.parse(first.at) > FIRST_TTL_MS;
  if (firstExpired) write(FIRST_KEY, current ?? direct);
}

export function readAttribution(): Attribution {
  return {
    first: read(FIRST_KEY) ?? current ?? undefined,
    last: read(LAST_KEY) ?? current ?? undefined,
    page: location.href.slice(0, MAX_URL),
  };
}
