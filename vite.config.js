import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    allowedHosts: ["helper.ewaproduct.com", "6c0989a4af5c.ngrok-free.app"],
    host: "0.0.0.0",
    port: 5173,
  },
});
