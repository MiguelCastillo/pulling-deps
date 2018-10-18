module.exports = function skipRunner(skips, item, referrer) {
  return skips ? skips.some(s => s(item, referrer)) : false;
};
