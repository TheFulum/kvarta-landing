// Заявка: что приходит из формы, как проверяем и во что превращаем перед записью.
// Тексты ошибок общие для браузера и сервера.

import { z } from "zod";
import { checkByPhone } from "./phone";
import { LEAD_FIELDS, leadMessages, type FieldErrors, type Interest, type LeadField } from "./lead-shared";

export { INTERESTS, LEAD_FIELDS, leadMessages } from "./lead-shared";
export type { FieldErrors, Interest, LeadField } from "./lead-shared";

const short = z.string().trim().max(300).optional();
const url = z.string().trim().max(2000).optional();

const touch = z
  .object({
    utm_source: short,
    utm_medium: short,
    utm_campaign: short,
    utm_content: short,
    utm_term: short,
    yclid: short,
    fbclid: short,
    gclid: short,
    landing: url,
    referrer: url,
    at: short,
  })
  .strip();
export type Touch = z.infer<typeof touch>;

const attribution = z
  .object({
    first: touch.optional(),
    last: touch.optional(),
    page: url,
  })
  .strip();
export type Attribution = z.infer<typeof attribution>;

const payload = z.object({
  name: z.string().trim().min(1, leadMessages.name).max(80, leadMessages.name),
  phone: z.string().max(40),
  interest: z.enum(["subscription", "order", "question"], { error: leadMessages.interest }),
  comment: z.string().trim().max(1000, leadMessages.comment).default(""),
  coffee: z.string().trim().max(40).optional(),
  /** Ловушка для ботов: поле спрятано от людей, заполненное — значит бот */
  website: z.string().optional(),
  attribution: attribution.optional(),
});

export type LeadInput = {
  name: string;
  phone: string; // E.164
  interest: Interest;
  comment: string;
  coffee?: string;
  attribution?: Attribution;
  userAgent?: string;
};

/** Пустой fields при ok: false — запрос сломан не в полях формы (мусор вместо JSON-объекта). */
export type ParseResult =
  | { ok: true; lead: LeadInput; bot: boolean }
  | { ok: false; fields: FieldErrors };

function rawPhone(body: unknown): string {
  if (body && typeof body === "object" && "phone" in body && typeof body.phone === "string") return body.phone;
  return "";
}

export function parseLead(body: unknown): ParseResult {
  const parsed = payload.safeParse(body);
  const fields: FieldErrors = {};

  if (!parsed.success) {
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (typeof key === "string" && (LEAD_FIELDS as readonly string[]).includes(key)) {
        fields[key as LeadField] ??= issue.message;
      }
    }
  }

  // телефон проверяем всегда, чтобы человек увидел все ошибки сразу
  const phone = checkByPhone(rawPhone(body));
  if (!phone.ok) fields.phone = phone.message;

  if (!parsed.success || !phone.ok) return { ok: false, fields };

  const { name, interest, comment, coffee, website, attribution } = parsed.data;
  return {
    ok: true,
    bot: Boolean(website?.trim()),
    lead: { name, phone: phone.e164, interest, comment, coffee: coffee || undefined, attribution },
  };
}

/** Колонки «откуда пришёл» берём из последнего касания: это реклама, которая привела сейчас. */
export function sourceColumns(attribution: Attribution | undefined) {
  const t = attribution?.last ?? attribution?.first ?? {};
  const clickId = t.yclid ? ["yclid", t.yclid] : t.fbclid ? ["fbclid", t.fbclid] : t.gclid ? ["gclid", t.gclid] : [null, null];
  return {
    utm_source: t.utm_source ?? null,
    utm_medium: t.utm_medium ?? null,
    utm_campaign: t.utm_campaign ?? null,
    utm_content: t.utm_content ?? null,
    utm_term: t.utm_term ?? null,
    click_id: clickId[1],
    click_id_type: clickId[0],
    landing_url: t.landing ?? null,
    referrer: t.referrer ?? null,
    page_url: attribution?.page ?? null,
  };
}
