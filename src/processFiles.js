const fs = require('fs');
const transformRunner = require('./transformRunner');
const skipRunner = require('./skipRunner');
const pulldeps = require('./index');
const builtins = require('./builtins');

function processFiles(files, options) {
  return files
    .map(toFileObject)
    .filter(file => file.path)
    .reduce((accumulator, file) => {
      const {deps, source, transformed} = build(file, options);

      accumulator[file.path] = {
        deps,
        transformed,
        source
      };

      return accumulator;
    }, {});
}

function build(file, {transform, skipTransforms, skipDependencies, includeSource}) {
  if (!file.path) {
    return {};
  }

  const source = fs.readFileSync(file.path, 'utf8');
  const transformed = skipRunner(skipTransforms, file) ? source : transformRunner(transform, source, file);
  const deps = skipRunner(skipDependencies, file) ? [] : pulldeps.fromSource(transformed).dependencies;

  if (includeSource) {
    return {
      source,
      transformed,
      deps
    };
  }
  else {
    return {
      deps
    };
  }
};

function toFileObject(file) {
  return typeof file === 'string' ? {
    path: file,
    name: file
  } : {
    name: file.name,
    path: file.path
  };
}

module.exports = processFiles;
module.exports.build = build;
