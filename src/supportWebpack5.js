import {
  workerGenerator,
  sourceMappingURLRegex,
  sourceURLWebpackRegex,
} from "./utils";

function getWorkerUrl(compilation, chunk, filename, options) {
  const { publicPath } = options;
  if (options.inline === "no-fallback") return undefined;
  if (publicPath === undefined || publicPath === "auto") {
    return `__webpack_public_path__ + ${JSON.stringify(filename)}`;
  }

  const data = { hash: compilation.hash, chunk, filename };
  const template =
    typeof publicPath === "function"
      ? publicPath(data, compilation.getAsset(filename).info)
      : publicPath;
  return JSON.stringify(compilation.getPath(template, data) + filename);
}

export default function runAsChild(
  loaderContext,
  workerContext,
  options,
  callback
) {
  workerContext.compiler.runAsChild((error, entries, compilation) => {
    if (error) {
      return callback(error);
    }

    if (entries[0]) {
      const [workerFilename] = [...entries[0].files];
      let workerUrl;
      try {
        workerUrl = getWorkerUrl(
          compilation,
          entries[0],
          workerFilename,
          options
        );
      } catch (pathError) {
        return callback(pathError);
      }
      const cache = workerContext.compiler.getCache("worker-loader");
      const cacheIdent = JSON.stringify([workerFilename, workerUrl]);
      const cacheETag = cache.getLazyHashedEtag(
        compilation.assets[workerFilename]
      );

      return cache.get(cacheIdent, cacheETag, (getCacheError, content) => {
        if (getCacheError) {
          return callback(getCacheError);
        }

        if (options.inline === "no-fallback") {
          // eslint-disable-next-line no-underscore-dangle, no-param-reassign
          delete loaderContext._compilation.assets[workerFilename];

          // TODO improve this, we should store generated source maps files for file in `assetInfo`
          // eslint-disable-next-line no-underscore-dangle
          if (loaderContext._compilation.assets[`${workerFilename}.map`]) {
            // eslint-disable-next-line no-underscore-dangle, no-param-reassign
            delete loaderContext._compilation.assets[`${workerFilename}.map`];
          }
        }

        if (content) {
          return callback(null, content);
        }

        let workerSource = compilation.assets[workerFilename].source();

        if (options.inline === "no-fallback") {
          // Remove `/* sourceMappingURL=url */` comment
          workerSource = workerSource.replace(sourceMappingURLRegex, "");

          // Remove `//# sourceURL=webpack-internal` comment
          workerSource = workerSource.replace(sourceURLWebpackRegex, "");
        }

        const workerCode = workerGenerator(
          loaderContext,
          workerUrl,
          workerSource,
          options
        );
        const workerCodeBuffer = Buffer.from(workerCode);

        return cache.store(
          cacheIdent,
          cacheETag,
          workerCodeBuffer,
          (storeCacheError) => {
            if (storeCacheError) {
              return callback(storeCacheError);
            }

            return callback(null, workerCodeBuffer);
          }
        );
      });
    }

    return callback(
      new Error(
        `Failed to compile web worker "${workerContext.request}" request`
      )
    );
  });
}
