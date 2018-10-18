#!/usr/bin/env node

const program = require('commander')
const processStdin = require('./processStdin');
const trimPath = require('../src/trimPath');
const makeBoolean = require('../src/makeBoolean');
const makeArray = require('../src/makeArray');
const processFiles = require('../src/processFiles');
const expandGlob = require('../src/expandGlob');
const loadPlugin = require('../src/loadPlugin');
const buildDependencyTree = require('../src/buildDependencyTree');

program
  .option('-f, --files <files>', 'String glob of files to process', expandGlob, [])
  .option('-s, --skip <skips>', 'List of plugins that determine if a file should be skipped from loading and processing entirely', loadPlugin, [])
  .option('-r, --resolver <resolvers>', 'List of resolvers that convert module names to paths pointing to actual files', loadPlugin, [])
  .option('-t, --transform <transforms>', 'List of transforms to apply to each file before processing dependencies', loadPlugin, [])
  .option('--node-modules [node_modules]', 'List of directories to consider for traversal when resolving node modules', makeArray, [])
  .option('--skip-transforms [skips]', 'List of plugins that determine if a module should go through the transform pipeline', loadPlugin, [])
  .option('--skip-dependencies [skips]', 'List of plugins that determine is a module should have its dependencies processed', loadPlugin, [])
  .option('--include-source [value]', 'Boolean flag for including the source string in the tree', makeBoolean, false)
  .parse(process.argv);

const files = program.files.concat(expandGlob(program.args)).map(trimPath);

if (process.stdin.isTTY || files.length) {
  const entries = processFiles(files, program);
  const tree = buildDependencyTree(entries, program);
  write(tree);
}
else {
  processStdin((result) => write(buildDependencyTree(result, program)), program);
}

function write(entries) {
  process.stdout.write(JSON.stringify(entries));
}
