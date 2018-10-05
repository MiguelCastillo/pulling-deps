module.exports = function transformRunner(transform, source, file) {
  return transform ? transform.reduce((result, t) => t(result, file), source) : source;
};
