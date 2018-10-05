#!/usr/bin/env node

const program = require('commander')
const processStdin = require('./processStdin');
const trimPath = require('../src/trimPath');
const makeBoolean = require('../src/makeBoolean');
const makeArray = require('../src/makeArray');
const processFiles = require('../src/processFiles');
const resolveGlob = require('../src/resolveGlob');
const loadPlugin = require('../src/loadPlugin');
const resolveDependencies = require('../src/resolveDependencies');

const INDENT = 2;

program
  .option('-f, --files <items>', 'String glob of files to process', resolveGlob, [])
  .option('-s, --source [value]', 'Boolean flag for including the source string in the tree', makeBoolean, false)
  .option('-r, --resolver <resolver>', 'List of resolvers that convert module names to paths pointing to actual files', loadPlugin, [])
  .option('-t, --transform <transform>', 'List of transforms to apply to each file before processing dependencies', loadPlugin, [])
  .option('-i, --ignore <ignore>', 'List of ignore processor to determine what is excluded from the processing pipeline', loadPlugin, [])
  .parse(process.argv);

const files = program.files.concat(resolveGlob(program.args, []));

if (files.length) {
  write(buildTree(processFiles(files.map(trimPath), program.transform)));
}
else {
  processStdin((result) => write(buildTree(result)), program.transform);
}

function buildTree (nodes) {
  const visited = {};
  const result = Object.assign({}, nodes);
  var stack = Object.keys(nodes).map(n => ({path: n}));

  for (var index = 0; index < stack.length; index++) {
    var stackItem = stack[index];
    const referrer = stack[stackItem.referrerIndex];
    const fullPath = stackItem.path;

    // Item has already been processed. No need to process again.
    if (visited[fullPath]) {
      result[fullPath].referrer[referrer.path] = true;
      continue;
    }
    else if (!result[fullPath]) {
      // This means we failed to process a file... So we will skip it.
      continue;
    }
    else {
      result[fullPath].referrer = referrer ? {
        [referrer.path]: true
      } : {};
    }

    // Tag so that we dont process this file again since processing the same
    // file again will produce the same results...
    visited[fullPath] = true;

    var deps;

    // 1. Resolve dependencies to fully qualified names so that we load them
    // and processes them.
    try {
      deps = resolveDependencies(result[fullPath].deps,
        fullPath,
        program.resolver);

      // Add the dependencies early to the stack to that we can do more easily
      // build the tree of what is currently being processed in case a failure
      // occurs when processing the dependencies in the next step.
      stack = stack.concat(deps.map(dep => ({
        path: dep.path,
        referrerIndex: index
      })));
    }
    catch(e) {
      console.error('[PULLING-DEPS]', buildTreeFromNode(stack, stackItem).map((a, i) => ' '.repeat(i * INDENT) + a.path).join('\n'));
      console.error(e.stack);
      continue;
    }

    // 2. Process all dependencies... One at a time, skipping those deps
    // that have already been processed previously.
    deps.forEach((dep, i) => {
      try {
        // Parse file for all the data we need.
        if (!result[dep.path]) {
          result[dep.path] = processFiles.build(dep, program.transform, program.ignore);
        }
      }
      catch(e) {
        const item = stack[stack.length - deps.length + i];
        console.error('[PULLING-DEPS]', buildTreeFromNode(stack, item).map((a, i) => ' '.repeat(i * INDENT) + a.path).join('\n'));
        console.error(e.stack);
      }
    });
  }

  // Make sure we tag the root modules.
  Object.keys(nodes).forEach(i => (result[i].entry = true));
  return result;
}

function buildTreeFromNode(stack, stackItem) {
  var dependencyStack = [stackItem];

  for(var i = 0; i < dependencyStack.length; i++) {
    if (stack[dependencyStack[i].referrerIndex]) {
      dependencyStack.push(stack[dependencyStack[i].referrerIndex]);
    }
  }

  return dependencyStack.reverse();
}

function write(entries) {
  process.stdout.write(JSON.stringify(entries));
}
