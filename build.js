// @ts-check

import { context } from "esbuild";
import { sassPlugin } from "esbuild-sass-plugin";
import { copy as copyPlugin } from "esbuild-plugin-copy";
import postcss from "postcss";
import tailwindcss from "tailwindcss";
import TailwindSettings from "./tailwind.config.js";
import postcssPresetEnv from "postcss-preset-env";
import autoprefixer from "autoprefixer";
import cssnano from "cssnano";

const isDev =
  process.argv.includes("--dev") || process.env.NODE_ENV === "development";

const ctx = await context({
  entryPoints: ["src/js/index.tsx"],
  bundle: true,
  minify: !isDev,
  sourcemap: isDev ? "linked" : false,
  legalComments: "none",
  target: "ES2021",
  outdir: "dist",
  platform: "browser",
  tsconfig: "tsconfig.json",
  //external: ["tailwindcss", "autoprefixer"],
  logLevel: "info",
  loader: {
    ".webp": "file",
  },
  plugins: [
    sassPlugin({
      type: "style",
      filter: /\.s(c|a)ss$/,
      async transform(source, resolveDir) {
        const { css } = await postcss([
          tailwindcss(TailwindSettings),
          autoprefixer,
          cssnano,
          postcssPresetEnv,
        ]).process(source, { from: undefined });
        return css;
      },
    }),
    copyPlugin({
      resolveFrom: "cwd",
      assets: [
        { from: "src/assets/icon.png", to: "dist/icon.png" },
        { from: "public/**/*", to: "dist/" },
      ],
    }),
  ],
});

process.on("beforeExit", () => {
  ctx.dispose();
});

if (!isDev) {
  await ctx.rebuild();
  process.exit(0);
}

(async () => {
  await ctx.watch();
  const { host, port } = await ctx.serve({
    servedir: "dist",
  });
  console.log(`Serving on http://${host}:${port}`);
})();
