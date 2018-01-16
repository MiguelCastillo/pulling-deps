const fs = require('fs');
const pulldeps = require('../src/index');

module.exports = function processFiles (files, includeSource) {
  return files.reduce((accumulator, file) => {
    const source = fs.readFileSync(file, 'utf8');
    const deps = pulldeps.fromSource(source).dependencies;
    accumulator[file] = { deps: deps };

    if (includeSource) {
      accumulator[file].source = source;
    }

    return accumulator;
  }, {});
}
