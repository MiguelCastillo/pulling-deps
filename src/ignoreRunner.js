module.exports = function ignoreRunner(ignore, name) {
  return ignore && ignore.some(t => t(name));
};
