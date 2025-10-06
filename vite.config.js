import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    allowedHosts: ["helper.ewaproduct.com", "fb66013648e9.ngrok-free.app"],
    host: "0.0.0.0",
    port: 5173,
  },
});
