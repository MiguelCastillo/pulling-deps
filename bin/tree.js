#!/usr/bin/env node

const program = require('commander')
const processStdin = require('./processStdin');
const trimPath = require('../src/trimPath');
const makeBoolean = require('../src/makeBoolean');
const makeArray = require('../src/makeArray');
const processFiles = require('../src/processFiles');
const resolveGlob = require('../src/resolveGlob');
const loadPlugin = require('../src/loadPlugin');
const buildDependencyTree = require('../src/buildDependencyTree');

program
  .option('-f, --files <items>', 'String glob of files to process', resolveGlob, [])
  .option('-s, --source [value]', 'Boolean flag for including the source string in the tree', makeBoolean, false)
  .option('-r, --resolver <resolver>', 'List of resolvers that convert module names to paths pointing to actual files', loadPlugin, [])
  .option('-t, --transform <transform>', 'List of transforms to apply to each file before processing dependencies', loadPlugin, [])
  .option('-i, --ignore <ignore>', 'List of ignore processor to determine what is excluded from the processing pipeline', loadPlugin, [])
  .parse(process.argv);

const files = program.files.concat(resolveGlob(program.args, []));

if (files.length) {
  write(buildDependencyTree(processFiles(files.map(trimPath), program.transform), program));
}
else {
  processStdin((result) => write(buildDependencyTree(result, program)), program.transform);
}

function write(entries) {
  process.stdout.write(JSON.stringify(entries));
}
