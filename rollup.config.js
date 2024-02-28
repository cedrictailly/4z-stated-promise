
const terser  = require("@rollup/plugin-terser");
const license = require("rollup-plugin-license");

module.exports = [{
  input : "src/index.mjs",
  output: {
    file     : "dist/4z-stated-promise.min.js",
    format   : "umd",
    name     : "StatedPromise",
    sourcemap: true,
  },
  plugins: [
    terser(),
    license({
      banner: {
        commentStyle: "slash",
        content     : "4z-stated-promise v<%= pkg.version %>\nby <%= pkg.author %>\nMIT Licence",
      },
    }),
  ],
}];
