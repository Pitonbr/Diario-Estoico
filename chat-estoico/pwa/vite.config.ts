import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      manifest: {
        name: "Chat Estoico",
        short_name: "Chat Estoico",
        description: "Seu mentor de reflexão estoica",
        theme_color: "#1B2A4A",
        background_color: "#F5F0EB",
        display: "standalone",
        orientation: "portrait",
        icons: [
          { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "/icon-512.png", sizes: "512x512", type: "image/png" }
        ]
      }
    })
  ],
  server: { port: 5173, proxy: { "/api": { target: "http://localhost:3333", rewrite: p => p.replace(/^\/api/, "") } } }
});
