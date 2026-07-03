import type { MetadataRoute } from "next";

// PWA マニフェスト (Next App Router が /manifest.webmanifest として配信)
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "URANAI — 私的占断 N°143",
    short_name: "URANAI",
    description: "しゅんすけ専用のクローズドな占いダッシュボード。",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#f6f2ea",
    theme_color: "#f6f2ea",
    lang: "ja",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
