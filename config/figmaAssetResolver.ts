import path from "path";
import type { Plugin } from "vite";

const FIGMA_ASSET_PREFIX = "figma:asset/";

export const figmaAssetResolverPlugin = (): Plugin => ({
  name: "figma-asset-resolver",
  enforce: "pre",
  resolveId(source) {
    if (!source.startsWith(FIGMA_ASSET_PREFIX)) {
      return null;
    }

    const baseDir = path.resolve(__dirname, "../src/assets");
    const assetPath = source.slice(FIGMA_ASSET_PREFIX.length).replace(/\0/g, "");
    const resolvedPath = path.resolve(baseDir, assetPath);
    const relativePath = path.relative(baseDir, resolvedPath);

    if (relativePath.startsWith("..") || path.isAbsolute(relativePath)) {
      throw new Error(`Invalid figma asset path: ${source}`);
    }

    return resolvedPath;
  },
});
