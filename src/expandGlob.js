const glob = require('glob');

module.exports = function expandGlob(values, items) {
  const allPaths = [].concat(values).map(value => glob.sync(value, { cwd: process.cwd(), realpath: true }));
  return (items || []).concat(flatten(allPaths));
};

function flatten(items) {
  return items.reduce((acc, item) => acc.concat(item), []);
}
