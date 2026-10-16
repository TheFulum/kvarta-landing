import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

// Превью ссылки в мессенджерах: та же этикетка, что на первом экране, и неделя с четвергом.
// Собирается при сборке в статичный PNG; даты нет, потому что мессенджеры кэшируют превью надолго.

export const alt = "Кварта — обжарка кофе в Минске. Обжарено в четверг, в пятницу у вас.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const fontsDir = join(process.cwd(), "assets/fonts");
const franklin = readFile(join(fontsDir, "LibreFranklin-Bold.ttf"));
const serif = readFile(join(fontsDir, "SourceSerif4-Regular.ttf"));

const KRAFT = "#b39069";
const PAPER = "#eeede9";
const PAPER_DEEP = "#dfddd7";
const INK = "#1e1915";
const STAMP = "#2241c4";

const days = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

export default async function Image() {
  return new ImageResponse(
    (
      <div style={{ display: "flex", width: "100%", height: "100%", background: KRAFT, padding: 48, gap: 32 }}>
        {/* этикетка */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            width: 600,
            padding: "52px 52px 44px",
            background: PAPER,
            color: INK,
          }}
        >
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontFamily: "Franklin", fontSize: 80, lineHeight: 0.92, letterSpacing: -2.5 }}>ОБЖАРЕНО</div>
            <div style={{ fontFamily: "Franklin", fontSize: 80, lineHeight: 0.92, letterSpacing: -2.5 }}>В ЧЕТВЕРГ</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, fontFamily: "Serif", fontSize: 30, lineHeight: 1.3 }}>
            <div>Маленькая обжарка в Минске.</div>
            <div>Жарим партиями по 5 кг,</div>
            <div>в пятницу привозим по городу.</div>
          </div>
          <div style={{ fontFamily: "Franklin", fontSize: 34, letterSpacing: -0.5 }}>КВАРТА</div>
        </div>

        {/* неделя и штемпель */}
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", flex: 1 }}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              alignSelf: "flex-start",
              marginTop: 24,
              padding: "14px 28px 16px",
              background: STAMP,
              color: "#fff",
              transform: "rotate(-5deg)",
            }}
          >
            <div style={{ fontFamily: "Franklin", fontSize: 56, letterSpacing: -2 }}>ЧТ</div>
            <div style={{ fontFamily: "Franklin", fontSize: 24 }}>обжарка каждую неделю</div>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            {days.map((d) => (
              <div
                key={d}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "flex-start",
                  width: d === "Чт" ? 106 : 54,
                  height: 170,
                  padding: "12px 10px",
                  background: d === "Чт" ? INK : d === "Сб" || d === "Вс" ? PAPER_DEEP : PAPER,
                  color: d === "Чт" ? PAPER : INK,
                  fontFamily: "Franklin",
                  fontSize: 24,
                }}
              >
                {d}
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Franklin", data: await franklin, weight: 700, style: "normal" },
        { name: "Serif", data: await serif, weight: 400, style: "normal" },
      ],
    },
  );
}
