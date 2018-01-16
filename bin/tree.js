#!/usr/bin/env node

const program = require('commander')
const resolve = require('resolve');
const processStdin = require('./processStdin');
const processFiles = require('./processFiles');
const resolveGlob = require('./resolveGlob');
const makeBoolean = require('./makeBoolean');

program
  .option('-f, --files <items>', 'String glob of files to process', resolveGlob, [])
  .option('-s, --source [value]', 'Boolean flag for including the source string in the tree', makeBoolean, false)
  .parse(process.argv);

const files = program.files.concat(resolveGlob(program.args, []));

if (files.length) {
  write(buildTree(processFiles(files, program.source)));
}
else {
  processStdin((result) => write(buildTree(result)), program.source);
}

function buildTree (nodes) {
  var visited = {};
  var result = Object.assign({}, nodes);
  var paths = Object.keys(nodes);
  var index = 0;

  for (; index < paths.length; index++) {
    var fullPath = paths[index];

    if (visited[fullPath]) {
      continue;
    }

    visited[fullPath] = true;

    var resolvedDependencies = result[fullPath].deps = resolveDependencies(result[fullPath].deps, fullPath);
    var newNodes = processFiles(resolvedDependencies.map(node => node.path), program.source);
    paths = paths.concat(Object.keys(newNodes));
    Object.assign(result, newNodes);
  }

  // Make sure we tag the root modules.
  Object.keys(nodes).forEach(item => (result[item].entry = true));
  return result;
}

function resolveDependencies (dependencies, referrer) {
  return dependencies.map((node) => Object.assign({ path: resolve.sync(node.name, { basedir: getDirectory(referrer) }) }, node));
}

function getDirectory (path) {
  return path && path.replace(/([^/]+)$/gm, '');
}

function write (entries) {
  process.stdout.write(JSON.stringify(entries));
}
