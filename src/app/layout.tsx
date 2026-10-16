import type { Metadata, Viewport } from "next";
import { Libre_Franklin, Source_Serif_4 } from "next/font/google";
import "./globals.css";

const display = Libre_Franklin({
  variable: "--font-display",
  subsets: ["cyrillic", "latin"],
  weight: "700",
});

// без курсива: он нужен был только для подписи в письме, а это ещё два файла шрифта на старте
const text = Source_Serif_4({
  variable: "--font-text",
  subsets: ["cyrillic", "latin"],
});

const title = "Кварта — обжарка кофе в Минске по четвергам";
const description =
  "Маленькая обжарка в Минске. Жарим по четвергам партиями по 5 кг, в пятницу развозим по городу: зерно приходит на 1–3 день после обжарки. Пачка 250 г от 26 BYN, подписка 54 BYN в месяц.";

// На Vercel адрес продакшена приходит из окружения; от него строятся абсолютные ссылки превью
const siteUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title,
  description,
  openGraph: {
    type: "website",
    locale: "ru_RU",
    siteName: "Кварта",
    title,
    description,
    url: "/",
  },
  twitter: { card: "summary_large_image", title, description },
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
