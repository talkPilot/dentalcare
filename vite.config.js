import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
export default defineConfig({
  plugins: [react()],
  build: { target: ["es2020", "safari14"] },
  server: {
    port: 5173,
    proxy: { "/api": { target: "http://127.0.0.1:3001", timeout: 240000 } },
  },
});
