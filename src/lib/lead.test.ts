import { describe, expect, it } from "vitest";
import { parseLead, sourceColumns } from "./lead";

const valid = { name: "  Дмитрий ", phone: "8 029 123-45-67", interest: "order", comment: " Колумбия, под турку " };

describe("parseLead", () => {
  it("нормализует телефон и обрезает пробелы", () => {
    const res = parseLead(valid);
    expect(res).toMatchObject({
      ok: true,
      bot: false,
      lead: { name: "Дмитрий", phone: "+375291234567", interest: "order", comment: "Колумбия, под турку" },
    });
  });

  it("возвращает все ошибки полей сразу", () => {
    const res = parseLead({ name: "", phone: "+7 916 000-00-00", interest: "что-то" });
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(Object.keys(res.fields).sort()).toEqual(["interest", "name", "phone"]);
      expect(res.fields.phone).toMatch(/белорусские/);
    }
  });

  it("мусор вместо объекта — ошибка без полей формы, кроме телефона", () => {
    const res = parseLead("hello");
    expect(res.ok).toBe(false);
  });

  it("заполненное поле-ловушка помечает бота", () => {
    const res = parseLead({ ...valid, website: "http://spam" });
    expect(res).toMatchObject({ ok: true, bot: true });
  });

  it("отбрасывает лишние поля в метках", () => {
    const res = parseLead({ ...valid, attribution: { last: { utm_source: "ya", evil: "<script>" } } });
    expect(res.ok && res.lead.attribution?.last).toEqual({ utm_source: "ya" });
  });
});

describe("sourceColumns", () => {
  it("берёт последнее касание, а без него — первое", () => {
    expect(sourceColumns({ first: { utm_source: "instagram", fbclid: "x" } })).toMatchObject({
      utm_source: "instagram",
      click_id: "x",
      click_id_type: "fbclid",
    });
    expect(sourceColumns({ first: { utm_source: "a" }, last: { utm_source: "b" } }).utm_source).toBe("b");
  });

  it("без меток — пустые колонки", () => {
    expect(sourceColumns(undefined)).toMatchObject({ utm_source: null, click_id: null, page_url: null });
  });
});
