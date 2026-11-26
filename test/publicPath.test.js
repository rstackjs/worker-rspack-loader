import path from "path";
import { runInNewContext } from "vm";

import { customAlphabet } from "nanoid";

import {
  compile,
  getCompiler,
  getErrors,
  getModuleSource,
  getResultFromBrowser,
  getWarnings,
  readAsset,
} from "./helpers";

describe('"publicPath" option', () => {
  it.each([
    ["configured base", { publicPath: "/workers/" }, "/workers/test.worker.js"],
    ["relative URL", { publicPath: "" }, "test.worker.js"],
    [
      "function",
      { publicPath: ({ filename }) => (filename ? "/by-name/" : "/") },
      "/by-name/test.worker.js",
    ],
    [
      "inline fallback",
      { publicPath: "/workers/", inline: "fallback" },
      "/workers/test.worker.js",
    ],
    ["inherited base", {}, "/assets/test.worker.js"],
    ["automatic base", { publicPath: "auto" }, "/assets/test.worker.js"],
  ])(
    "passes the expected URL to SharedWorker (%s)",
    async (_, options, expected) => {
      const compiler = getCompiler(
        "./basic/worker.js",
        { worker: "SharedWorker", ...options },
        {
          output: {
            path: path.resolve(__dirname, "outputs/public-path"),
            filename: "main.js",
            publicPath: "/assets/",
            library: { name: "createWorker", type: "var", export: "default" },
          },
        }
      );
      const stats = await compile(compiler);
      expect(getErrors(stats)).toEqual([]);

      class SharedWorker {
        constructor(url) {
          if (url.startsWith("data:"))
            throw new Error("Inline workers are disabled");
          this.url = url;
        }
      }
      const page = { SharedWorker };
      page.self = page;
      runInNewContext(readAsset("main.js", compiler, stats), page);
      expect(page.createWorker().url).toBe(expected);
    }
  );

  it('should work and use "__webpack_public_path__" by default', async () => {
    const compiler = getCompiler("./chunks/entry.js");
    const stats = await compile(compiler);
    const result = await getResultFromBrowser(stats);

    expect(getModuleSource("./chunks/worker.js", stats)).toMatchSnapshot(
      "module"
    );
    expect(result).toMatchSnapshot("result");
    expect(getWarnings(stats)).toMatchSnapshot("warnings");
    expect(getErrors(stats)).toMatchSnapshot("errors");
  });

  it('should work and respect the "publicPath" option ("string")', async () => {
    const compiler = getCompiler("./chunks/entry.js", {
      publicPath: "/public-path-static/",
    });
    const stats = await compile(compiler);
    const result = await getResultFromBrowser(stats);

    expect(getModuleSource("./chunks/worker.js", stats)).toMatchSnapshot(
      "module"
    );
    expect(result).toMatchSnapshot("result");
    expect(getWarnings(stats)).toMatchSnapshot("warnings");
    expect(getErrors(stats)).toMatchSnapshot("errors");
  });

  it('should work and respect the "publicPath" option ("function")', async () => {
    const compiler = getCompiler("./chunks/entry.js", {
      publicPath: () => `/public-path-static/`,
    });
    const stats = await compile(compiler);
    const result = await getResultFromBrowser(stats);

    expect(getModuleSource("./chunks/worker.js", stats)).toMatchSnapshot(
      "module"
    );
    expect(result).toMatchSnapshot("result");
    expect(getWarnings(stats)).toMatchSnapshot("warnings");
    expect(getErrors(stats)).toMatchSnapshot("errors");
  });

  it('should work and respect the "output.publicPath" option default value', async () => {
    const nanoid = customAlphabet("1234567890abcdef", 10);
    const compiler = getCompiler(
      "./chunks/entry.js",
      {},
      {
        output: {
          path: path.resolve(__dirname, "./outputs", `test_${nanoid()}`),
          filename: "[name].bundle.js",
          chunkFilename: "[name].chunk.js",
          publicPath: "",
        },
      }
    );
    const stats = await compile(compiler);
    const result = await getResultFromBrowser(stats);

    expect(getModuleSource("./chunks/worker.js", stats)).toMatchSnapshot(
      "module"
    );
    expect(result).toMatchSnapshot("result");
    expect(getWarnings(stats)).toMatchSnapshot("warnings");
    expect(getErrors(stats)).toMatchSnapshot("errors");
  });

  it('should work and respect the "output.publicPath" option value ("string")', async () => {
    const nanoid = customAlphabet("1234567890abcdef", 10);
    const compiler = getCompiler(
      "./chunks/entry.js",
      {},
      {
        output: {
          publicPath: "/public-path-static/",
          path: path.resolve(__dirname, "./outputs", `test_${nanoid()}`),
          filename: "[name].bundle.js",
          chunkFilename: "[name].chunk.js",
        },
      }
    );
    const stats = await compile(compiler);
    const result = await getResultFromBrowser(stats);

    expect(getModuleSource("./chunks/worker.js", stats)).toMatchSnapshot(
      "module"
    );
    expect(result).toMatchSnapshot("result");
    expect(getWarnings(stats)).toMatchSnapshot("warnings");
    expect(getErrors(stats)).toMatchSnapshot("errors");
  });

  it('should work and respect the "output.publicPath" option value ("function")', async () => {
    const nanoid = customAlphabet("1234567890abcdef", 10);
    const compiler = getCompiler(
      "./chunks/entry.js",
      {},
      {
        output: {
          publicPath: () => "/public-path-static/",
          path: path.resolve(__dirname, "./outputs", `test_${nanoid()}`),
          filename: "[name].bundle.js",
          chunkFilename: "[name].chunk.js",
        },
      }
    );
    const stats = await compile(compiler);
    const result = await getResultFromBrowser(stats);

    expect(getModuleSource("./chunks/worker.js", stats)).toMatchSnapshot(
      "module"
    );
    expect(result).toMatchSnapshot("result");
    expect(getWarnings(stats)).toMatchSnapshot("warnings");
    expect(getErrors(stats)).toMatchSnapshot("errors");
  });

  it('should work and respect "filename" and "chunkFilename" option values', async () => {
    const nanoid = customAlphabet("1234567890abcdef", 10);
    const compiler = getCompiler(
      "./chunks/entry.js",
      {},
      {
        module: {
          rules: [
            {
              test: /worker\.js$/i,
              rules: [
                {
                  loader: path.resolve(__dirname, "./../src"),
                },
              ],
            },
          ],
        },
        output: {
          publicPath: "/public-path-static-other/",
          path: path.resolve(__dirname, "./outputs", `test_${nanoid()}`),
          filename: "other-static/js/[name].bundle.js",
          chunkFilename: "other-static/js/[name].chunk.js",
        },
      }
    );
    const stats = await compile(compiler);
    const result = await getResultFromBrowser(stats);

    expect(getModuleSource("./chunks/worker.js", stats)).toMatchSnapshot(
      "module"
    );
    expect(result).toMatchSnapshot("result");
    expect(getWarnings(stats)).toMatchSnapshot("warnings");
    expect(getErrors(stats)).toMatchSnapshot("errors");
  });

  it('should work and respect "filename" and "chunkFilename" option values', async () => {
    const compiler = getCompiler("./chunks/entry.js", {
      publicPath: "/public-path-static-other/",
      filename: "other-static/js/[name].worker.js",
      chunkFilename: "other-static/js/[name].chunk.worker.js",
    });
    const stats = await compile(compiler);
    const result = await getResultFromBrowser(stats);

    expect(getModuleSource("./chunks/worker.js", stats)).toMatchSnapshot(
      "module"
    );
    expect(result).toMatchSnapshot("result");
    expect(getWarnings(stats)).toMatchSnapshot("warnings");
    expect(getErrors(stats)).toMatchSnapshot("errors");
  });
});
