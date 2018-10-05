const resolve = require('resolve');

module.exports = function loadPlugin(value, arr) {
    const modulePath = resolve.sync(value, {basedir: process.cwd()});
    return typeof value === 'string' ? arr.concat(require(modulePath)) : arr;
};
