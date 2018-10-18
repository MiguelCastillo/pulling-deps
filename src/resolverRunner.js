const trimPath = require('./trimPath');
const builtins = require('./builtins');
const resolveName = require('./resolveName');

module.exports = function resolverRunner(resolvers, {name}, referrer, nodeModules) {
  const modulePath = resolvers ? resolvers.reduce((result, t) => {
    const r = t(result, referrer);

    if (r === undefined) {
      throw new Error("Your resolver must return a string.  If for some reason your resolver can't process the module name, then just return the name as is.");
    }

    return r;
  }, name) : name;

  return trimPath(resolveName(modulePath, referrer, nodeModules));
};
