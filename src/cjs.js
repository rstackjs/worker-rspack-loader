// rslint-disable-next-line @typescript-eslint/no-require-imports -- CommonJS entry point
const loader = require("./index");

module.exports = loader.default;
module.exports.pitch = loader.pitch;
