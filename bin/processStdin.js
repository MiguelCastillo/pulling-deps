const path = require('path');
const pulldeps = require('../src/index');

module.exports = function processStream (cb, includeSource) {
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
      const deps = pulldeps.fromSource(source).dependencies;

      result[cwd] = { deps: deps };

      if (includeSource) {
        result[cwd].source = source;
      }

      cb(result);
    });
}
