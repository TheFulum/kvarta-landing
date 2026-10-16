import type { Metadata, Viewport } from "next";
import { Libre_Franklin, Source_Serif_4 } from "next/font/google";
import "./globals.css";

const display = Libre_Franklin({
  variable: "--font-display",
  subsets: ["cyrillic", "latin"],
  weight: "700",
});

const text = Source_Serif_4({
  variable: "--font-text",
  subsets: ["cyrillic", "latin"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "Кварта — обжарка кофе в Минске по четвергам",
  description:
    "Маленькая обжарка в Минске. Жарим по четвергам партиями по 5 кг, в пятницу развозим по городу: зерно приходит на 1–3 день после обжарки.",
};

const revealBootstrap =
  "var d=document.documentElement;d.classList.add('js');" +
  "setTimeout(function(){if(!window.__revealReady)d.classList.remove('js')},4000)";

export const viewport: Viewport = {
  themeColor: "#1e1915",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ru" className={`${display.variable} ${text.variable}`} suppressHydrationWarning>
      <head>
        {/* Анимации появления включаются только при живом JS; если бандл не поднялся за 4 с — показываем всё */}
        <script dangerouslySetInnerHTML={{ __html: revealBootstrap }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
