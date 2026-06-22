import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

// ⚠️ غيّر base ليطابق اسم مستودعك على GitHub.
// مثال: مستودع اسمه medexpo-hub  →  base: "/medexpo-hub/"
// لو نشرته على نطاق مخصّص أو user-page (username.github.io) خلّيه "/"
const BASE = "/mkhare/";

export default defineConfig({
  base: BASE,
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["icon-192.png", "icon-512.png"],
      manifest: {
        name: "مركز فريق المعرض الطبي",
        short_name: "فريق المعرض",
        description: "جدول الفعاليات وتأكيد الحضور والمهام لفريق المعرض الطبي",
        lang: "ar",
        dir: "rtl",
        start_url: BASE,
        scope: BASE,
        display: "standalone",
        background_color: "#0E0B16",
        theme_color: "#0E0B16",
        icons: [
          { src: "icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "icon-512.png", sizes: "512x512", type: "image/png" },
          { src: "icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" }
        ]
      }
    })
  ]
});
