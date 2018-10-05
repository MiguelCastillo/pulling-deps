module.exports = function makeBoolean (value) {
  return value === 'true' ? true : value === 'false' ? false : !!value;
};
