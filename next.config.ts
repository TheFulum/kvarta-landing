import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  images: {
    formats: ["image/avif", "image/webp"],
  },
  experimental: {
    // CSS ~9 КБ встраиваем в HTML: посетители из рекламы почти все новые, лишний запрос им дороже кэша
    inlineCss: true,
  },
  turbopack: {
    rules: {
      "*.css": {
        // CSS-модули не трогаем: иначе `as: "*.css"` делает их глобальными и классы теряются
        condition: { not: { path: /\.module\.css$/ } },
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
