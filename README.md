# pulling-deps

[![Greenkeeper badge](https://badges.greenkeeper.io/MiguelCastillo/pulling-deps.svg)](https://greenkeeper.io/)
[![Build Status](https://travis-ci.org/MiguelCastillo/pulling-deps.svg)](https://travis-ci.org/MiguelCastillo/pulling-deps)

> Pull CJS require, AMD define, as well as ESM dynamic and static imports.

pulling-deps accomplishes this by building and traversing an AST leveraging [acorn](http://marijnhaverbeke.nl/acorn/).

# usage

## install

### npm
```
npm install pulling-deps
```

## cli

pulling-deps comes with a small cli that prints all the dependencies in a JavaScript file. The focus is on printing modules that are processed as node module dependencies.  E.g. `require('path')` vs `require('./index.js')`.

> The cli will remove duplicate dependencies from the output


### extracts dependencies from a file. You can pass multiple files

```
$ jsdeps -f src/*.js
```

### pipe file content

```
$ cat src/*.js | jsdeps
```

### npm install dependencies in a file

```
$ npm install --save `jsdeps -f src/*.js`
```


## api

### pullDeps
is a method that takes in a JavaScript string source as the first parameter, and an optional object as the second paramter.  The second parameter is an object that is pass straight to [acorn](http://marijnhaverbeke.nl/acorn/).

```javascript
const pullDeps = require('pullig-deps');

// This gets us an object that has a property `dependencies`, which is an array
// of all the dependencies found.
const result = pullDeps.fromSource(`
  import a from "esmdep";
  const b = require("cjsdep");
  import("dynamicESM");
`);

// Print to console the dependencies, which will have `esmdep`, `cjsdep`, and `dynamicESM`.
console.log(result.dependencies);
```

### pullDeps.walk
is a method that takes in as its only parameter an AST as created by acorn.

```javascript
const acorn = require('acorn-dynamic-import/lib/inject').default(require('acorn'));
const pullDeps = require('pulling-deps');

// Walk the AST to get all the dependencies out
const result = pullDeps.fromAST(acorn(`
  import a from "esmdep";
  const b = require("cjsdep");
  import("dynamicESM");
`));

// Print to console the dependencies, which will have `esmdep`, `cjsdep`, and `dynamicESM`.
console.log(result.dependencies);
```


## build
```
grunt build
```

## test
```
grunt test
```

# License
MIT
