const fs = require('fs');
const transformRunner = require('./transformRunner');
const ignoreRunner = require('./ignoreRunner');
const pulldeps = require('./index');
const builtins = require('./builtins');

function processFiles(files, transform, ignore) {
  return files
    .map(toFileObject)
    .filter(file => !builtins[file.path])
    .reduce((accumulator, file) => {
      const {deps, source, transformed} = build(file, transform, ignore);

      accumulator[file.path] = {
        deps,
        transformed,
        source
      };

      return accumulator;
    }, {});
}

function build(file, transform, ignore) {
  const source = fs.readFileSync(file.path, 'utf8');
  const transformed = transformRunner(transform, source, file);
  const deps = ignoreRunner(ignore, file) ? [] : pulldeps.fromSource(transformed).dependencies;

  return {
    source,
    transformed,
    deps
  };
};

function toFileObject(file) {
  return typeof file === "string" ? {
    path: file,
    name: file
  } : {
    name: file.name,
    path: file.path
  };
}

module.exports = processFiles;
module.exports.build = build;
