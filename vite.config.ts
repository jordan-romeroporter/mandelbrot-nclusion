import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/mandelbrot-nclusion/",
  worker: {
    format: "es",
  },
  build: {
    target: "esnext",
    minify: "terser",
  },
});
