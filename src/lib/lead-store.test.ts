import { readFileSync } from "node:fs";
import { beforeEach, describe, expect, it } from "vitest";
import { PGlite } from "@electric-sql/pglite";
import { createMemoryStore, createPgStore, type Query } from "./lead-store";
import type { LeadInput } from "./lead";

const schema = readFileSync(new URL("../../db/schema.sql", import.meta.url), "utf8");

const lead = (over: Partial<LeadInput> = {}): LeadInput => ({
  name: "Аня",
  phone: "+375291234567",
  interest: "subscription",
  comment: "",
  ...over,
});

describe("Postgres-хранилище (тот же SQL, что в Neon)", () => {
  let db: PGlite;
  let query: Query;

  beforeEach(async () => {
    db = new PGlite();
    await db.exec(schema);
    query = async (text, params) => (await db.query<Record<string, unknown>>(text, params)).rows;
  });

  const count = async () => Number((await query("SELECT count(*)::int AS n FROM leads"))[0].n);

  it("сохраняет заявку и колонки источника из последнего касания", async () => {
    const store = createPgStore(query);
    const res = await store.save(
      lead({
        coffee: "colombia",
        attribution: {
          first: { utm_source: "instagram", fbclid: "IwAR1", landing: "https://kvarta.by/?utm_source=instagram" },
          last: { utm_source: "yandex", utm_medium: "cpc", utm_campaign: "osen", utm_content: "ad-42", yclid: "777" },
          page: "https://kvarta.by/#zayavka",
        },
      }),
    );
    expect(res.status).toBe("created");

    const [row] = await query("SELECT * FROM leads");
    expect(row).toMatchObject({
      phone: "+375291234567",
      coffee: "colombia",
      utm_source: "yandex",
      utm_content: "ad-42",
      click_id: "777",
      click_id_type: "yclid",
      page_url: "https://kvarta.by/#zayavka",
    });
    expect((row.touches as { first: { utm_source: string } }).first.utm_source).toBe("instagram");
  });

  it("повтор того же номера в течение 10 минут не создаёт вторую заявку", async () => {
    const store = createPgStore(query);
    expect((await store.save(lead())).status).toBe("created");
    expect((await store.save(lead({ comment: "ещё раз" }))).status).toBe("duplicate");
    expect(await count()).toBe(1);
  });

  it("двойной клик: два одновременных запроса — одна заявка", async () => {
    const store = createPgStore(query);
    const results = await Promise.all([store.save(lead()), store.save(lead())]);
    expect(results.map((r) => r.status).sort()).toEqual(["created", "duplicate"]);
    expect(await count()).toBe(1);
  });

  it("другой номер — отдельная заявка", async () => {
    const store = createPgStore(query);
    await store.save(lead());
    expect((await store.save(lead({ phone: "+375447654321" }))).status).toBe("created");
    expect(await count()).toBe(2);
  });

  it("после 10 минут тот же номер снова создаёт заявку", async () => {
    const store = createPgStore(query);
    await store.save(lead());
    await query("UPDATE lead_locks SET locked_until = now() - interval '1 second'");
    expect((await store.save(lead())).status).toBe("created");
    expect(await count()).toBe(2);
  });

  it("если заявка не записалась, замок тоже не ставится", async () => {
    const store = createPgStore(query);
    // interest нарушает CHECK — всё выражение откатывается
    await expect(store.save(lead({ interest: "spam" as LeadInput["interest"] }))).rejects.toThrow();
    expect((await query("SELECT count(*)::int AS n FROM lead_locks"))[0].n).toBe(0);
    expect((await store.save(lead())).status).toBe("created");
  });
});

describe("хранилище в памяти для локальной разработки", () => {
  it("держит то же окно в 10 минут", async () => {
    let t = 0;
    const store = createMemoryStore(() => t);
    expect((await store.save(lead())).status).toBe("created");
    t += 9 * 60_000;
    expect((await store.save(lead())).status).toBe("duplicate");
    t += 2 * 60_000;
    expect((await store.save(lead())).status).toBe("created");
  });
});
