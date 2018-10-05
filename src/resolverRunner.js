module.exports = function resolverRunner(resolver, name, referrer) {
  return resolver ? resolver.reduce((result, t) => t(result, referrer), name) : name;
};
