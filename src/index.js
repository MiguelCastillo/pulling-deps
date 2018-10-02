const utils = require('belty');
const walk = require('acorn-walk');
const dynamicImportPlugin = require('acorn-dynamic-import').default;
const acorn = require('acorn').Parser.extend(dynamicImportPlugin);

const TokenTypes = {
  Identifier: 'Identifier',
  Literal: 'Literal',
  ArrayExpression: 'ArrayExpression',
  ImportDeclaration: 'ImportDeclaration',
  ImportExpression: 'Import'
};

const TokenNames = {
  define: 'define',
  require: 'require'
};

function isArrayExpession (node) {
  return node && TokenTypes.ArrayExpression === node.type;
}

function nameEquals (node, name) {
  return TokenTypes.Identifier === node.type && name === node.name;
}

function getDependencyString (nodes) {
  return (
    nodes
      .filter(node => node.type === TokenTypes.Literal)
      .map(node => node.value)
  );
}

function getAMDDependencies (nodes) {
  var deps = (
    isArrayExpession(nodes[0]) ? nodes[0].elements : // Handle things like define([], function() {}) format
    isArrayExpession(nodes[1]) ? nodes[1].elements : [] // Handle things define("modulename", [], function() {}) format
  );

  return deps.map(function (dep) {
    return dep.value;
  });
}

function buildDependencyData (name, type, dynamic) {
  return {
    name: name,
    dynamic: !!dynamic,
    type: type
  };
}

function ESMDependencyDynamic (name) {
  return buildDependencyData(name, 'ESM', true);
}

function ESMDependencyStatic (name) {
  return buildDependencyData(name, 'ESM', false);
}

function CJSDependency (name) {
  return buildDependencyData(name, 'CJS', false);
}

function AMDDependency (name) {
  return buildDependencyData(name, 'AMD', true);
}

/**
 * Method to pull dependencies from a JavaScript source string
 *
 * @param {string | buffer} source - Source to pull dependencies from.
 * @param {objecy} options - Options for processing dependencies as well as acorn options.
 *
 * @returns {object:{array: dependencies}} - Object with dependencies
 */
function PullDeps (source, options) {
  return PullDeps.fromSource(source, options);
}

/**
 * Method to pull dependencies from a JavaScript source string
 *
 * @param {string | buffer} source - Source to pull dependencies from.
 * @param {objecy} options - Options for processing dependencies as well as acorn options.
 *
 * @returns {object:{array: dependencies}} - Object with dependencies
 */
PullDeps.fromSource = function (source, options) {
  options = utils.merge({
    esm: true,
    cjs: true,
    amd: true,
    options: {
      sourceType: 'module',
      plugins: { dynamicImport: true }
    }
  }, options);

  return PullDeps.fromAST(acorn.parse(source.toString(), options.options), options);
};

/**
 * Method to pull dependencies from an AST.
 *
 * @param {object} ast - AST to traverse in order to find all dependencies.
 *
 * @returns {object:{array: dependencies}} - Object with dependencies
 */
PullDeps.fromAST = function (ast, options) {
  var dependencies = [];
  var esm = options.esm;
  var cjs = options.cjs;
  var amd = options.amd;

  function callExpression (node) {
    var deps;

    if (esm && node.callee.type === TokenTypes.ImportExpression) {
      deps = getDependencyString(node.arguments).map(ESMDependencyDynamic);
    }
    else if (cjs && nameEquals(node.callee, TokenNames.require)) {
      deps = getDependencyString(node.arguments).map(CJSDependency);
    }
    else if (amd && nameEquals(node.callee, TokenNames.define)) {
      deps = getAMDDependencies(node.arguments).map(AMDDependency).filter(function (dep) {
        return dep.name !== 'require' && dep.name !== 'exports' && dep.name !== 'module';
      });
    }

    if (deps && deps.length) {
      dependencies = dependencies.concat(deps);
    }
  }

  function importDeclaration (node) {
    if (node.source.type === TokenTypes.Literal) {
      dependencies.push(ESMDependencyStatic(node.source.value));
    }
  }

  // Fill this in to prevent the walker from throwing when processing the 'Import' node
  walk.base['Import'] = function (node, st, c) { };

  walk.simple(ast, {
    'CallExpression': callExpression,
    'ImportDeclaration': importDeclaration
  });

  return {
    dependencies: dependencies
  };
};

module.exports = PullDeps;
