var utils = require('belty');
var acorn = require('acorn');
var walk = require('acorn/dist/walk');

var TokenTypes = {
  Identifier: 'Identifier',
  Literal: 'Literal',
  ArrayExpression: 'ArrayExpression',
  ImportDeclaration: 'ImportDeclaration'
};

var TokenNames = {
  _define: 'define',
  _require: 'require'
};

function isArrayExpession (node) {
  return node && TokenTypes.ArrayExpression === node.type;
}

function isName (node, name) {
  return TokenTypes.Identifier === node.type && name === node.name;
}

function getDependencyString (nodes) {
  if (nodes.length === 1 && TokenTypes.Literal === nodes[0].type) {
    return nodes[0].value;
  }
}

function getDependencyArray (nodes) {
  var deps = (
    isArrayExpession(nodes[0]) ? nodes[0].elements : // Handle things like define([], function() {}) format
    isArrayExpession(nodes[1]) ? nodes[1].elements : [] // Handle things define("modulename", [], function() {}) format
  );

  return deps.map(function (dep) {
    return dep.value;
  });
}

/**
 * Method to pull dependencies from a JavaScript source string.
 *
 * @param {string} source - Source to parse
 * @param {object} options - Options passed to acorn
 *
 * @returns {object:{array: dependencies}} - Object with dependencies
 */
function PullDeps (source, options) {
  options = utils.merge({
    cjs: true,
    amd: true,
    options: {
      sourceType: 'module'
    }
  }, options);

  // Make sure we search for require statements before we go in and tear things apart.
  // if (source && /require\s*\(['"\s]+([^'"]+)['"\s]+\)\s*/g.test(source)) {
  //   dependencies = PullDeps.walk(acorn.parse(source, options.options), options);
  // }

  return {
    dependencies: PullDeps.walk(acorn.parse(source, options.options), options)
  };
}

/**
 * Method to pull dependencies from an AST.
 *
 * @param {object} ast - AST to traverse in order to find all dependencies.
 *
 * @returns {object:{array: dependencies}} - Object with dependencies
 */
PullDeps.walk = function (ast, options) {
  var dependencies = [];

  function callExpression (node) {
    var deps;

    if (options.cjs && isName(node.callee, TokenNames._require)) {
      deps = getDependencyString(node.arguments);
    }
    else if (options.amd && isName(node.callee, TokenNames._define)) {
      deps = getDependencyArray(node.arguments);
    }

    if (deps && deps.length) {
      dependencies = dependencies.concat(deps);
    }
  }

  function importStatement (node) {
    if (node.source.type === TokenTypes.Literal) {
      dependencies.push(node.source.value);
    }
  }

  walk.simple(ast, {
    'CallExpression': callExpression,
    'ImportDeclaration': importStatement
  });

  return dependencies;
};

module.exports = PullDeps;
