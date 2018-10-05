const CWD = process.cwd();

module.exports = function trimPath(path, basedir) {
  return path && path.replace((basedir || CWD) + '/', '');
}
