// Куда складываем заявки. В проде — Postgres (Neon), локально без DATABASE_URL — память.

import { sourceColumns, type LeadInput } from "./lead";

export const DEDUP_WINDOW_MINUTES = 10;

export type SaveResult = { status: "created"; id: number } | { status: "duplicate" };

export interface LeadStore {
  save(lead: LeadInput): Promise<SaveResult>;
}

/** Параметризованный запрос, возвращающий строки. Подходит и Neon, и PGlite. */
export type Query = (text: string, params?: unknown[]) => Promise<Record<string, unknown>[]>;

/*
  Одно выражение — значит атомарно. CTE пытается поставить замок на номер:
  - номера ещё нет в lead_locks → вставляем замок и заявку;
  - замок есть, но истёк → продлеваем его и вставляем заявку;
  - замок жив → ON CONFLICT … WHERE не обновляет строку, CTE пустой, заявка не вставляется.
  Две одновременные отправки (двойной клик) Postgres упорядочит на конфликте по первичному ключу:
  вторая дождётся первой и увидит живой замок.
*/
const INSERT_LEAD = `
WITH lock AS (
  INSERT INTO lead_locks (phone, locked_until)
  VALUES ($1, now() + make_interval(mins => ${DEDUP_WINDOW_MINUTES}))
  ON CONFLICT (phone) DO UPDATE
    SET locked_until = EXCLUDED.locked_until
    WHERE lead_locks.locked_until <= now()
  RETURNING phone
)
INSERT INTO leads (
  phone, name, interest, comment, coffee,
  utm_source, utm_medium, utm_campaign, utm_content, utm_term,
  click_id, click_id_type, landing_url, referrer, page_url,
  touches, user_agent
)
SELECT lock.phone, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16::jsonb, $17
FROM lock
RETURNING id`;

export function createPgStore(query: Query): LeadStore {
  return {
    async save(lead) {
      const src = sourceColumns(lead.attribution);
      const rows = await query(INSERT_LEAD, [
        lead.phone,
        lead.name,
        lead.interest,
        lead.comment,
        lead.coffee ?? null,
        src.utm_source,
        src.utm_medium,
        src.utm_campaign,
        src.utm_content,
        src.utm_term,
        src.click_id,
        src.click_id_type,
        src.landing_url,
        src.referrer,
        src.page_url,
        lead.attribution ? JSON.stringify({ first: lead.attribution.first, last: lead.attribution.last }) : null,
        lead.userAgent?.slice(0, 500) ?? null,
      ]);
      const id = rows[0]?.id;
      return id === undefined ? { status: "duplicate" } : { status: "created", id: Number(id) };
    },
  };
}

/** Для локальной разработки без базы. Та же логика замка, только в памяти процесса. */
export function createMemoryStore(now: () => number = Date.now): LeadStore & { leads: LeadInput[] } {
  const locks = new Map<string, number>();
  const leads: LeadInput[] = [];
  return {
    leads,
    async save(lead) {
      const until = locks.get(lead.phone);
      if (until !== undefined && until > now()) return { status: "duplicate" };
      locks.set(lead.phone, now() + DEDUP_WINDOW_MINUTES * 60_000);
      leads.push(lead);
      console.info("[lead:memory]", lead.phone, lead.interest, sourceColumns(lead.attribution));
      return { status: "created", id: leads.length };
    },
  };
}

let store: LeadStore | undefined;

export async function getLeadStore(): Promise<LeadStore> {
  if (store) return store;
  const url = process.env.DATABASE_URL;
  if (url) {
    const { neon } = await import("@neondatabase/serverless");
    const sql = neon(url);
    store = createPgStore((text, params) => sql.query(text, params));
  } else if (process.env.NODE_ENV !== "production") {
    console.warn("DATABASE_URL не задан: заявки хранятся в памяти и пропадут после перезапуска");
    store = createMemoryStore();
  } else {
    throw new Error("DATABASE_URL не задан");
  }
  return store;
}
