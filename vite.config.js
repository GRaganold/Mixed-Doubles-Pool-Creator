// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "/Mixed-Doubles-Pool-Creator/", // Match exact casing
  plugins: [react()],
});
