const glob = require('glob');

module.exports = function expandGlob(value, items) {
  return (items || []).concat([]
    .concat(value)
    .reduce((acc, val) => acc.concat(glob.sync(val, { cwd: process.cwd(), realpath: true })), [])
  );
};
