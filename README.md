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

To run the cli command directly in your console, you will need to install pulling-deps globally.  Alternatively, you can create npm scripts in your package json, or use npx.  Running npm scripts or npx are the preferred methods for using the CLI.


### `pull-deps` which will extract the dependencies in the files you specify

```
$ pull-deps src/*.js
```

```
$ echo "import('./src/index.js')" | pull-deps
```

### `pull-vendor` which will extract only node module dependencies

```
$ pull-vendor src/*.js
```

```
$ echo "import('./src/index.js')" | pull-vendor
```

### `pull-tree` which will generate a flat map of all the dependencies

```
$ pull-tree src/*.js
```

```
$ echo "import('./src/index.js')" | pull-tree
```


## api

### pullDeps.fromSource
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

### pullDeps.fromAST
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
