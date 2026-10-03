import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      "@offbeat/shared": fileURLToPath(new URL("../packages/shared/src/index.ts", import.meta.url)),
    },
  },
  server: {
    port: 5173,
    host: true,
  },
});
