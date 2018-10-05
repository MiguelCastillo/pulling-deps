const path = require('path');
const resolve = require('resolve');
const resolverRunner = require('./resolverRunner');
const trimPath = require('./trimPath');

module.exports = function resolveDependencies(dependencies, referrer, resolver) {
  return dependencies.map((dep) => Object.assign({ path: resolveDependency(dep, referrer, resolver)}, dep));
}

function resolveDependency(dependency, referrer, resolver) {
  const transformedPath = resolverRunner(resolver, dependency.name, referrer);
  const resolvedPath = resolve.sync(transformedPath, { basedir: getDirectory(referrer) });

  // If the path looks like it is a local file and not a node_module, then we
  // skip the nmr process as an optimization step.
  ///(/^([.]|\/)+[\w]+/.test(transformedPath)) ?
  //path.resolve(getDirectory(referrer), transformedPath) :
  //resolve.sync(transformedPath, { basedir: getDirectory(referrer) });

  return trimPath(resolvedPath);
}

function getDirectory (path) {
  return path && path.replace(/([^/]+)$/gm, '');
}
