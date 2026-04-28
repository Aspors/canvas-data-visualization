import { resolve } from "path";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

export default defineConfig({
  plugins: [
    dts({
      insertTypesEntry: true,
      include: ["src/**/*.ts"],
    }),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      name: "CanvasLogChart",
      formats: ["es", "umd"],
      fileName: (format) => `canvas-log-chart.${format}.js`,
    },
    sourcemap: true,
  },
});
