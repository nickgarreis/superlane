import path from "path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { visualizer } from "rollup-plugin-visualizer";
import { figmaAssetResolverPlugin } from "./config/figmaAssetResolver";

const analyzeBuild = process.env.ANALYZE === "true";

export default defineConfig({
  plugins: [
    figmaAssetResolverPlugin(),
    // The React and Tailwind plugins are both required for Make, even if
    // Tailwind is not being actively used – do not remove them
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      // Alias @ to the src directory
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) {
            return undefined;
          }
          if (
            id.includes("/react/") ||
            id.includes("/react-dom/") ||
            id.includes("/scheduler/")
          ) {
            return "vendor-react";
          }
          if (id.includes("/react-router") || id.includes("/history/")) {
            return "vendor-router";
          }
          if (id.includes("/convex/") || id.includes("/@convex-dev/")) {
            return "vendor-convex";
          }
          if (id.includes("/motion/") || id.includes("/framer-motion/")) {
            return "vendor-motion";
          }
          if (id.includes("/motion-dom/") || id.includes("/motion-utils/")) {
            return "vendor-motion";
          }
          if (id.includes("/@workos-inc/")) {
            return "vendor-auth";
          }
          if (
            id.includes("/react-dnd/") ||
            id.includes("/react-dnd-html5-backend/") ||
            id.includes("/dnd-core/") ||
            id.includes("/@react-dnd/")
          ) {
            return "vendor-dnd";
          }
          if (id.includes("/@tanstack/")) {
            return "vendor-tanstack";
          }
          if (id.includes("/react-dropzone/") || id.includes("/attr-accept/")) {
            return "vendor-dropzone";
          }
          if (id.includes("/react-day-picker/")) {
            return "vendor-day-picker";
          }
          if (id.includes("/recharts/")) {
            return "vendor-charts";
          }
          if (
            id.includes("/cmdk/") ||
            id.includes("/vaul/") ||
            id.includes("/embla-carousel-react/")
          ) {
            return "vendor-overlays";
          }
          if (id.includes("/react-resizable-panels/")) {
            return "vendor-layout";
          }
          if (id.includes("/@radix-ui/")) {
            return "vendor-radix";
          }
          if (id.includes("/date-fns/") || id.includes("/sonner/") || id.includes("/lucide-react/")) {
            return "vendor-ui";
          }
          if (id.includes("/@emotion/")) {
            return "vendor-emotion";
          }
          return "vendor-misc";
        },
      },
      plugins: analyzeBuild
        ? [
            visualizer({
              filename: "performance-reports/bundle-analysis.html",
              gzipSize: true,
              brotliSize: true,
              template: "treemap",
            }),
          ]
        : undefined,
    },
  },

  // File types to support raw imports. Never add .css, .tsx, or .ts files to this.
  assetsInclude: ["**/*.svg", "**/*.csv"],
});
