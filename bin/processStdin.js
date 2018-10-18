const path = require('path');
const transformRunner = require('../src/transformRunner');
const pulldeps = require('../src/index');

module.exports = function processStream (cb, {includeSource, tranform}) {
  var source = '';

  process.stdin
    .setEncoding('utf8')
    .on('readable', () => {
      var chunk;
      while ((chunk = process.stdin.read())) {
        source += chunk;
      }
    })
    .on('end', () => {
      const result = {};
      const cwd = path.join(process.cwd(), '/');
      const transformedSource = transformRunner(tranform, source);
      const deps = pulldeps.fromSource(transformedSource).dependencies;

      result[cwd] = { deps: deps };

      if (includeSource) {
        result[cwd].source = source;
      }

      cb(result);
    });
}
