/**
 * Module to extract dependencies from define and require statments
 */
(function() {
  'use strict';


  var TokenTypes = {
    _define         : 'define',
    _require        : 'require',
    Identifier      : 'Identifier',
    Literal         : 'Literal',
    ArrayExpression : 'ArrayExpression'
  };


  var acorn = require('acorn'),
      walk  = require('acorn/util/walk');

  function PullDeps(source, options) {
    return PullDeps.walk(acorn.parse(source, options));
  }

  PullDeps.walk = function(ast) {
    var result = {dependencies: []};

    walk.simple(ast, {
      'CallExpression': function callExpression(node) {
        if (isName(node.callee, TokenTypes._require)) {
          if (isDependencyString(node.arguments)) {
            result.dependencies.push(node.arguments[0].value);
          }
        }
        else if (isName(node.callee, TokenTypes._define)) {
          var dependencies = getDependencyArray(node.arguments);
          if (dependencies && dependencies.length) {
            result.dependencies = result.dependencies.concat(dependencies);
          }
        }
      }
    });

    return result;
  };


  function isName(node, name) {
    return TokenTypes.Identifier === node.type && name === node.name;
  }


  function isDependencyString(node) {
    return node.length === 1 && TokenTypes.Literal === node[0].type;
  }


  function getDependencyArray(nodes) {
    var elements, i, length;
    if (nodes[0] && nodes[0].type === TokenTypes.ArrayExpression) {
      elements = nodes[0].elements;
    }
    else if (nodes[1] && nodes[1].type === TokenTypes.ArrayExpression) {
      elements = nodes[1].elements;
    }

    if (elements) {
      for (i = 0, length = elements.length; i < length; i++) {
        elements[i] = elements[i].value;
      }
    }

    return elements;
  }


  module.exports = PullDeps;
})();
