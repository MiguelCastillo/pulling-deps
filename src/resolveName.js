const path = require('path');
const resolve = require('resolve');

module.exports = function resolveName(name, referrer, nodeModules) {
  // if the path is absolute, then we dont need to process this anymore...
  // Just return as is.
  if (path.isAbsolute(name)) {
    return name;
  }
  else {
    if (/^([.]|\/)+[\w]+/.test(name)) {
      return resolve.sync(name, {basedir: getDirectory(referrer)});
    }
    else {
      const moduleDirectory = nodeModules && nodeModules.length ? nodeModules : ["node_modules"];
      return resolve.sync(name, {basedir: process.cwd(), moduleDirectory});
    }
  }
};

function getDirectory (path) {
  return path && path.replace(/([^/]+)$/gm, '');
}
