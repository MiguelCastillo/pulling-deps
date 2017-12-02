module.exports = {
  src: "src/index.js",
  dest: "dist/index.js",
  loader: [
    "bit-loader-eslint",
    "bit-loader-babel"
  ],
  bundler: {
    umd: "pullingdeps",
    plugins: [
      ["bit-bundler-minifyjs", {
        output: {
          beautify: false,
          preamble: buildBannerString()
        }
      }],
      "bit-bundler-extractsm"
    ]
  }
};

function buildBannerString() {
  var date = new Date();
  var pkg = require("./package");
  return `/*! ${pkg.name} ${pkg.version} - ${date.toDateString()} ${date.getTime()}. (c) ${date.getFullYear()} ${pkg.author}. Licensed under ${pkg.license} */`;
}
