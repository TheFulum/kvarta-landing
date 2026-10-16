import { describe, expect, it } from "vitest";
import { parsePhoneNumberFromString } from "libphonenumber-js/max";
import { checkByPhone } from "./phone";

describe("checkByPhone: как люди пишут номер", () => {
  it.each([
    ["+375 29 123-45-67", "+375291234567"],
    ["+375 (29) 123-45-67", "+375291234567"],
    ["+375291234567", "+375291234567"],
    ["375291234567", "+375291234567"],
    ["8 029 123 45 67", "+375291234567"],
    ["8(029)1234567", "+375291234567"],
    ["80291234567", "+375291234567"],
    ["029 123-45-67", "+375291234567"],
    ["29 123 45 67", "+375291234567"],
    ["+375 (029) 123-45-67", "+375291234567"],
    ["  +375 44 555 66 77 ", "+375445556677"],
    ["+375 33 765-43-21", "+375337654321"],
    ["+375 25 512-34-56", "+375255123456"],
    // городские
    ["+375 17 123-45-67", "+375171234567"],
    ["8 017 123-45-67", "+375171234567"],
    ["+375 152 12-34-56", "+375152123456"],
    ["+375 232 12-34-56", "+375232123456"],
  ])("%s → %s", (input, e164) => {
    const res = checkByPhone(input);
    expect(res).toMatchObject({ ok: true, e164 });
  });

  it("форматирует номер для менеджера", () => {
    expect(checkByPhone("80291234567")).toMatchObject({ pretty: "+375 29 123-45-67", kind: "mobile" });
    expect(checkByPhone("+375171234567")).toMatchObject({ kind: "fixed" });
  });
});

describe("checkByPhone: понятная причина отказа", () => {
  it.each([
    ["", "empty"],
    ["   ", "empty"],
    ["+7 916 123-45-67", "foreign"],
    ["8 916 123 45 67", "foreign"],
    ["+48 501 234 567", "foreign"],
    ["+375 29 123-45", "short"],
    ["29123", "short"],
    ["+375 29 123-45-678", "long"],
    ["+375 24 123-45-67", "code"],
    ["+375 29 023-45-67", "code"],
    ["+375 11 123-45-67", "code"],
    ["+375 800 123-456", "code"],
  ])("%s → %s", (input, reason) => {
    const res = checkByPhone(input);
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.reason).toBe(reason);
      expect(res.message.length).toBeGreaterThan(10);
    }
  });
});

describe("checkByPhone совпадает с libphonenumber", () => {
  it("на 20 000 случайных 9-значных номерах", () => {
    let seed = 42;
    const rand = () => (seed = (seed * 1103515245 + 12345) % 2 ** 31) / 2 ** 31;

    for (let i = 0; i < 20_000; i++) {
      const national = String(Math.floor(rand() * 900_000_000) + 100_000_000);
      const lib = parsePhoneNumberFromString(`+375${national}`);
      const libOk = !!lib?.isValid() && ["MOBILE", "FIXED_LINE"].includes(lib.getType() ?? "");
      const ours = checkByPhone(`+375${national}`).ok;
      if (ours !== libOk) throw new Error(`расхождение на +375${national}: мы ${ours}, libphonenumber ${libOk}`);
    }
  });

  it("на всех трёхзначных префиксах", () => {
    for (let p = 100; p <= 999; p++) {
      for (const tail of ["000000", "123456", "999999"]) {
        const national = `${p}${tail}`;
        const lib = parsePhoneNumberFromString(`+375${national}`);
        const libOk = !!lib?.isValid() && ["MOBILE", "FIXED_LINE"].includes(lib.getType() ?? "");
        expect(checkByPhone(`+375${national}`).ok, `+375${national}`).toBe(libOk);
      }
    }
  });
});
