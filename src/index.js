var utils = require('belty');
var acorn = require('acorn');
var walk  = require('acorn/dist/walk');


var TokenTypes = {
  _define          : 'define',
  _require         : 'require',
  Identifier       : 'Identifier',
  Literal          : 'Literal',
  ArrayExpression  : 'ArrayExpression',
  ImportDeclaration: 'ImportDeclaration'
};


function isArrayExpession(node) {
  return node && TokenTypes.ArrayExpression === node.type;
}


function isName(node, name) {
  return TokenTypes.Identifier === node.type && name === node.name;
}


function getDependencyString(nodes) {
  if (nodes.length === 1 && TokenTypes.Literal === nodes[0].type) {
    return nodes[0].value;
  }
}


function getDependencyArray(nodes) {
  var elements, i, length;

  // Handle define([], function() {}) format
  if (isArrayExpession(nodes[0])) {
    elements = nodes[0].elements;
  }
  // Handle define("modulename", [], function() {}) format
  else if (isArrayExpession(nodes[1])) {
    elements = nodes[1].elements;
  }

  if (elements) {
    for (i = 0, length = elements.length; i < length; i++) {
      elements[i] = elements[i].value;
    }
  }

  return elements;
}


/**
 * Method to pull dependencies from a JavaScript source string.
 *
 * @param {string} source - Source to parse
 * @param {object} options - Options passed to acorn
 *
 * @returns {object:{array: dependencies}} - Object with dependencies
 */
function PullDeps(source, options) {
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
PullDeps.walk = function(ast, options) {
  var dependencies = [];

  function callExpression(node) {
    if (options.cjs && isName(node.callee, TokenTypes._require)) {
      var dependency = getDependencyString(node.arguments);
      if (dependency) {
        dependencies.push(dependency);
      }
    }
    else if (options.amd && isName(node.callee, TokenTypes._define)) {
      var deps = getDependencyArray(node.arguments);
      if (deps && deps.length) {
        dependencies = dependencies.concat(deps);
      }
    }
  }

  function importStatement(node) {
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
