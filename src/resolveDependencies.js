const resolverRunner = require('./resolverRunner');
const skipRunner = require('./skipRunner');
const builtins = require('./builtins');

module.exports = function resolveDependencies(dependencies, referrer, options) {
  const {resolver, skip} = options;

  return dependencies
    .map((dependency) => {
      const {name} = dependency;
      const {nodeModules} = options;

      if (skipRunner(skip, name, referrer) || builtins[name]) {
        return dependency;
      }

      return Object.assign({
        path: resolverRunner(resolver, dependency, referrer, nodeModules)
      }, dependency)
    });
}
