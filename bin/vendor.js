#!/usr/bin/env node

const program = require('commander')
const processStdin = require('./processStdin');
const trimPath = require('../src/trimPath');
const processFiles = require('../src/processFiles');
const expandGlob = require('../src/expandGlob');
const makeBoolean = require('../src/makeBoolean');
const loadPlugin = require('../src/loadPlugin');

program
  .option('-f, --files <items>', 'String glob of files to process', expandGlob, [])
  .option('-s, --skip <skip>', 'List of plugins that determine if a file should be skipped from loading and processing entirely', loadPlugin, [])
  .option('-t, --transform <transform>', 'List of transforms to apply to each file before processing dependencies', loadPlugin, [])
  .option('--include-source [value]', 'Boolean flag for including the source string in the tree', makeBoolean, false)
  .parse(process.argv);

const files = program.files.concat(expandGlob(program.args)).map(trimPath);

if (process.stdin.isTTY || files.length) {
  const entries = processFiles(files, program)
  write(entries);
}
else {
  processStdin(write, program);
}

function write (entries) {
  const result = Object
    .keys(entries)
    .reduce((acc, entry) => {
      acc[entry] = Object.assign({}, entries[entry], { deps: filterVendor(entries[entry].deps) });
      return acc;
    }, {});

  process.stdout.write(JSON.stringify(result));
}

function filterVendor (dependencies) {
  return dependencies.filter((dependency) => /^[./]+/.test(dependency.name) === false);
}
