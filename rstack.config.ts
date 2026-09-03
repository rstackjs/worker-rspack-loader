// Configuration guide: https://rstack.rs/config
import { define } from "rstack";

define.lib({
  bundle: true,
  format: "cjs",
  source: {
    entry: {
      cjs: "./src/cjs.js",
      index: "./src/index.js",
      "runtime/inline": "./src/runtime/inline.js",
    },
  },
  syntax: ["node 18"],
  tools: {
    rspack(config) {
      config.output.library = {
        type: "commonjs2",
      };
    },
  },
});

define.fmt({
  ignorePatterns: ["test/fixtures/**", "CHANGELOG.md"],
  overrides: [{ files: "*.{yml,yaml}", options: { singleQuote: true } }],
  trailingComma: "es5",
});

define.staged({
  "*.{js,jsx,ts,tsx,mjs,cjs,mts,cts}": ["rs lint --fix", "rs fmt"],
  "*.{json,md,mdx,css,scss,less,html,yml,yaml}": "rs fmt",
});

define.lint(({ js, ts }) => [js.configs.recommended, ts.configs.recommended]);
