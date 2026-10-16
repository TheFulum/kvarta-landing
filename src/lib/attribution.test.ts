import { describe, expect, it } from "vitest";
import { touchFrom } from "./attribution";

const now = new Date("2026-10-16T10:00:00Z");

describe("touchFrom", () => {
  it("забирает метки Директа и id объявления", () => {
    const url = new URL(
      "https://kvarta.by/?utm_source=yandex&utm_medium=cpc&utm_campaign=osen&utm_content=ad-42&yclid=123#zerno",
    );
    expect(touchFrom(url, "https://yandex.by/", now)).toEqual({
      utm_source: "yandex",
      utm_medium: "cpc",
      utm_campaign: "osen",
      utm_content: "ad-42",
      yclid: "123",
      landing: "https://kvarta.by/?utm_source=yandex&utm_medium=cpc&utm_campaign=osen&utm_content=ad-42&yclid=123",
      referrer: "https://yandex.by/",
      at: now.toISOString(),
    });
  });

  it("Instagram: без referrer, но с fbclid", () => {
    const touch = touchFrom(new URL("https://kvarta.by/?utm_source=instagram&fbclid=IwAR1"), "", now);
    expect(touch).toMatchObject({ utm_source: "instagram", fbclid: "IwAR1", referrer: undefined });
  });

  it("переход с другого сайта без меток — тоже касание", () => {
    expect(touchFrom(new URL("https://kvarta.by/"), "https://relax.by/coffee", now)).toMatchObject({
      referrer: "https://relax.by/coffee",
    });
  });

  it("переход внутри сайта и прямой заход — не касание", () => {
    expect(touchFrom(new URL("https://kvarta.by/"), "https://kvarta.by/privacy", now)).toBeNull();
    expect(touchFrom(new URL("https://kvarta.by/"), "", now)).toBeNull();
  });
});
